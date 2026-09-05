#!/usr/bin/env python3
import json
import sys
from datetime import datetime, timezone


def parse_date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except Exception:
        return None


def score_lead(lead):
    value = float(lead.get("value", 0) or 0)
    stage = str(lead.get("stage", "")).lower()
    lead_score = float(lead.get("lead_score", lead.get("leadScore", 0)) or 0)

    last_updated = lead.get("last_updated", lead.get("lastUpdated", ""))
    updated_at = parse_date(last_updated)
    now = datetime.now(timezone.utc)
    age_days = 0
    if updated_at is not None:
        age_days = max(0, (now - updated_at.replace(tzinfo=timezone.utc)).days)

    stage_weight = {
        "won": 18,
        "proposal": 15,
        "qualified": 12,
        "contacted": 8,
        "new": 3,
        "lost": -20,
    }.get(stage, 0)
    value_weight = min(25, value / 20000)
    lead_score_weight = lead_score * 35
    recency_weight = max(0, 10 - (age_days / 7))

    total = round(min(100, max(0, 10 + stage_weight + value_weight + lead_score_weight + recency_weight)))

    if total >= 80:
        prediction = "high_priority"
    elif total >= 60:
        prediction = "warm"
    else:
        prediction = "watchlist"

    reasons = []
    if value >= 500000:
        reasons.append("high deal value")
    if lead_score >= 0.7:
        reasons.append("strong qualification score")
    if stage in {"proposal", "qualified"}:
        reasons.append("active sales momentum")
    elif stage == "new":
        reasons.append("fresh opportunity")
    if age_days <= 5:
        reasons.append("recent activity")

    reason = ", ".join(reasons) if reasons else "steady pipeline signal"

    return {
        "id": lead.get("id"),
        "company": lead.get("company", "Unknown"),
        "name": lead.get("name", "Opportunity"),
        "score": total,
        "prediction": prediction,
        "reason": reason,
    }


def main():
    raw = sys.stdin.read().strip()
    if not raw:
        payload = {
            "summary": {
                "focusMessage": "No lead data was supplied, so the AI model is waiting for CRM data.",
                "predictedWinRate": 0.35,
                "topOpportunityCount": 0,
                "highlightLabel": "Waiting for pipeline",
            },
            "insights": [],
            "model": {"name": "crm-lead-priority-scoring", "version": "1.0"},
        }
        print(json.dumps(payload))
        return

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(json.dumps({"error": "invalid_json", "message": str(exc)}))
        return

    leads = data.get("leads", []) or []
    if not leads:
        payload = {
            "summary": {
                "focusMessage": "The CRM pipeline is empty right now, so the AI model has no leads to score.",
                "predictedWinRate": 0.35,
                "topOpportunityCount": 0,
                "highlightLabel": "No leads available",
            },
            "insights": [],
            "model": {"name": "crm-lead-priority-scoring", "version": "1.0"},
        }
        print(json.dumps(payload))
        return

    scored = [score_lead(lead) for lead in leads]
    ranked = sorted(scored, key=lambda item: item["score"], reverse=True)[:5]

    top = ranked[0] if ranked else None
    predicted_win_rate = round(min(0.95, 0.35 + (sum(item["score"] for item in ranked[:3]) / 300)), 2)

    payload = {
        "summary": {
            "focusMessage": (
                f"AI is prioritizing {top['name']} from {top['company']} as the best next action."
                if top else "The AI model is ready and waiting for fresh pipeline data."
            ),
            "predictedWinRate": predicted_win_rate,
            "topOpportunityCount": len(ranked),
            "highlightLabel": "Best next action" if top else "Model ready",
        },
        "insights": ranked,
        "model": {"name": "crm-lead-priority-scoring", "version": "1.0"},
    }
    print(json.dumps(payload))


if __name__ == "__main__":
    main()
