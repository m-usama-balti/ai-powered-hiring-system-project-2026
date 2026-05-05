from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline


def main() -> None:
    # Tiny seed dataset: 5 safe + 5 spam/fake postings.
    safe_jobs = [
        "We are hiring a React Developer with 3+ years experience in JavaScript, Redux, and REST APIs.",
        "Looking for a Data Analyst skilled in SQL, Python, and dashboard reporting for enterprise clients.",
        "Seeking Backend Engineer with Node.js and MongoDB experience for full-time onsite role.",
        "Hiring QA Automation Engineer with Selenium and CI/CD knowledge for software testing team.",
        "Need DevOps Engineer with AWS, Docker, and Kubernetes experience for production workloads."
    ]

    spam_jobs = [
        "Work from home and earn $5000 per week no experience required instant payment.",
        "Urgent hiring wire transfer processing role get paid daily click now limited seats.",
        "Easy online typing job earn money fast no interview no skills needed send bank details.",
        "Guaranteed income opportunity join now and pay registration fee to unlock high salary.",
        "Immediate hiring remote assistant receive packages and forward them for commission."
    ]

    texts = safe_jobs + spam_jobs
    labels = ["safe"] * len(safe_jobs) + ["spam"] * len(spam_jobs)

    model = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english")),
        ("clf", MultinomialNB())
    ])

    model.fit(texts, labels)

    output_path = Path(__file__).resolve().parent / "spam_model.pkl"
    joblib.dump(model, output_path)

    print(f"Spam model trained and saved to: {output_path}")


if __name__ == "__main__":
    main()
