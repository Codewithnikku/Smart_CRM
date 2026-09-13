import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "lead_insights.py"


class LeadInsightsTests(unittest.TestCase):
    def test_scores_leads_and_returns_summary(self):
        payload = {
            "leads": [
                {
                    "id": "l1",
                    "name": "Enterprise API License",
                    "company": "Tecnova",
                    "stage": "proposal",
                    "value": 600000,
                    "leadScore": 0.8,
                    "lastUpdated": "2026-08-02T10:15:00Z",
                }
            ]
        }
        completed = subprocess.run(
            [sys.executable, str(SCRIPT)],
            input=json.dumps(payload).encode("utf-8"),
            cwd=str(ROOT),
            capture_output=True,
            check=True,
        )
        result = json.loads(completed.stdout.decode("utf-8"))

        self.assertIn("summary", result)
        self.assertIn("insights", result)
        self.assertGreaterEqual(len(result["insights"]), 1)
        self.assertGreater(result["summary"]["predictedWinRate"], 0)


if __name__ == "__main__":
    unittest.main()
