// backend/models/WL.js
const mongoose = require("mongoose");

const wlSchema = new mongoose.Schema({
    wl_position: Number,
    days_left: Number,
    class_type: String,
    quota: String,
    probability: Number,
}, { timestamps: true });

module.exports = mongoose.model("WL", wlSchema);
