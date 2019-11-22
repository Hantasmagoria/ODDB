const mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username cannot be left blank"]
    },
    password: {
      type: String,
      required: [true, "Password cannot be left blank"]
    },
    email: { type: String }
  },
  { collection: "userProfiles", timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
