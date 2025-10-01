const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios"); // to call Flask API

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/railway_predictor", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const wlSchema = new mongoose.Schema({
    wl_position: Number,
    days_left: Number,
    class_type: String,
    quota: String,
    probability: Number,
}, { timestamps: true });

const WL = mongoose.model("WL", wlSchema);

// Predict route
app.post("/api/predict", async (req, res) => {
    try {
        const { wl_position, days_left, class_type, quota } = req.body;

        // Call Flask ML service
        const response = await axios.post("http://127.0.0.1:5000/predict", {
            wl_position,
            days_left,
            class_type,
            quota
        });

        const probability = response.data.probability;

        // Save to MongoDB
        const wl = new WL({ wl_position, days_left, class_type, quota, probability });
        await wl.save();

        res.json({ success: true, probability });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// History route
app.get("/api/history", async (req, res) => {
    try {
        const history = await WL.find().sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Start server
app.listen(4000, () => {
    console.log("🚀 Backend running on http://localhost:4000");
});
