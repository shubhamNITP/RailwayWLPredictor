const mongoose = require("mongoose");

const wlSchema = new mongoose.Schema({
    wl_position: {
        type: Number,
        required: true,
        min: 1,
        max: 200
    },
    days_left: {
        type: Number,
        required: true,
        min: 0,
        max: 90
    },
    class_type: {
        type: String,
        required: true,
        enum: ["Sleeper", "3A", "2A", "1A"]
    },
    quota: {
        type: String,
        required: true,
        enum: ["GN", "Tatkal", "Ladies"]
    },
    season: {
        type: String,
        required: true,
        enum: ["Peak", "Off-peak"]
    },
    train_type: {
        type: String,
        required: true,
        enum: ["Rajdhani", "Shatabdi", "Superfast", "Express"]
    },
    probability: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    }
}, { timestamps: true });

module.exports = mongoose.model("WL", wlSchema);
