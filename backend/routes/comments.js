const express = require("express");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Anyone can comment without an account, so throttle by IP to keep spam
// and bots from flooding the site.
const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: { error: "You're commenting a bit too fast. Take a short break." },
});

// Public: get all comments for a post (as a nested tree)
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: 1 });

    const byId = {};
    comments.forEach((c) => {
      byId[c._id] = { ...c.toObject(), replies: [] };
    });

    const roots = [];
    comments.forEach((c) => {
      if (c.parentComment && byId[c.parentComment]) {
        byId[c.parentComment].replies.push(byId[c._id]);
      } else {
        roots.push(byId[c._id]);
      }
    });

    res.json(roots);
  } catch (err) {
    res.status(500).json({ error: "Could not load comments." });
  }
});

// Public: post a new comment or reply
router.post("/:postId", commentLimiter, async (req, res) => {
  try {
    const { name, message, parentComment } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are both required." });
    }
    if (name.length > 60 || message.length > 1000) {
      return res.status(400).json({ error: "That's a bit long — try trimming it down." });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const comment = await Comment.create({
      post: req.params.postId,
      // escape() neutralises any HTML/script tags before it ever reaches the DB
      name: validator.escape(name.trim()),
      message: validator.escape(message.trim()),
      parentComment: parentComment || null,
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Could not post your comment." });
  }
});

// Admin only: remove a comment (moderation)
router.delete("/:commentId", requireAdmin, async (req, res) => {
  try {
    await Comment.deleteMany({
      $or: [{ _id: req.params.commentId }, { parentComment: req.params.commentId }],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete the comment." });
  }
});

module.exports = router;
