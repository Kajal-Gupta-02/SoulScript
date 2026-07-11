const express = require("express");
const rateLimit = require("express-rate-limit");
const Reaction = require("../models/Reaction");

const router = express.Router();

const reactionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Slow down a little." },
});

// Public: how many of each vibe a single post has received
router.get("/post/:postId", async (req, res) => {
  try {
    const counts = await Reaction.aggregate([
      { $match: { post: new (require("mongoose").Types.ObjectId)(req.params.postId) } },
      { $group: { _id: "$vibe", count: { $sum: 1 } } },
    ]);
    const result = Object.fromEntries(Reaction.VIBE_TYPES.map((v) => [v, 0]));
    counts.forEach((c) => (result[c._id] = c.count));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not load reactions." });
  }
});

// Public: site-wide aggregate across every post, last 30 days.
// This single endpoint is what powers the Vibe Orb's colour on every page.
router.get("/site-vibe", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const counts = await Reaction.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: "$vibe", count: { $sum: 1 } } },
    ]);
    const result = Object.fromEntries(Reaction.VIBE_TYPES.map((v) => [v, 0]));
    counts.forEach((c) => (result[c._id] = c.count));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not load the site vibe." });
  }
});

// Public: leave or change a reaction on a post
router.post("/post/:postId", reactionLimiter, async (req, res) => {
  try {
    const { vibe, visitorId } = req.body;

    if (!Reaction.VIBE_TYPES.includes(vibe)) {
      return res.status(400).json({ error: "That's not a valid vibe." });
    }
    if (!visitorId || typeof visitorId !== "string" || visitorId.length > 100) {
      return res.status(400).json({ error: "Missing visitor id." });
    }

    const reaction = await Reaction.findOneAndUpdate(
      { post: req.params.postId, visitorId },
      { vibe },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(reaction);
  } catch (err) {
    res.status(500).json({ error: "Could not save your reaction." });
  }
});

module.exports = router;
