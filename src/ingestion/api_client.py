"""
src/ingestion/api_client.py
────────────────────────────
A thin, reusable HTTP client for calling external APIs.

Why not use requests?
- httpx supports both sync and async usage.
- httpx has a modern interface and first-class HTTP/2 support.
- Using one client throughout the project keeps dependency count low.

Why tenacity for retries?
- External APIs (arXiv, OpenAlex, Hugging Face) can return 429 or 503.
- We want to retry with exponential back-off rather than failing the whole
  ingestion run on a transient network hiccup.
- tenacity makes the retry logic explicit and testable.

Rate-limit strategy:
- arXiv: recommend ≥3 s between requests.
- OpenAlex: polite pool is ≥1 request/s; add User-Agent with email.
- Hugging Face Hub: no strict published limit for metadata reads.
- We default to a 1.5-second inter-request delay and let the caller override.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger(__name__)

# Default headers for polite API usage
_DEFAULT_HEADERS = {
    "User-Agent": (
        "AI-Evolution-Map/0.1 "
        "(portfolio project; contact via GitHub) "
        "httpx/0.27"
    )
}

# Errors worth retrying
_RETRYABLE_STATUS = {429, 500, 502, 503, 504}


class APIError(Exception):
    """Raised when an API call fails permanently (after retries)."""

    def __init__(self, message: str, status_code: Optional[int] = None, url: str = ""):
        super().__init__(message)
        self.status_code = status_code
        self.url = url


def _is_retryable(exc: BaseException) -> bool:
    """Return True for transient errors that should trigger a retry."""
    if isinstance(exc, httpx.TimeoutException):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code in _RETRYABLE_STATUS
    return False


class RateLimitedClient:
    """
    Synchronous HTTP client with automatic retries and inter-request delay.

    Usage example in a notebook:
    ─────────────────────────────
        from src.ingestion.api_client import RateLimitedClient

        client = RateLimitedClient(min_delay_seconds=2.0)
        data = client.get("https://api.semanticscholar.org/graph/v1/paper/search",
                          params={"query": "transformer", "limit": 5})
        print(data)

    Parameters
    ----------
    min_delay_seconds : float
        Minimum seconds to wait between consecutive GET calls.
        Set higher for sources that advertise stricter rate limits.
    timeout : float
        Per-request timeout in seconds.
    extra_headers : dict | None
        Additional HTTP headers merged with defaults.
    max_retries : int
        Maximum number of retry attempts on transient errors.
    """

    def __init__(
        self,
        min_delay_seconds: float = 1.5,
        timeout: float = 30.0,
        extra_headers: Optional[dict[str, str]] = None,
        max_retries: int = 3,
    ) -> None:
        self.min_delay_seconds = min_delay_seconds
        self._last_call_time: float = 0.0

        headers = dict(_DEFAULT_HEADERS)
        if extra_headers:
            headers.update(extra_headers)

        self._client = httpx.Client(headers=headers, timeout=timeout, follow_redirects=True)
        self._max_retries = max_retries

    def _wait_if_needed(self) -> None:
        """Block until at least min_delay_seconds have passed since the last call."""
        elapsed = time.monotonic() - self._last_call_time
        wait = self.min_delay_seconds - elapsed
        if wait > 0:
            logger.debug("Rate-limit delay: sleeping %.2f s", wait)
            time.sleep(wait)
        self._last_call_time = time.monotonic()

    def get(
        self,
        url: str,
        params: Optional[dict[str, Any]] = None,
        headers: Optional[dict[str, str]] = None,
    ) -> dict[str, Any] | list[Any]:
        """
        Perform a GET request and return the parsed JSON body.

        Raises
        ------
        APIError
            When the request fails permanently (bad status, JSON decode error,
            or maximum retries exhausted).
        """
        self._wait_if_needed()

        @retry(
            retry=retry_if_exception_type(Exception),
            stop=stop_after_attempt(self._max_retries),
            wait=wait_exponential(multiplier=1, min=2, max=30),
            reraise=True,
        )
        def _attempt() -> dict[str, Any] | list[Any]:
            try:
                resp = self._client.get(url, params=params, headers=headers)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPStatusError as e:
                if e.response.status_code in _RETRYABLE_STATUS:
                    logger.warning(
                        "HTTP %s from %s — will retry.", e.response.status_code, url
                    )
                    raise  # tenacity will retry
                # Non-retryable status (e.g. 404, 403)
                raise APIError(
                    f"HTTP {e.response.status_code} from {url}",
                    status_code=e.response.status_code,
                    url=url,
                ) from e
            except httpx.TimeoutException as e:
                logger.warning("Timeout on %s — will retry.", url)
                raise  # tenacity will retry
            except Exception as e:
                raise APIError(f"Request to {url} failed: {e}", url=url) from e

        try:
            return _attempt()
        except APIError:
            raise
        except Exception as e:
            raise APIError(
                f"All {self._max_retries} retries exhausted for {url}: {e}", url=url
            ) from e

    def close(self) -> None:
        """Close the underlying HTTP session."""
        self._client.close()

    def __enter__(self) -> "RateLimitedClient":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()


def paginate_cursor(
    client: RateLimitedClient,
    url: str,
    params: dict[str, Any],
    cursor_key: str = "cursor",
    results_key: str = "results",
    next_cursor_path: tuple[str, ...] = ("meta", "next_cursor"),
    max_pages: int = 10,
) -> list[dict[str, Any]]:
    """
    Generic cursor-based pagination helper (used by OpenAlex).

    OpenAlex uses cursor pagination: you send `cursor=*` on the first call,
    then use the `meta.next_cursor` value from the response for subsequent
    calls. Stops when next_cursor is null or max_pages is reached.

    Parameters
    ----------
    client : RateLimitedClient
    url : str
        API endpoint.
    params : dict
        Base query parameters (do not include cursor — this function manages it).
    cursor_key : str
        Name of the query parameter that holds the cursor value.
    results_key : str
        Key in the response JSON that contains the list of records.
    next_cursor_path : tuple[str, ...]
        Path through the response dict to the next cursor value.
        For OpenAlex: ("meta", "next_cursor").
    max_pages : int
        Hard cap on pages fetched. Prevents runaway ingestion.

    Returns
    -------
    list[dict]
        All records collected across all pages.
    """
    all_records: list[dict[str, Any]] = []
    current_params = dict(params)
    current_params[cursor_key] = "*"  # OpenAlex convention: start with *

    for page_num in range(max_pages):
        logger.info("Fetching page %d from %s", page_num + 1, url)
        try:
            response = client.get(url, params=current_params)
        except Exception as e:
            logger.warning("Pagination interrupted on page %d: %s. Returning %d collected records.", page_num + 1, e, len(all_records))
            break

        if not isinstance(response, dict):
            logger.warning("Unexpected response type: %s", type(response))
            break

        records = response.get(results_key, [])
        all_records.extend(records)
        logger.info("  Got %d records (total so far: %d)", len(records), len(all_records))

        # Navigate to next cursor
        next_cursor: Any = response
        for key in next_cursor_path:
            if isinstance(next_cursor, dict):
                next_cursor = next_cursor.get(key)
            else:
                next_cursor = None
                break

        if not next_cursor:
            logger.info("No next cursor — pagination complete.")
            break

        current_params[cursor_key] = next_cursor

    return all_records
