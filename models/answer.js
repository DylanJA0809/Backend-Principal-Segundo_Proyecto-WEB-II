const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  id_question: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "question"
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

module.exports = mongoose.model("answer", answerSchema);