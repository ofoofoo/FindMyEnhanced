const mongoose = require("mongoose");

const InteractionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    lat: Number,
    lng: Number,
    building: String,
    timestamp: Date
});

module.exports = mongoose.model("interaction", InteractionSchema);