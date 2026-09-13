import sys
import json
import os
import joblib
import numpy as np

def run_prediction():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"success": False, "error": "No input payload provided"}))
            return

        raw_input = " ".join(sys.argv[1:]).strip()

        if (raw_input.startswith("'") and raw_input.endswith("'")) or (raw_input.startswith('"') and raw_input.endswith('"')):
            raw_input = raw_input[1:-1].strip()

        try:
            input_data = json.loads(raw_input)
        except Exception:
            import re
            fixed_json = re.sub(r'(\w+):', r'"\1":', raw_input)
            input_data = json.loads(fixed_json)

        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "risk_model.pkl")

        if not os.path.exists(model_path):
            print(json.dumps({"success": False, "error": f"Model file not found at {model_path}"}))
            return

        # Load pkl bundle
        loaded_data = joblib.load(model_path)

        # Extract actual model from dict
        if isinstance(loaded_data, dict):
            model = loaded_data.get("model")
            feature_names = loaded_data.get("feature_names", [])
            version = loaded_data.get("version", "1.0.0")
        else:
            model = loaded_data
            feature_names = []
            version = "1.0.0"

        # Feature mapping
        critical = float(input_data.get("critical", 0))
        major = float(input_data.get("major", 0))
        minor = float(input_data.get("minor", 0))
        days_overdue = float(input_data.get("days_overdue", 14))
        past_violations = float(input_data.get("past_violations", 2))
        facility_type = float(input_data.get("facility_type", 3))

        # Check feature count expected by trained model
        n_features = getattr(model, "n_features_in_", len(feature_names) or 6)

        if n_features == 4:
            repeat_flag = 1.0 if past_violations > 2 else 0.0
            features = np.array([[critical, major, days_overdue, repeat_flag]])
        else:
            features = np.array([[critical, major, minor, days_overdue, past_violations, facility_type]])

        probs = model.predict_proba(features)[0]
        high_risk_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        prediction = int(model.predict(features)[0])

        result = {
            "success": True,
            "is_high_risk": bool(prediction == 1 or high_risk_prob >= 0.5),
            "high_risk_probability": round(high_risk_prob, 3),
            "risk_tier": "CRITICAL / HIGH RISK" if high_risk_prob >= 0.5 else "STANDARD / LOW RISK",
            "model_version": f"RandomForestClassifier (Live .pkl v{version})",
            "features_evaluated": {
                "critical": critical,
                "major": major,
                "minor": minor,
                "days_overdue": days_overdue,
                "past_violations": past_violations,
                "facility_type": facility_type
            }
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    run_prediction()