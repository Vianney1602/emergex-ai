from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Use absolute path relative to the api directory for serverless contexts
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print("Model loaded successfully from:", MODEL_PATH)
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Model file not found at: {MODEL_PATH}")

# Explicitly load the model during startup for serverless environments
load_model()

@app.route('/ml', methods=['GET'])
def index():
    return jsonify({
        "message": "EmergeX AI ML Service is running (Serverless)",
        "endpoints": ["/ml", "/ml/health", "/ml/predict"],
        "model_loaded": model is not None,
        "model_path": MODEL_PATH
    })

@app.route('/ml/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model_loaded": model is not None})

@app.route('/ml/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({"error": f"Model not loaded. Path checked: {MODEL_PATH}"}), 503
        
    try:
        data = request.json
        
        # Expected features
        features = [
            data.get('hour', 12),
            data.get('lighting_score', 5),
            data.get('police_stn_dist', 1.0),
            data.get('past_incidents', 0),
            data.get('crowd_density', 5)
        ]
        
        # Reshape for single prediction
        X = np.array(features).reshape(1, -1)
        columns = ['hour', 'lighting_score', 'police_stn_dist', 'past_incidents', 'crowd_density']
        X_df = pd.DataFrame(X, columns=columns)
        
        prediction = model.predict(X_df)[0]
        risk_score = max(0, min(100, prediction)) # Clamp
        
        return jsonify({
            "risk_score": round(risk_score, 2),
            "features": data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Vercel doesn't use __main__, it imports the 'app' object.
# But we keep this for local testing as a standalone file.
if __name__ == '__main__':
    app.run(port=5000, debug=True)
