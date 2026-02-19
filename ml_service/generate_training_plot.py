import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

# Set style for dark mode aesthetic
plt.style.use('dark_background')
sns.set_palette("viridis")

def generate_plots():
    print("Loading data and model for plotting...")
    try:
        df = pd.read_csv('crime_data.csv')
        model = joblib.load('model.pkl')
    except Exception as e:
        print(f"Error loading files: {e}. Ensure you are in the root directory and model is trained.")
        return

    # 1. Feature Importance
    features = ['hour', 'lighting_score', 'police_stn_dist', 'past_incidents', 'crowd_density']
    importances = model.feature_importances_
    
    # Sort importances
    indices = np.argsort(importances)
    sorted_features = [features[i] for i in indices]
    sorted_importances = importances[indices]

    # 2. Prediction Quality (Actual vs Predicted Sample)
    # Get a sample for visualization
    sample_df = df.sample(200, random_state=42)
    X_sample = sample_df[features]
    y_actual = sample_df['risk_score']
    y_pred = model.predict(X_sample)

    # Create the Plot
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
    fig.patch.set_facecolor('#0a0e17')
    ax1.set_facecolor('#0a0e17')
    ax2.set_facecolor('#0a0e17')

    # Plot 1: Feature Importance
    colors = sns.color_palette("magma", len(sorted_features))
    ax1.barh(sorted_features, sorted_importances, color=colors)
    ax1.set_title("Feature Importance Analysis", fontsize=16, fontweight='bold', color='#6366f1', pad=20)
    ax1.set_xlabel("Relative Importance Score", fontsize=12, color='#94a3b8')
    ax1.grid(axis='x', linestyle='--', alpha=0.3)
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)

    # Plot 2: Accuracy Calibration (Actual vs Predicted)
    sns.regplot(x=y_actual, y=y_pred, ax=ax2, 
                scatter_kws={'alpha':0.4, 'color':'#f43f5e', 's':40},
                line_kws={'color':'#6366f1', 'lw':3})
    ax2.set_title("Model Reliability Validation", fontsize=16, fontweight='bold', color='#6366f1', pad=20)
    ax2.set_xlabel("Ground Truth Risk Score", fontsize=12, color='#94a3b8')
    ax2.set_ylabel("Predicted Risk Score", fontsize=12, color='#94a3b8')
    ax2.set_xlim(0, 100)
    ax2.set_ylim(0, 100)
    ax2.grid(linestyle='--', alpha=0.3)
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)

    plt.tight_layout(pad=4.0)
    
    # Save the plot
    output_path = os.path.join('public', 'ml-stats.png')
    plt.savefig(output_path, dpi=300, facecolor='#0a0e17')
    print(f"ML Training Graph saved to: {output_path}")

if __name__ == "__main__":
    generate_plots()
