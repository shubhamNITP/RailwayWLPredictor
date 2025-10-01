# ml_service/app.py
from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# 1️⃣ Load trained model
with open("wl_model.pkl", "rb") as f:
    model = pickle.load(f)

# 2️⃣ Define categories for manual one-hot encoding
class_categories = ["Sleeper", "3A", "2A"]
quota_categories = ["GN", "Tatkal", "Ladies"]

def encode_input(class_type, quota):
    # Manual one-hot encoding
    class_encoded = [1 if class_type == c else 0 for c in class_categories]
    quota_encoded = [1 if quota == q else 0 for q in quota_categories]
    return class_encoded + quota_encoded

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    # Extract input values
    wl_position = data.get("wl_position")
    days_left = data.get("days_left")
    class_type = data.get("class_type")
    quota = data.get("quota")

    # Encode categorical variables
    categorical = encode_input(class_type, quota)

    # Combine numeric and categorical inputs
    X_input = np.array([[wl_position, days_left] + categorical])

    # Predict probability of confirmation
    probability = model.predict_proba(X_input)[0][1]  # probability of confirmed=1
    probability = round(probability, 2)

    return jsonify({"probability": probability})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
