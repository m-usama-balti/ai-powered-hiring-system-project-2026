import unittest
from pathlib import Path

import pandas as pd

from ai_matching_engine import AIMatchingEngine

BASE_DIR = Path(__file__).resolve().parent


class TestMatchingEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        required = [
            BASE_DIR / "jobs_preprocessed.csv",
            BASE_DIR / "candidates_preprocessed.csv",
            BASE_DIR / "skills_preprocessed.csv",
            BASE_DIR / "tfidf_vectorizer.pkl",
            BASE_DIR / "sentence_transformer_embeddings.pkl",
            BASE_DIR / "faiss_index.bin",
        ]
        missing = [str(p.name) for p in required if not p.exists()]
        if missing:
            raise unittest.SkipTest(
                f"Missing required artifacts: {', '.join(missing)}")
        cls.engine = AIMatchingEngine(BASE_DIR)

    def test_match_output_structure(self):
        candidate_id = str(self.engine.candidates.iloc[0]["candidate_id"])
        job_id = str(self.engine.jobs.iloc[0]["job_id"])
        result = self.engine.match_candidate_to_job_sync(candidate_id, job_id)

        self.assertIn("match_percentage", result)
        self.assertIn("missing_skills", result)
        self.assertIn("recommended_improvements", result)
        self.assertIn("ai_confidence_score", result)

    def test_match_ranges(self):
        candidate_id = str(self.engine.candidates.iloc[1]["candidate_id"])
        job_id = str(self.engine.jobs.iloc[1]["job_id"])
        result = self.engine.match_candidate_to_job_sync(candidate_id, job_id)

        self.assertGreaterEqual(result["match_percentage"], 0)
        self.assertLessEqual(result["match_percentage"], 100)
        self.assertGreaterEqual(result["ai_confidence_score"], 0)
        self.assertLessEqual(result["ai_confidence_score"], 100)

    def test_vector_recommendations(self):
        sample_resume = str(self.engine.candidates.iloc[0].get(
            "combined_profile_text", ""))
        recs = self.engine.similar_resumes(sample_resume, top_k=3)
        self.assertLessEqual(len(recs), 3)


if __name__ == "__main__":
    unittest.main()
