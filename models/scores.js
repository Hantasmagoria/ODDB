const mongoose = require("mongoose");

var scoreSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    score: { type: Number, required: true },
    timing: {
      hours: { type: Number },
      minutes: { type: Number },
      seconds: { type: Number },
      milliseconds: { type: Number }
    }
  },
  { collection: "Leaderboard", timestamps: true }
);

const Score = mongoose.model("Score", scoreSchema);

module.exports = Score;
