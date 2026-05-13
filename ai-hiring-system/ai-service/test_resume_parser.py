import unittest
from pathlib import Path

import pandas as pd

from ai_matching_engine import AIMatchingEngine

BASE_DIR = Path(__file__).resolve().parent


class TestResumeParserSignals(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        required = [
            BASE_DIR / "skills_preprocessed.csv",
            BASE_DIR / "sentence_transformer_embeddings.pkl",
            BASE_DIR / "faiss_index.bin",
        ]
        missing = [str(p.name) for p in required if not p.exists()]
        if missing:
            raise unittest.SkipTest(
                f"Missing required artifacts: {', '.join(missing)}")
        cls.engine = AIMatchingEngine(BASE_DIR)

    def test_skill_extraction_from_resume_text(self):
        resume_text = (
            "Machine learning engineer with python, tensorflow, docker, kubernetes, "
            "and aws experience. Built NLP pipelines and fastapi services."
        )
        extracted = self.engine.extract_skills_from_text(resume_text)
        self.assertTrue(len(extracted) >= 3)

    def test_semantic_job_recommendation_quality(self):
        sample_job_text = (
            "Senior backend engineer with python fastapi microservices and postgresql experience"
        )
        recs = self.engine.similar_jobs(sample_job_text, top_k=5)
        self.assertLessEqual(len(recs), 5)
        if recs:
            self.assertIn("job_id", recs[0])
            self.assertIn("similarity", recs[0])


if __name__ == "__main__":
    unittest.main()
