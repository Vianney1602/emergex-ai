import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import numpy as np

def train():
    print("Loading data...")
    try:
        df = pd.read_csv('crime_data.csv')
    except FileNotFoundError:
        print("Error: crime_data.csv not found. Run generate_data.py first.")
        return

    # Features and Target
    X = df[['hour', 'lighting_score', 'police_stn_dist', 'past_incidents', 'crowd_density']]
    y = df['risk_score']

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Model
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"Model Trained Successfully!")
    print(f"MSE: {mse:.2f}")
    print(f"R2 Score: {r2:.2f}")

    # Save
    joblib.dump(model, 'model.pkl')
    print("Model saved to model.pkl")

if __name__ == "__main__":
    train()
