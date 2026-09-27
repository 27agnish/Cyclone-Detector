"""
CycloneShield AI - Infrastructure Vulnerability & Risk Model Training Pipeline
Trains a machine learning ensemble (GradientBoostingRegressor / RandomForest) on multi-hazard features:
- Peak sustained wind (km/h)
- Central pressure deficit (hPa)
- Distance to eye (km)
- Distance to predicted landfall (km)
- Coastal elevation (m)
- Ground bathymetry slope
- Infrastructure criticality index
- Rainfall accumulation (mm)
Outputs normalized 0-100 risk score and feature importance.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

def generate_synthetic_cyclone_hazard_dataset(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    
    # Feature generation
    wind_speed = np.random.uniform(60, 220, n_samples) # km/h
    pressure = 1010 - (wind_speed * 0.32) + np.random.normal(0, 3, n_samples)
    dist_track = np.random.exponential(35, n_samples) # km
    dist_landfall = np.random.exponential(50, n_samples) # km
    elevation = np.random.exponential(12, n_samples) # meters
    asset_criticality = np.random.choice([0.65, 0.70, 0.80, 0.85, 0.90, 0.95, 1.0], n_samples)
    rainfall_mm = np.random.uniform(50, 450, n_samples) # mm in 24h

    # Ground truth hazard formulation
    wind_hazard = np.clip((wind_speed - 40) / 1.5, 0, 100) * np.exp(-dist_track / 45.0)
    surge_hazard = np.where(
        (elevation < 6.0) & (dist_landfall < 60),
        np.clip(95 - elevation * 8.0, 0, 100) * (wind_speed / 130.0)**1.5,
        np.clip(30 - elevation * 2.0, 0, 50)
    )
    rain_hazard = np.clip(rainfall_mm / 3.0, 0, 100) * np.exp(-dist_track / 70.0)
    
    raw_score = (
        wind_hazard * 0.35 +
        surge_hazard * 0.25 +
        rain_hazard * 0.15 +
        (asset_criticality * 100.0) * 0.15 +
        np.clip(100 - dist_landfall, 0, 100) * 0.10
    )
    
    target_score = np.clip(raw_score + np.random.normal(0, 2.5, n_samples), 0, 100)

    df = pd.DataFrame({
        "wind_speed": wind_speed,
        "pressure": pressure,
        "distance_to_track_km": dist_track,
        "distance_to_landfall_km": dist_landfall,
        "elevation_m": elevation,
        "asset_criticality": asset_criticality,
        "rainfall_mm": rainfall_mm,
        "risk_score": target_score
    })
    return df

def train_and_save():
    print("Generating coastal hazard training dataset...")
    df = generate_synthetic_cyclone_hazard_dataset(6000)
    
    features = [
        "wind_speed", "pressure", "distance_to_track_km",
        "distance_to_landfall_km", "elevation_m", "asset_criticality", "rainfall_mm"
    ]
    X = df[features]
    y = df["risk_score"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training GradientBoostingRegressor risk ensemble...")
    model = GradientBoostingRegressor(n_estimators=150, max_depth=4, learning_rate=0.08, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    print(f"Model Performance: RMSE = {np.sqrt(mse):.2f}, R2 Score = {r2:.4f}")
    
    os.makedirs("ml/models", exist_ok=True)
    joblib.dump(model, "ml/models/risk_gradient_boost.joblib")
    print("Model serialized to ml/models/risk_gradient_boost.joblib")

if __name__ == "__main__":
    train_and_save()
