const mongoose = require("mongoose");

// Five moods a reader can leave on a post. This same list drives the
// Vibe Orb colour on the frontend, so keep the two in sync if it changes.
const VIBE_TYPES = ["calm", "happy", "thoughtful", "inspired", "nostalgic"];

const reactionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    vibe: {
      type: String,
      enum: VIBE_TYPES,
      required: true,
    },
    // A random id the frontend generates once and keeps in localStorage.
    // Not tied to any real identity, just enough to stop one visitor from
    // stacking the same reaction a hundred times.
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// One visitor can only have one active vibe per post at a time. Changing
// their mind updates the existing reaction instead of creating a new one.
reactionSchema.index({ post: 1, visitorId: 1 }, { unique: true });

reactionSchema.statics.VIBE_TYPES = VIBE_TYPES;

module.exports = mongoose.model("Reaction", reactionSchema);
