from pathlib import Path

import pandas as pd

from ai_pipeline_utils import (
    build_semantic_text,
    configure_logging,
    deduplicate_dataframe,
    load_spacy_model,
    load_stop_words,
    normalize_skill_list,
    normalize_text,
    remove_stopwords_and_lemmatize,
)

BASE_DIR = Path(__file__).resolve().parent
INPUT_PATH = BASE_DIR / "skills.csv"
OUTPUT_PATH = BASE_DIR / "skills_preprocessed.csv"


def preprocess_skills(input_path: Path = INPUT_PATH, output_path: Path = OUTPUT_PATH) -> pd.DataFrame:
    configure_logging()
    df = pd.read_csv(input_path, encoding="utf-8")

    text_columns = ["skill_name", "category",
                    "subcategory", "difficulty", "related_skills"]
    for col in text_columns:
        if col not in df.columns:
            df[col] = ""
        df[col] = df[col].fillna("").astype(str).map(normalize_text)

    if "demand_score" not in df.columns:
        df["demand_score"] = 0.0
    df["demand_score"] = pd.to_numeric(
        df["demand_score"], errors="coerce").fillna(0.0)

    df["related_skills"] = df["related_skills"].map(normalize_skill_list)
    df = deduplicate_dataframe(df, ["skill_name", "category", "subcategory"])

    df["skill_text"] = df.apply(
        lambda r: build_semantic_text([
            r["skill_name"], r["category"], r["subcategory"], r["difficulty"], r["related_skills"]
        ]),
        axis=1,
    )

    nlp = load_spacy_model()
    stop_words = load_stop_words()
    df["skill_tokens_lemmas"] = df["skill_text"].map(
        lambda t: remove_stopwords_and_lemmatize(t, nlp, stop_words))

    df.to_csv(output_path, index=False, encoding="utf-8")
    return df


if __name__ == "__main__":
    data = preprocess_skills()
    print(f"skills_preprocessed.csv created with {len(data)} rows")
