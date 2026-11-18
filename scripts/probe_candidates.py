import httpx

candidates = [
    "notable-ai-systems-by-sector",
    "number-of-notable-ai-systems-by-sector",
    "annual-number-of-notable-ai-systems",
    "notable-ai-models-by-sector",
    "notable-ai-systems-by-affiliation",
    "artificial-intelligence-number-of-notable-systems",
    "cumulative-number-of-large-scale-ai-systems-by-country",
    "computation-used-to-train-notable-artificial-intelligence-systems",
]

for slug in candidates:
    url = f"https://ourworldindata.org/grapher/{slug}.csv?v=1&csvType=full&useColumnShortNames=false"
    try:
        r = httpx.get(url, timeout=10.0, follow_redirects=True)
        if r.status_code == 200:
            lines = r.text.splitlines()
            print(f"[FOUND] {slug} -> Status 200, {len(lines)} lines, Header: {lines[0] if lines else ''}")
        else:
            print(f"[{r.status_code}] {slug}")
    except Exception as e:
        print(f"[ERR] {slug}: {e}")
