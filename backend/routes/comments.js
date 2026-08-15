const express = require("express");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const requireAdmin = require("../middleware/requireAdmin");
const moderateText = require("../utils/moderateText");

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
    const comments = await Comment.find({
      post: req.params.postId,
      status: "approved",
    }).sort({ createdAt: 1 });
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
// Public: submit a new comment or reply — goes into the pending queue,
// nothing shows on the site until it's approved from the admin dashboard.
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

    const cleanName = validator.escape(name.trim());
    const cleanMessage = validator.escape(message.trim());
    const { flagged } = moderateText(name, message);

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;

    const comment = await Comment.create({
      post: req.params.postId,
      name: cleanName,
      message: cleanMessage,
      parentComment: parentComment || null,
      status: "pending",
      flagged,
      ip,
    });

    res.status(201).json({
      message: "Thanks! Your comment will show up once it's reviewed.",
      id: comment._id,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not post your comment." });
  }
});

// Admin only: list pending (and optionally all) comments across posts
router.get("/admin/queue", requireAdmin, async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const filter = status === "all" ? {} : { status };
    const comments = await Comment.find(filter)
      .select("+ip")
      .populate("post", "title slug")
      .sort({ flagged: -1, createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Could not load the comment queue." });
  }
});

// Admin only: approve a pending comment
router.patch("/:commentId/approve", requireAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { status: "approved" },
      { new: true }
    );
    if (!comment) return res.status(404).json({ error: "Comment not found." });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: "Could not approve the comment." });
  }
});

// Admin only: reject a pending comment (kept in DB, just hidden)
router.patch("/:commentId/reject", requireAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { status: "rejected" },
      { new: true }
    );
    if (!comment) return res.status(404).json({ error: "Comment not found." });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: "Could not reject the comment." });
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
