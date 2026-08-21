from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load model and encoder
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "wl_model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "models", "encoder.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(ENCODER_PATH, "rb") as f:
        encoder = pickle.load(f)
    print("Model and encoder loaded successfully.")
except FileNotFoundError as e:
    print(f"WARNING: Model files not found. Run train.py first. {e}")
    model = None
    encoder = None

# Valid categories
VALID_CLASS_TYPES = ["Sleeper", "3A", "2A", "1A"]
VALID_QUOTAS = ["GN", "Tatkal", "Ladies"]
VALID_SEASONS = ["Peak", "Off-peak"]
VALID_TRAIN_TYPES = ["Rajdhani", "Shatabdi", "Superfast", "Express"]


def validate_input(data):
    """Validate prediction input data."""
    errors = []
    
    # Required fields
    required = ["wl_position", "days_left", "class_type", "quota", "season", "train_type"]
    for field in required:
        if field not in data or data[field] is None:
            errors.append(f"Missing required field: {field}")
    
    if errors:
        return errors
    
    # Type and range validation
    try:
        wl = int(data["wl_position"])
        if wl < 1 or wl > 200:
            errors.append("wl_position must be between 1 and 200")
    except (ValueError, TypeError):
        errors.append("wl_position must be a valid integer")
    
    try:
        days = int(data["days_left"])
        if days < 0 or days > 90:
            errors.append("days_left must be between 0 and 90")
    except (ValueError, TypeError):
        errors.append("days_left must be a valid integer")
    
    if data["class_type"] not in VALID_CLASS_TYPES:
        errors.append(f"class_type must be one of: {VALID_CLASS_TYPES}")
    if data["quota"] not in VALID_QUOTAS:
        errors.append(f"quota must be one of: {VALID_QUOTAS}")
    if data["season"] not in VALID_SEASONS:
        errors.append(f"season must be one of: {VALID_SEASONS}")
    if data["train_type"] not in VALID_TRAIN_TYPES:
        errors.append(f"train_type must be one of: {VALID_TRAIN_TYPES}")
    
    return errors


@app.route("/predict", methods=["POST"])
def predict():
    global model, encoder
    
    # Try reloading model/encoder if not loaded
    if model is None or encoder is None:
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            with open(ENCODER_PATH, "rb") as f:
                encoder = pickle.load(f)
        except Exception:
            return jsonify({"error": "Model not loaded. Run train.py first."}), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be valid JSON"}), 400
        
        # Validate
        errors = validate_input(data)
        if errors:
            return jsonify({"error": "Validation failed", "details": errors}), 400
        
        # Extract and encode
        wl_position = int(data["wl_position"])
        days_left = int(data["days_left"])
        class_type = data["class_type"]
        quota = data["quota"]
        season = data["season"]
        train_type = data["train_type"]
        
        # Use the saved encoder for consistent encoding
        categorical_input = [[class_type, quota, season, train_type]]
        encoded = encoder.transform(categorical_input)
        
        X_input = np.array([[wl_position, days_left] + list(encoded[0])])
        
        probability = model.predict_proba(X_input)[0][1]
        probability = round(float(probability), 4)
        
        return jsonify({"probability": probability})
    
    except Exception as e:
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    global model, encoder
    # Try reloading if not loaded
    if model is None or encoder is None:
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            with open(ENCODER_PATH, "rb") as f:
                encoder = pickle.load(f)
        except Exception:
            pass
            
    return jsonify({
        "status": "healthy" if model is not None else "degraded",
        "model_loaded": model is not None,
        "encoder_loaded": encoder is not None,
    })


if __name__ == "__main__":
    app.run(port=5000, debug=False)
