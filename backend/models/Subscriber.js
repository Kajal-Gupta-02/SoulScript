const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Lets someone unsubscribe without needing to log in anywhere
    unsubscribeToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscriber", subscriberSchema);