import api from "../api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function getSavedPosts() {
  try {
    return JSON.parse(localStorage.getItem("soulscript_saved_posts") || "[]");
  } catch {
    return [];
  }
}

export default function SaveShareBar({ post }) {
  const [isSaved, setIsSaved] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    const saved = getSavedPosts();
    setIsSaved(saved.some((p) => p.slug === post.slug));
  }, [post.slug]);

  function toggleSave() {
    const saved = getSavedPosts();
    let updated;
    if (isSaved) {
      updated = saved.filter((p) => p.slug !== post.slug);
    } else {
      updated = [
        ...saved,
        { slug: post.slug, title: post.title, savedAt: new Date().toISOString() },
      ];
      api.post(`/posts/${post._id}/save`).catch(() => {});
    }
    localStorage.setItem("soulscript_saved_posts", JSON.stringify(updated));
    setIsSaved(!isSaved);
  }

  async function handleShare() {
    api.post(`/posts/${post._id}/share`).catch(() => {});
    const shareUrl = `${window.location.origin}/post/${post.slug}`;
    const shareData = {
      title: post.title,
      text: post.excerpt || "Thought this was worth reading.",
      url: shareUrl,
    };

    // Native share sheet on phones/supported browsers
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet - nothing to do
      }
      return;
    }

    // Fallback for desktop browsers without native share support
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Link copied!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Couldn't copy link.");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={toggleSave}
        aria-pressed={isSaved}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
          isSaved
            ? "bg-coral text-white border-coral"
            : "bg-white/70 text-teal border-dawn hover:border-coral/50"
        }`}
      >
        <span aria-hidden="true">{isSaved ? "★" : "☆"}</span>
        {isSaved ? "Saved" : "Save"}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleShare}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-white/70 text-teal border border-dawn hover:border-coral/50 transition-colors"
      >
        <span aria-hidden="true">↗</span>
        Share
      </motion.button>

      {copyStatus && <span className="text-xs text-teal">{copyStatus}</span>}
    </div>
  );
}