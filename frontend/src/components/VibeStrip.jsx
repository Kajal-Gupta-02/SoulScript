import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api";

const VIBE_DISPLAY = {
  calm: { emoji: "🌊", label: "Calm" },
  happy: { emoji: "🌸", label: "Happy" },
  thoughtful: { emoji: "🌙", label: "Thoughtful" },
  inspired: { emoji: "✨", label: "Inspired" },
  nostalgic: { emoji: "🍃", label: "Nostalgic" },
};

export default function VibeStrip() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    api
      .get("/reactions/site-vibe")
      .then(({ data }) => setCounts(data))
      .catch(() => {});
  }, []);

  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  if (!counts || total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-white/60 rounded-2xl px-5 py-4 shadow-cloud border border-dawn/50 mb-10"
    >
      <p className="text-xs font-mono text-teal/60 mb-3 text-center">
        THE COMMUNITY'S MOOD THIS MONTH
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        {Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([vibe, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const display = VIBE_DISPLAY[vibe];
            if (!display) return null;
            return (
              <div key={vibe} className="flex flex-col items-center min-w-[64px]">
                <span className="text-2xl mb-1">{display.emoji}</span>
                <span className="text-xs text-ink/70">{display.label}</span>
                <span className="text-xs font-mono text-coral">{pct}%</span>
              </div>
            );
          })}
      </div>
    </motion.div>
  );
}