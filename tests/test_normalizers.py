"""
tests/test_normalizers.py
─────────────────────────
Tests for data normalization functions: dates, titles, abstracts, names.
"""

from src.cleaning.normalizers import (
    normalize_date,
    infer_date_precision,
    normalize_title,
    normalize_abstract,
    reconstruct_abstract_from_inverted_index,
    normalize_author_name,
)


def test_normalize_date_formats():
    assert normalize_date("2023") == "2023"
    assert normalize_date("2023-6") == "2023-06"
    assert normalize_date("2023-06-15") == "2023-06-15"
    assert normalize_date("2023/06/15") == "2023-06-15"
    assert normalize_date("2023-06-15T12:00:00Z") == "2023-06-15"
    assert normalize_date("") is None
    assert normalize_date(None) is None
    assert normalize_date("unparseable-gibberish") is None


def test_infer_date_precision():
    assert infer_date_precision("2023") == "year"
    assert infer_date_precision("2023-06") == "month"
    assert infer_date_precision("2023-06-15") == "day"
    assert infer_date_precision(None) == "unknown"


def test_normalize_title_and_whitespace():
    assert normalize_title("  Attention Is All   You Need  \n") == "Attention Is All You Need"
    assert normalize_title("") is None
    assert normalize_title(None) is None


def test_reconstruct_abstract_from_inverted_index():
    index = {
        "Attention": [0],
        "is": [1],
        "all": [2],
        "you": [3],
        "need": [4],
    }
    abstract = reconstruct_abstract_from_inverted_index(index)
    assert abstract == "Attention is all you need"
    assert reconstruct_abstract_from_inverted_index({}) is None
    assert reconstruct_abstract_from_inverted_index(None) is None


def test_normalize_author_name():
    assert normalize_author_name("  Yann   LeCun  ") == "Yann LeCun"
    # Accents are preserved
    assert normalize_author_name("Yoshua Bengio") == "Yoshua Bengio"
    assert normalize_author_name("") is None
