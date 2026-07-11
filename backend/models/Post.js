const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    content: {
      // Stored as markdown, rendered safely on the frontend
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      trim: true,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: true,
    },
    readingTimeMinutes: {
      type: Number,
      default: 1,
    },
    savesCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("Post", postSchema);
