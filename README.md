# 🚂 Railway WL Predictor

A machine learning-powered web application that predicts the **confirmation probability of Indian Railway Waitlist (WL) tickets**. It uses a custom **RandomForest Classifier** trained on simulated waitlist confirmation patterns mapping to class type, quota type, season, train type, days left, and current waitlist position.

---

## 🏗️ Architecture Diagram

```
[ Frontend (HTML/CSS/JS) ] 
       │ 
       ▼ (Port 4000)
[ Express API Backend ] <───> [ MongoDB (Prediction History) ]
       │
       ▼ (Port 5000)
[ Flask ML Service ] <───> [ Random Forest Model (wl_model.pkl & encoder.pkl) ]
```

---

## ⚙️ Key Features
- **Accurate Probabilistic Prediction:** Evaluates ticketing parameters using a Random Forest model.
- **Indian Railways Domain Modeling:** Realistic simulations based on actual operational characteristics:
  - **Class type influence:** Sleeper vs AC 3 Tier vs AC 2 Tier vs AC 1st Class.
  - **Quota influence:** General vs Tatkal vs Ladies pools.
  - **Seasonality & Train Type:** Festivals/holidays vs Off-Peak, and Rajdhani/Shatabdi/Superfast capacity variations.
- **Premium User Interface:** Modern glassmorphism UI styled in slate dark mode with custom typography, responsive grid layout, input validations, loading states, and an animated circular progress gauge.
- **Pagination & History Tracking:** Mongoose-based paginated history storage with MongoDB.
- **Health Checks & Error Handling:** Comprehensive endpoint verification and structured inputs.

---

## 🚀 Setup & Installation

### Prerequisites
1. **Node.js** (v18+)
2. **Python** (v3.9+)
3. **MongoDB** (Running locally at `mongodb://127.0.0.1:27017` or Atlas)

---

### Step 1: Install & Set Up Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   A default `.env` is created for you:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/railway_predictor
   FLASK_ML_URL=http://127.0.0.1:5000
   ```
4. Start the Express server:
   ```bash
   npm start
   ```

---

### Step 2: Install & Set Up ML Service

1. Navigate to the `ml_services` directory:
   ```bash
   cd ../ml_services
   ```
2. Create a virtual environment and install requirements:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Generate dataset and Train the Model**:
   ```bash
   python data_gen.py
   python train.py
   ```
   *This trains a RandomForestClassifier and outputs `models/wl_model.pkl` and `models/encoder.pkl`.*

4. Run the Flask prediction server:
   ```bash
   python app.py
   ```

---

### Step 3: Launch Frontend
Open [index.html](file:///c:/Users/shubh/Documents/RailwayPredictor/frontend/index.html) in your browser directly or serve it using any live server.

---

## 🧪 API Documentation

### 1. `POST /api/predict` (Backend)
Sends ticket parameters to be classified.
- **Payload:**
  ```json
  {
    "wl_position": 25,
    "days_left": 10,
    "class_type": "3A",
    "quota": "GN",
    "season": "Off-peak",
    "train_type": "Superfast"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "probability": 0.6283
  }
  ```

### 2. `GET /api/history` (Backend)
Retrieves prediction history with optional pagination.
- **Parameters:** `?page=1&limit=20`
- **Response:**
  ```json
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 55,
      "totalPages": 3
    }
  }
  ```

---

## 🛡️ License
Distributed under the ISC License.
