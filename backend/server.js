require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const WL = require("./models/WL");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Config from environment
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/railway_predictor";
const FLASK_ML_URL = process.env.FLASK_ML_URL || "http://127.0.0.1:5000";

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });

// Validation middleware
function validatePredictionInput(req, res, next) {
    const { wl_position, days_left, class_type, quota, season, train_type } = req.body;
    const errors = [];

    if (wl_position === undefined || wl_position === null || typeof Number(wl_position) !== "number" || Number(wl_position) < 1 || Number(wl_position) > 200) {
        errors.push("wl_position must be a number between 1 and 200");
    }
    if (days_left === undefined || days_left === null || typeof Number(days_left) !== "number" || Number(days_left) < 0 || Number(days_left) > 90) {
        errors.push("days_left must be a number between 0 and 90");
    }
    if (!["Sleeper", "3A", "2A", "1A"].includes(class_type)) {
        errors.push("class_type must be one of: Sleeper, 3A, 2A, 1A");
    }
    if (!["GN", "Tatkal", "Ladies"].includes(quota)) {
        errors.push("quota must be one of: GN, Tatkal, Ladies");
    }
    if (!["Peak", "Off-peak"].includes(season)) {
        errors.push("season must be one of: Peak, Off-peak");
    }
    if (!["Rajdhani", "Shatabdi", "Superfast", "Express"].includes(train_type)) {
        errors.push("train_type must be one of: Rajdhani, Shatabdi, Superfast, Express");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
}

// Predict route
app.post("/api/predict", validatePredictionInput, async (req, res) => {
    try {
        const { wl_position, days_left, class_type, quota, season, train_type } = req.body;

        // Call Flask ML service
        const response = await axios.post(`${FLASK_ML_URL}/predict`, {
            wl_position: Number(wl_position),
            days_left: Number(days_left),
            class_type,
            quota,
            season,
            train_type
        });

        const probability = response.data.probability;

        // Save to MongoDB
        const wl = new WL({ 
            wl_position: Number(wl_position), 
            days_left: Number(days_left), 
            class_type, 
            quota, 
            season, 
            train_type, 
            probability 
        });
        await wl.save();

        res.json({ success: true, probability });
    } catch (err) {
        console.error("Prediction error:", err.message);
        if (err.code === "ECONNREFUSED") {
            return res.status(503).json({ success: false, error: "ML service is not available. Please ensure the Flask server is running." });
        }
        res.status(500).json({ success: false, error: "An error occurred while processing your prediction." });
    }
});

// History route with pagination
app.get("/api/history", async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [history, total] = await Promise.all([
            WL.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            WL.countDocuments()
        ]);

        res.json({
            data: history,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("History error:", err.message);
        res.status(500).json({ success: false, error: "Failed to fetch prediction history." });
    }
});

// Health check
app.get("/api/health", async (req, res) => {
    const health = { backend: "ok", mongodb: "unknown", ml_service: "unknown" };

    // Check MongoDB
    try {
        if (mongoose.connection.readyState === 1) {
            health.mongodb = "ok";
        } else {
            health.mongodb = "disconnected";
        }
    } catch (err) {
        health.mongodb = "error";
    }

    // Check Flask ML service
    try {
        const mlRes = await axios.get(`${FLASK_ML_URL}/health`, { timeout: 3000 });
        health.ml_service = mlRes.data.status || "ok";
    } catch (err) {
        health.ml_service = "unavailable";
    }

    const allHealthy = health.mongodb === "ok" && health.ml_service !== "unavailable";
    res.status(allHealthy ? 200 : 503).json(health);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
