import requests
import json

BASE_URL = "http://localhost:5000"

scenarios = [
    {
        "name": "High Risk: Dark Night, High Crime",
        "data": {"hour": 2, "lighting_score": 1, "police_stn_dist": 8.0, "past_incidents": 40, "crowd_density": 1}
    },
    {
        "name": "Low Risk: Bright Day, Safe Area",
        "data": {"hour": 12, "lighting_score": 10, "police_stn_dist": 0.2, "past_incidents": 0, "crowd_density": 5}
    },
    {
        "name": "Medium Risk: Evening, Semi-Lit",
        "data": {"hour": 19, "lighting_score": 5, "police_stn_dist": 2.0, "past_incidents": 10, "crowd_density": 3}
    }
]

def test_ml_quality():
    print("--- ML QUALITY CHECK ---")
    for s in scenarios:
        try:
            resp = requests.post(f"{BASE_URL}/predict", json=s["data"], timeout=5)
            if resp.status_code == 200:
                result = resp.json()
                print(f"Scenario: {s['name']}")
                print(f"  Input: {json.dumps(s['data'])}")
                print(f"  Predicted Risk: {result['risk_score']}")
            else:
                print(f"FAILED {s['name']}: {resp.status_code}")
        except Exception as e:
            print(f"ERROR reaching ML service: {e}")

if __name__ == "__main__":
    test_ml_quality()
