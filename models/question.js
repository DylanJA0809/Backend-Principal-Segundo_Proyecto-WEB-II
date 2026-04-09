const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  id_vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "vehicle"
  },
  id_user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("question", questionSchema);