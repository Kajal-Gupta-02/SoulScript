import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api, { getVisitorId } from "../api";

const VIBES = [
  { key: "calm", emoji: "🌊", label: "Calm" },
  { key: "happy", emoji: "🌸", label: "Happy" },
  { key: "thoughtful", emoji: "🌙", label: "Thoughtful" },
  { key: "inspired", emoji: "✨", label: "Inspired" },
  { key: "nostalgic", emoji: "🍃", label: "Nostalgic" },
];

export default function ReactionDock({ postId }) {
  const [counts, setCounts] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    api
      .get(`/reactions/post/${postId}`)
      .then(({ data }) => setCounts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleReact(vibeKey) {
    const previous = selected;
    setSelected(vibeKey);
    setCounts((prev) => {
      const next = { ...prev };
      if (previous) next[previous] = Math.max(0, (next[previous] || 1) - 1);
      next[vibeKey] = (next[vibeKey] || 0) + 1;
      return next;
    });

    try {
      await api.post(`/reactions/post/${postId}`, {
        vibe: vibeKey,
        visitorId: getVisitorId(),
      });
    } catch {
      // If it fails, leave the optimistic UI as-is rather than jarring the
      // reader with a rollback for something this low-stakes.
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/70 rounded-2xl px-4 py-3 shadow-cloud border border-dawn/50">
      <span className="text-sm text-ink/70 font-medium mr-1">This gave me:</span>
      <div className="flex flex-wrap gap-2">
        {VIBES.map((v) => (
          <motion.button
            key={v.key}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
            onClick={() => handleReact(v.key)}
            aria-pressed={selected === v.key}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              selected === v.key
                ? "bg-coral text-white border-coral"
                : "bg-cloud/80 text-teal border-dawn hover:border-coral/50"
            }`}
          >
            <span aria-hidden="true">{v.emoji}</span>
            <span className="hidden sm:inline">{v.label}</span>
            <AnimatePresence mode="popLayout">
              {!loading && (
                <motion.span
                  key={counts[v.key] || 0}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="text-xs font-mono opacity-80"
                >
                  {counts[v.key] || 0}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
