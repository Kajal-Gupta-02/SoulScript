import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api";

// Each vibe maps to a colour pair used to tint the ambient blobs.
// If the site has no reactions yet, we just settle on a calm default.
const VIBE_COLORS = {
  calm: ["#BFE6EC", "#EAF7F5"],
  happy: ["#F6CBD4", "#FFE8EE"],
  thoughtful: ["#B8D8DE", "#204E57"],
  inspired: ["#EF8FA8", "#F6CBD4"],
  nostalgic: ["#D9C7E0", "#F6CBD4"],
};

function pickDominantVibe(counts) {
  const entries = Object.entries(counts || {});
  const total = entries.reduce((sum, [, c]) => sum + c, 0);
  if (total === 0) return "calm";
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export default function VibeOrb() {
  const [vibe, setVibe] = useState("calm");

  useEffect(() => {
    let cancelled = false;

    async function loadSiteVibe() {
      try {
        const { data } = await api.get("/reactions/site-vibe");
        if (!cancelled) setVibe(pickDominantVibe(data));
      } catch {
        // Quietly keep the calm default — an ambient background is the
        // last thing that should ever throw a visible error.
      }
    }

    loadSiteVibe();
    // Refresh occasionally so the mood can visibly drift during a visit
    const interval = setInterval(loadSiteVibe, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const [colorA, colorB] = VIBE_COLORS[vibe] || VIBE_COLORS.calm;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full blur-3xl opacity-40 animate-drift"
        style={{ background: colorA, top: "-10%", left: "-10%" }}
        animate={{ background: colorA }}
        transition={{ duration: 2 }}
      />
      <motion.div
        className="absolute w-[50vw] h-[50vw] rounded-full blur-3xl opacity-30 animate-drift"
        style={{ background: colorB, bottom: "-15%", right: "-10%", animationDelay: "-6s" }}
        animate={{ background: colorB }}
        transition={{ duration: 2 }}
      />
    </div>
  );
}
