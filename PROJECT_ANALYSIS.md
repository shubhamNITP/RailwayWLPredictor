# 🚂 Railway WL Predictor - Complete Project Analysis

## 📋 Project Overview

**Railway WL Predictor** is a full-stack machine learning application that predicts the confirmation probability of Indian Railway Waitlist (WL) tickets. The system uses a RandomForest classifier trained on synthetic data to provide users with probability estimates based on various factors.

---

## 🏗️ Architecture

The project follows a **microservices architecture** with three main components:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ──────> │   Backend   │ ──────> │ ML Service  │
│ HTML/CSS/JS │         │  Node.js    │         │   Flask     │
└─────────────┘         └──────┬──────┘         └─────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │   MongoDB   │
                         │  Database   │
                         └─────────────┘
```

---

## 📁 Project Structure

```
RailwayWLPredictor/
├── backend/                    # Node.js Express backend
│   ├── models/
│   │   └── WL.js              # MongoDB schema for predictions
│   ├── server.js              # Express server with API endpoints
│   ├── package.json           # Node dependencies
│   └── package-lock.json
│
├── frontend/                   # Web interface
│   ├── index.html             # Main UI with Bootstrap
│   ├── script.js              # Frontend logic and API calls
│   └── style.css              # Custom styling
│
├── ml_services/               # Python ML service
│   ├── app.py                 # Flask API for predictions
│   ├── train.py               # Model training script
│   ├── data_gen.py            # Synthetic dataset generator
│   ├── wl_dataset.csv         # Training data (1000 samples)
│   ├── feature_columns.npy    # Encoded feature names
│   └── requirements.txt       # Python dependencies
│
├── .gitignore
└── README.md
```

---

## 🔧 Components Deep Dive

### 1. **Frontend** (`frontend/`)

**Technology:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3.2

**Files:**
- **`index.html`** (78 lines)
  - Responsive form with 4 input fields
  - Prediction history table
  - Bootstrap-based UI components

- **`script.js`** (65 lines)
  - `predictWL()`: Sends prediction request to backend
  - `fetchHistory()`: Retrieves and displays prediction history
  - Async/await pattern for API calls
  - Auto-loads history on page load

- **`style.css`** (91 lines)
  - Gradient background: `#ff7e5f` to `#feb47b`
  - Responsive design with media queries
  - Hover effects and transitions
  - Mobile-first approach

**User Inputs:**
1. **WL Position** (1-100)
2. **Days Left** (0-30)
3. **Class Type** (Sleeper, 3A, 2A)
4. **Quota** (GN, Tatkal, Ladies)

---

### 2. **Backend** (`backend/`)

**Technology:** Node.js + Express + MongoDB + Axios

**Dependencies:**
```json
{
  "express": "^5.1.0",
  "mongoose": "^8.18.3",
  "axios": "^1.12.2",
  "body-parser": "^2.2.0",
  "cors": "^2.8.5"
}
```

**`server.js`** (65 lines)
- **Port:** 4000
- **Database:** MongoDB at `mongodb://127.0.0.1:27017/railway_predictor`

**API Endpoints:**

1. **`POST /api/predict`**
   - Accepts: `{ wl_position, days_left, class_type, quota }`
   - Calls Flask ML service at `http://127.0.0.1:5000/predict`
   - Saves prediction to MongoDB
   - Returns: `{ success: true, probability: 0.87 }`

2. **`GET /api/history`**
   - Returns all predictions sorted by creation date (newest first)
   - Includes timestamps

**MongoDB Schema** (`models/WL.js`):
```javascript
{
  wl_position: Number,
  days_left: Number,
  class_type: String,
  quota: String,
  probability: Number,
  timestamps: true  // createdAt, updatedAt
}
```

---

### 3. **ML Service** (`ml_services/`)

**Technology:** Flask + scikit-learn + pandas + numpy

**Dependencies:**
```txt
flask
scikit-learn
pandas
numpy
```

#### **`data_gen.py`** (32 lines)
- Generates 1000 synthetic samples
- **Confirmation Logic:**
  - `wl_position ≤ 10 AND days_left > 2` → confirmed = 1
  - `wl_position ≤ 20 AND days_left > 5` → confirmed = 1
  - Otherwise → confirmed = 0

#### **`train.py`** (46 lines)
- Loads `wl_dataset.csv`
- One-hot encodes categorical features
- Trains RandomForest (100 estimators)
- Saves model to `wl_model.pkl`
- Saves feature columns to `feature_columns.npy`

**Feature Engineering:**
```
Original: [wl_position, days_left, class_type, quota]
         ↓
Encoded:  [wl_position, days_left, Sleeper, 3A, 2A, GN, Tatkal, Ladies]
         (2 numeric + 6 one-hot encoded)
```

#### **`app.py`** (46 lines)
- **Port:** 5000
- Loads trained model (`wl_model.pkl`)
- Manual one-hot encoding for predictions

**Prediction Endpoint:**
```python
POST /predict
Input: { wl_position, days_left, class_type, quota }
Output: { probability: 0.87 }
```

**Encoding Process:**
```python
class_categories = ["Sleeper", "3A", "2A"]
quota_categories = ["GN", "Tatkal", "Ladies"]

# Example: class_type="3A", quota="Tatkal"
# Encoded: [0, 1, 0, 0, 1, 0]
```

---

## 🔄 Data Flow

### Prediction Flow:
```
1. User fills form → Frontend (script.js)
2. POST /api/predict → Backend (server.js:26)
3. POST /predict → ML Service (app.py:22)
4. Model inference → RandomForest.predict_proba()
5. Return probability → Backend
6. Save to MongoDB → WL collection
7. Return to Frontend → Display result
8. Refresh history table → GET /api/history
```

### Training Flow:
```
1. Generate synthetic data → data_gen.py
2. Create wl_dataset.csv (1000 rows)
3. Train model → train.py
4. Save wl_model.pkl + feature_columns.npy
5. Load model → app.py (on startup)
```

---

## 🎯 Key Features

1. **Real-time Predictions**
   - Instant probability calculation
   - Based on 4 input parameters

2. **Prediction History**
   - Stores all predictions with timestamps
   - Displays in sortable table
   - Persisted in MongoDB

3. **Responsive Design**
   - Mobile-friendly UI
   - Bootstrap components
   - Gradient aesthetic

4. **Modular Architecture**
   - Separate frontend/backend/ML services
   - Easy to scale and maintain
   - RESTful APIs

---

## 🧮 Machine Learning Details

**Algorithm:** RandomForest Classifier
- **Estimators:** 100 trees
- **Target:** Binary (confirmed: 1, not confirmed: 0)
- **Features:** 8 total (2 numeric + 6 categorical encoded)

**Model Performance:**
- Accuracy evaluated on 20% test split
- Uses `predict_proba()` for probability scores
- Returns probability of class 1 (confirmed)

**Training Data Distribution:**
- 1000 samples
- Balanced classes (approximately)
- Random sampling from defined ranges

---

## 🚀 How to Run

### 1. **Setup Database**
```bash
# Install MongoDB and start service
mongod
```

### 2. **Backend Setup**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:4000
```

### 3. **ML Service Setup**
```bash
cd ml_services

# Generate dataset
python data_gen.py

# Train model
python train.py

# Start Flask server
python app.py
# Server runs on http://127.0.0.1:5000
```

### 4. **Frontend**
```bash
cd frontend
# Open index.html in browser
# Or use a simple HTTP server:
python -m http.server 8000
# Access at http://localhost:8000
```

---

## 📊 Dataset Schema

**`wl_dataset.csv`** (1000 rows × 5 columns)

| Column       | Type   | Range/Values              |
|--------------|--------|---------------------------|
| wl_position  | int    | 1-100                     |
| days_left    | int    | 0-30                      |
| class_type   | string | Sleeper, 3A, 2A           |
| quota        | string | GN, Tatkal, Ladies        |
| confirmed    | int    | 0 or 1                    |

---

## 🔒 Security Considerations

**Current Status:**
- No authentication/authorization
- Hardcoded database connection
- No input validation on backend
- No rate limiting

**Recommendations:**
- Add user authentication
- Environment variables for configs
- Input sanitization
- API rate limiting
- CORS configuration for production

---

## 🐛 Known Limitations

1. **Synthetic Data:**
   - Model trained on artificial data
   - Simple confirmation rules
   - May not reflect real-world patterns

2. **No Error Handling:**
   - Limited error messages
   - No retry logic
   - No fallback mechanisms

3. **Hardcoded URLs:**
   - Frontend has hardcoded `localhost:4000`
   - Backend has hardcoded `localhost:5000`

4. **No Model Versioning:**
   - Single model file
   - No A/B testing capability
   - No model monitoring

---

## 🔧 Technology Stack Summary

| Layer          | Technologies                    | Port |
|----------------|----------------------------------|------|
| Frontend       | HTML, CSS, JavaScript, Bootstrap | N/A  |
| Backend API    | Node.js, Express, Mongoose       | 4000 |
| ML Service     | Flask, scikit-learn, pandas      | 5000 |
| Database       | MongoDB                          | 27017|

---

## 📈 Potential Improvements

1. **ML Model:**
   - Use real IRCTC data (if available)
   - Add more features (train type, season, route)
   - Experiment with other algorithms (XGBoost, Neural Networks)
   - Implement model retraining pipeline

2. **Backend:**
   - Add authentication (JWT)
   - Implement caching (Redis)
   - Add request validation
   - Improve error handling
   - Add logging

3. **Frontend:**
   - Add charts for probability visualization
   - Implement user accounts
   - Add filters for history
   - Progressive Web App (PWA)

4. **DevOps:**
   - Docker containerization
   - CI/CD pipeline
   - Environment-based configs
   - Monitoring and alerting

---

## 📝 API Documentation

### Backend API

#### Predict Endpoint
```http
POST /api/predict
Content-Type: application/json

Request:
{
  "wl_position": 15,
  "days_left": 10,
  "class_type": "Sleeper",
  "quota": "GN"
}

Response:
{
  "success": true,
  "probability": 0.87
}
```

#### History Endpoint
```http
GET /api/history

Response:
[
  {
    "_id": "...",
    "wl_position": 15,
    "days_left": 10,
    "class_type": "Sleeper",
    "quota": "GN",
    "probability": 0.87,
    "createdAt": "2026-03-17T19:06:32.808Z",
    "updatedAt": "2026-03-17T19:06:32.808Z"
  },
  ...
]
```

### ML Service API

#### Prediction Endpoint
```http
POST /predict
Content-Type: application/json

Request:
{
  "wl_position": 15,
  "days_left": 10,
  "class_type": "Sleeper",
  "quota": "GN"
}

Response:
{
  "probability": 0.87
}
```

---

## 🎓 Learning Resources

This project demonstrates:
- Full-stack development
- REST API design
- Machine Learning integration
- MongoDB usage
- Async JavaScript
- Flask microservices
- scikit-learn implementation

---

## 📞 File Reference Guide

| Feature | File Location |
|---------|---------------|
| UI Design | frontend/index.html:1-78 |
| Prediction Logic | frontend/script.js:1-36 |
| History Display | frontend/script.js:38-64 |
| API Endpoints | backend/server.js:26-59 |
| Database Schema | backend/models/WL.js:1-13 |
| ML Model | ml_services/app.py:8-42 |
| Training Script | ml_services/train.py:1-46 |
| Data Generation | ml_services/data_gen.py:1-32 |

---

## ✅ Project Health

- **Code Quality:** Clean, well-structured
- **Documentation:** README present, could be enhanced
- **Dependencies:** Modern versions
- **Architecture:** Good separation of concerns
- **Scalability:** Microservices-ready
- **Testing:** No tests present
- **Production Ready:** No (needs hardening)

---

*Generated on: 2026-03-17*
*Project Version: 1.0.0*
