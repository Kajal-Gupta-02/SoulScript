const requireAdmin = require("../middleware/requireAdmin");
const express = require("express");
const crypto = require("crypto");
const validator = require("validator");
const rateLimit = require("express-rate-limit");
const Subscriber = require("../models/Subscriber");

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many attempts. Try again shortly." },
});

router.get("/count", requireAdmin, async (req, res) => {
  try {
    const count = await Subscriber.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Could not load subscriber count." });
  }
});

router.post("/", subscribeLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email." });
  }

  try {
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.json({ success: true, message: "You're already subscribed!" });
    }

    await Subscriber.create({
      email: email.toLowerCase(),
      unsubscribeToken: crypto.randomBytes(24).toString("hex"),
    });

    res.status(201).json({ success: true, message: "Subscribed! You'll hear about new posts." });
  } catch (err) {
    res.status(500).json({ error: "Could not subscribe right now." });
  }
});

router.get("/unsubscribe/:token", async (req, res) => {
  try {
    const result = await Subscriber.findOneAndDelete({ unsubscribeToken: req.params.token });
    if (!result) return res.status(404).json({ error: "Invalid or expired link." });
    res.json({ success: true, message: "You've been unsubscribed." });
  } catch (err) {
    res.status(500).json({ error: "Could not unsubscribe." });
  }
});

module.exports = router;