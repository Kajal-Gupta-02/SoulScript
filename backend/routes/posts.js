const Subscriber = require("../models/Subscriber");
const { notifyAllSubscribers } = require("../utils/mailer");
const express = require("express");
const slugify = require("slugify");
const validator = require("validator");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Reaction = require("../models/Reaction");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

function estimateReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
// Public: quick summary used to enrich the homepage - total counts and
// the distinct tags currently in use, so the tag filter bar and stats
// strip both stay in sync with real published content.
router.get("/meta/summary", async (req, res) => {
  try {
    const posts = await Post.find({ published: true }).select("tags");
    const totalPosts = posts.length;
    const tagSet = new Set();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    res.json({ totalPosts, tags: Array.from(tagSet).sort() });
  } catch (err) {
    res.status(500).json({ error: "Could not load site summary." });
  }
});

// Public: list published posts, newest first
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .sort({ createdAt: -1 })
      .select(
        "title slug excerpt coverImage tags readingTimeMinutes createdAt",
      );
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Could not load posts right now." });
  }
});

// Public: single post by slug
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true });
    if (!post)
      return res.status(404).json({ error: "That post doesn't exist." });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Could not load that post." });
  }
});
// Public: someone saved this post (bookmarked it in their browser)
router.post("/:id/save", async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { savesCount: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not log save." });
  }
});

// Public: someone shared this post
router.post("/:id/share", async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { sharesCount: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not log share." });
  }
});

// Admin only: create a post
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const safeCoverImage =
      coverImage && validator.isURL(coverImage, { require_protocol: true })
        ? coverImage
        : "";

    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let attempt = 1;
    while (await Post.exists({ slug })) {
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

    const post = await Post.create({
      title: title.trim(),
      excerpt: (excerpt || "").trim(),
      content,
      coverImage: safeCoverImage,
      tags: Array.isArray(tags)
        ? tags.slice(0, 8).map((t) => String(t).trim())
        : [],
      slug,
      readingTimeMinutes: estimateReadingTime(content),
    });
    // Fire-and-forget: don't make the admin wait for every email to send
    notifyAllSubscribers(post, Subscriber).catch((err) =>
      console.error("Notification batch failed:", err.message),
    );

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Could not create the post." });
  }
});

// Admin only: update a post
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, tags, published } = req.body;
    const update = {};

    if (title) update.title = title.trim();
    if (excerpt !== undefined) update.excerpt = excerpt.trim();
    if (content) {
      update.content = content;
      update.readingTimeMinutes = estimateReadingTime(content);
    }
    if (coverImage !== undefined) {
      update.coverImage =
        coverImage && validator.isURL(coverImage, { require_protocol: true })
          ? coverImage
          : "";
    }
    if (Array.isArray(tags)) update.tags = tags.slice(0, 8);
    if (typeof published === "boolean") update.published = published;

    const post = await Post.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Could not update the post." });
  }
});

// Admin only: delete a post and its comments/reactions
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    await Comment.deleteMany({ post: post._id });
    await Reaction.deleteMany({ post: post._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete the post." });
  }
});

// Admin only: list all posts including drafts, for the dashboard
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Could not load posts." });
  }
});

module.exports = router;
