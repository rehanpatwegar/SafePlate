"""
SafePlate ML Risk Engine - Food Safety Inspection Priority Model
Trains a Random Forest Classifier to predict high-risk food establishment probability
based on violation counts, severity weightings, overdue days, and inspection history.
"""

import os
import sys
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score

def generate_synthetic_dataset(n_samples=2500, random_state=42):
    """
    Generates synthetic inspection data mirroring empirical health department logs.
    Features:
      0: critical_violations (int, 0-5)
      1: major_violations (int, 0-8)
      2: minor_violations (int, 0-12)
      3: days_overdue (int, 0-180)
      4: past_violations_count (int, 0-25)
      5: facility_type_factor (1: Bakery/Cafe, 2: Mobile/Deli, 3: Full Restaurant/Hospital)
    Target:
      1 if High Risk / Critical Priority, 0 otherwise
    """
    rng = np.random.RandomState(random_state)
    
    critical = rng.poisson(lam=0.7, size=n_samples)
    major = rng.poisson(lam=1.5, size=n_samples)
    minor = rng.poisson(lam=2.8, size=n_samples)
    days_overdue = rng.exponential(scale=35.0, size=n_samples).astype(int)
    past_violations = rng.poisson(lam=3.2, size=n_samples)
    facility_type = rng.choice([1, 2, 3], p=[0.25, 0.35, 0.40], size=n_samples)
    
    # Risk calculation heuristic for ground truth labeling
    latent_risk = (
        critical * 35.0 +
        major * 15.0 +
        minor * 5.0 +
        np.clip(days_overdue / 10.0, 0, 20) +
        past_violations * 2.0 +
        (facility_type - 1) * 6.0 +
        rng.normal(0, 8.0, size=n_samples)
    )
    
    # 60+ points denotes high-risk priority
    y = (latent_risk >= 60.0).astype(int)
    
    X = np.column_stack([
        critical,
        major,
        minor,
        days_overdue,
        past_violations,
        facility_type
    ])
    
    return X, y

def train_and_save_model(output_path="risk_model.pkl"):
    print("Generating synthetic food safety inspection dataset...")
    X, y = generate_synthetic_dataset(n_samples=3000)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Dataset split: {len(X_train)} train samples, {len(X_test)} test samples.")
    print(f"High risk prevalence: {np.mean(y) * 100:.1f}%")
    
    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=7,
        min_samples_split=5,
        random_state=42,
        class_weight='balanced'
    )
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    roc = roc_auc_score(y_test, y_proba)
    
    print(f"\nModel Performance Metrics:")
    print(f"  - Accuracy: {acc * 100:.2f}%")
    print(f"  - ROC-AUC:  {roc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Standard Risk", "High/Critical Risk"]))
    
    # Feature importance
    feature_names = [
        "critical_violations", "major_violations", "minor_violations",
        "days_overdue", "past_violations_count", "facility_type_factor"
    ]
    print("Feature Importances:")
    for name, imp in sorted(zip(feature_names, clf.feature_importances_), key=lambda x: x[1], reverse=True):
        print(f"  - {name:25s}: {imp * 100:.2f}%")
    
    # Save model artifact
    model_artifact = {
        "model": clf,
        "feature_names": feature_names,
        "metrics": {"accuracy": acc, "roc_auc": roc},
        "version": "1.0.0"
    }
    joblib.dump(model_artifact, output_path)
    print(f"\nSuccessfully saved trained model artifact to: {output_path}")
    return clf

def predict_single(critical, major, minor, days_overdue, past_violations=2, facility_type=3, model_path="risk_model.pkl"):
    """Inference helper function for external calls or API verification."""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file {model_path} not found. Run training first.")
    
    artifact = joblib.load(model_path)
    clf = artifact["model"] if isinstance(artifact, dict) and "model" in artifact else artifact
    
    sample = np.array([[critical, major, minor, days_overdue, past_violations, facility_type]])
    pred_class = clf.predict(sample)[0]
    pred_prob = clf.predict_proba(sample)[0][1]
    return {
        "is_high_risk": bool(pred_class),
        "high_risk_probability": round(float(pred_prob), 4),
        "risk_tier": "CRITICAL / HIGH RISK" if pred_class == 1 else "STANDARD / LOW RISK"
    }

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_file = os.path.join(script_dir, "risk_model.pkl")
    train_and_save_model(output_path=model_file)
    
    # Quick sanity test on Central Spice sample (Critical=2, Major=1, Minor=1, Days Overdue=14)
    test_result = predict_single(
        critical=2, major=1, minor=1, days_overdue=14, model_path=model_file
    )
    print("\nSanity Check Inference (Central Spice Case):")
    print(test_result)
