// Lightweight first-pass filter. Not a full moderation system on its own —
// it just flags obviously bad stuff so it doesn't go live before a human
// (you) looks at it. Everything still lands in the pending queue either way.

const BLOCKED_WORDS = [
  // profanity (kept mild/generic on purpose — extend this list anytime)
  "fuck", "shit", "bitch", "bastard", "asshole", "slut", "whore", "cunt",
  "randi", "chutiya", "madarchod", "behenchod", "bhosdi", "harami", "saala kutta",
  // common spam/scam markers
  "http://", "https://", "www.", "buy now", "click here", "free followers",
  "crypto", "forex", "bit.ly", "t.me/",
];

function moderateText(name, message) {
  const combined = `${name} ${message}`.toLowerCase();
  const hit = BLOCKED_WORDS.some((word) => combined.includes(word));
  return { flagged: hit };
}

module.exports = moderateText;