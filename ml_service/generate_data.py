import pandas as pd
import numpy as np
import random

# Set seed for reproducibility
np.random.seed(42)

NUM_SAMPLES = 10000

def generate_synthetic_data():
    print(f"Generating {NUM_SAMPLES} synthetic samples...")
    
    data = []
    
    for _ in range(NUM_SAMPLES):
        block_id = random.randint(1, 100)
        hour = random.randint(0, 23)
        lighting_score = random.randint(0, 10) # 0=Dark, 10=Bright
        police_stn_dist = round(random.uniform(0.1, 10.0), 2) # km
        past_incidents = random.randint(0, 50) # Count in last month
        crowd_density = random.randint(0, 10) # 0=Empty, 10=Crowded
        
        # Risk Calculation Logic (Heuristic Ground Truth)
        # Base risk
        risk = 20
        
        # Factor: Time (Late night is riskier)
        if 22 <= hour or hour <= 4:
            risk += 25
        elif 18 <= hour < 22:
            risk += 10
            
        # Factor: Lighting (Darkness increases risk significantly)
        risk += (10 - lighting_score) * 4
        
        # Factor: Police Proximity (Further away is riskier)
        risk += police_stn_dist * 3
        
        # Factor: Past Incidents (History repeats)
        risk += past_incidents * 2
        
        # Factor: Crowd (Empty streets slightly riskier at night, crowded pickpockets riskier during day)
        # Simplified: Empty at night = bad.
        if (22 <= hour or hour <= 4) and crowd_density < 3:
            risk += 15
            
        # Add random noise
        risk += np.random.normal(0, 5)
        
        # Clamp between 0 and 100
        risk = max(0, min(100, risk))
        
        data.append({
            'block_id': block_id,
            'hour': hour,
            'lighting_score': lighting_score,
            'police_stn_dist': police_stn_dist,
            'past_incidents': past_incidents,
            'crowd_density': crowd_density,
            'risk_score': round(risk, 2)
        })
        
    df = pd.DataFrame(data)
    df.to_csv('crime_data.csv', index=False)
    print(f"Dataset generated: crime_data.csv ({len(df)} rows)")

if __name__ == "__main__":
    generate_synthetic_data()
