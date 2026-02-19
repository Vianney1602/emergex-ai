import subprocess
import sys
import os

def run_command(command):
    print(f"\n> Running: {' '.join(command)}")
    result = subprocess.run(command, capture_output=False, text=True)
    if result.returncode != 0:
        print(f"Error executing command: {command}")
        sys.exit(1)

def main():
    # Ensure dependencies are installed
    print("Checking/Installing dependencies...")
    run_command([sys.executable, "-m", "pip", "install", "pandas", "scikit-learn", "flask", "flask-cors", "joblib", "numpy"])

    # Change to the ml_service directory if not already there
    # But scripts are usually run from root with paths
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Generate Data
    print("\n--- Phase 1: Data Generation ---")
    run_command([sys.executable, os.path.join(scripts_dir, "generate_data.py")])

    # 2. Train Model
    print("\n--- Phase 2: Model Training ---")
    run_command([sys.executable, os.path.join(scripts_dir, "train_model.py")])

    print("\nPipeline completed successfully! You can now start the API using:")
    print(f"py -3.12 {os.path.join(scripts_dir, 'app.py')}")

if __name__ == "__main__":
    main()
