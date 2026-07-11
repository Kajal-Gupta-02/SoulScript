const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Only a handful of login attempts per window, from any single IP.
// Slows down brute-forcing since there's only one account on this whole site.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { error: "Too many login attempts. Try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const validUsername = username === process.env.ADMIN_USERNAME;
  // Always run bcrypt.compare even on a bad username, so the response time
  // doesn't leak whether the username was right (basic timing-attack guard).
  const hashToCheck = validUsername
    ? process.env.ADMIN_PASSWORD_HASH
    : "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";

  const passwordMatches = await bcrypt.compare(password, hashToCheck);

  if (!validUsername || !passwordMatches) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }

  const token = jwt.sign({ role: "admin", username }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });

  res.json({ token });
});

module.exports = router;
