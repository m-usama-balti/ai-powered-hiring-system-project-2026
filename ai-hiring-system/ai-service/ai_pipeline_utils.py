import logging
import re
import unicodedata
from pathlib import Path
from typing import Iterable, List, Set

import nltk
import pandas as pd
import spacy
from nltk.corpus import stopwords

LOGGER = logging.getLogger("ai_pipeline")

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)


def configure_logging(level: int = logging.INFO) -> None:
    if LOGGER.handlers:
        return
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    handler.setFormatter(formatter)
    LOGGER.addHandler(handler)
    LOGGER.setLevel(level)


def ensure_nltk_resources() -> None:
    resources = [
        ("corpora/stopwords", "stopwords"),
        ("tokenizers/punkt", "punkt"),
    ]
    for path_name, package in resources:
        try:
            nltk.data.find(path_name)
        except LookupError:
            nltk.download(package, quiet=True)


def load_spacy_model() -> spacy.language.Language:
    try:
        return spacy.load("en_core_web_sm", disable=["ner", "parser"])
    except Exception:
        LOGGER.warning(
            "spaCy model en_core_web_sm not found, using blank English tokenizer")
        nlp = spacy.blank("en")
        if "sentencizer" not in nlp.pipe_names:
            nlp.add_pipe("sentencizer")
        return nlp


def normalize_text(value: str) -> str:
    if not isinstance(value, str):
        value = "" if value is None else str(value)
    value = unicodedata.normalize("NFKC", value)
    value = value.strip().lower()
    value = re.sub(r"\s+", " ", value)
    return value


def safe_split_skills(value: str) -> List[str]:
    text = normalize_text(value)
    if not text:
        return []
    parts = re.split(r"[;,|/]", text)
    cleaned = [re.sub(r"[^a-z0-9.+#\-\s]", "", p).strip() for p in parts]
    return [c for c in cleaned if c]


def normalize_skill_list(value: str) -> str:
    seen = set()
    ordered = []
    for skill in safe_split_skills(value):
        token = re.sub(r"\s+", " ", skill)
        if token not in seen:
            seen.add(token)
            ordered.append(token)
    return ";".join(ordered)


def standardize_education(value: str) -> str:
    text = normalize_text(value)
    if not text:
        return "unspecified"

    mapping = {
        "bs": "bachelor",
        "bsc": "bachelor",
        "bachelors": "bachelor",
        "bachelor": "bachelor",
        "be": "bachelor",
        "ms": "master",
        "msc": "master",
        "masters": "master",
        "master": "master",
        "mba": "master",
        "phd": "phd",
        "doctorate": "phd",
        "certification": "certification",
        "certificate": "certification",
        "diploma": "diploma",
    }

    for key, normalized in mapping.items():
        if key in text:
            return normalized
    return text


def remove_stopwords_and_lemmatize(text: str, nlp: spacy.language.Language, stop_words: Set[str]) -> str:
    if not text:
        return ""

    doc = nlp(text)
    lemmas = []
    for token in doc:
        if token.is_space or token.is_punct:
            continue
        raw = normalize_text(token.text)
        if not raw or raw in stop_words:
            continue
        lemma = normalize_text(token.lemma_) if token.lemma_ else raw
        if lemma == "-pron-":
            lemma = raw
        if lemma and lemma not in stop_words:
            lemmas.append(lemma)
    return " ".join(lemmas)


def build_semantic_text(parts: Iterable[str]) -> str:
    merged = " ".join([normalize_text(p) for p in parts if p is not None])
    return re.sub(r"\s+", " ", merged).strip()


def education_score(education_value: str) -> float:
    normalized = standardize_education(education_value)
    scale = {
        "phd": 1.0,
        "master": 0.85,
        "bachelor": 0.7,
        "certification": 0.55,
        "diploma": 0.45,
        "unspecified": 0.2,
    }
    return scale.get(normalized, 0.4)


def experience_score(experience_years: float) -> float:
    try:
        years = float(experience_years)
    except Exception:
        years = 0.0
    if years <= 0:
        return 0.1
    if years >= 15:
        return 1.0
    return round(min(1.0, years / 15.0), 4)


def deduplicate_dataframe(df: pd.DataFrame, subset: List[str]) -> pd.DataFrame:
    before = len(df)
    deduped = df.drop_duplicates(
        subset=subset, keep="first").reset_index(drop=True)
    LOGGER.info("Deduplicated rows: %s -> %s", before, len(deduped))
    return deduped


def load_stop_words() -> Set[str]:
    ensure_nltk_resources()
    return set(stopwords.words("english"))
