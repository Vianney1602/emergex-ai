# EmergeX AI ML Service

This service provides real-time safety risk predictions using a Random Forest Regressor trained on synthetic crime and environmental data.

## Training Pipeline

To retrain the model with fresh data, run these commands in order:

1. **Install Dependencies** (First time only):
   ```bash
   py -3.12 -m pip install pandas scikit-learn flask flask-cors joblib numpy
   ```

2. **Generate Synthetic Data**:
   Creates `crime_data.csv` with 10,000 samples based on lighting, time, and incident patterns.
   ```bash
   py -3.12 ml_service/generate_data.py
   ```

3. **Train the Model**:
   Loads the data, trains the Random Forest, and saves it to `model.pkl`.
   ```bash
   py -3.12 ml_service/train_model.py
   ```

4. **Start the API**:
   Launches the Flask server on `http://localhost:5000`.
   ```bash
   py -3.12 ml_service/app.py
   ```

## API Endpoints

- **GET /**: Service status and info.
- **GET /health**: Health check (confirming model is loaded).
- **POST /predict**: Get a risk score prediction.
  - **Body**: `{"hour": 22, "lighting_score": 2, "police_stn_dist": 5.0, "past_incidents": 10, "crowd_density": 1}`
  - **Response**: `{"risk_score": 68.4}`
