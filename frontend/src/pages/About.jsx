import { motion } from "framer-motion";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-5 py-16"
    >
      <h1 className="text-3xl mb-5">About this place</h1>
      <p className="text-ink/80 leading-relaxed mb-4">
        SoulScript is a small, personal space for writing things down —
        half journal, half open conversation. No accounts, no noise, just
        thoughts and the people who want to respond to them.
      </p>
      <p className="text-ink/80 leading-relaxed">
        The glow drifting in the background is the "Vibe Orb" — it shifts
        colour based on how readers have been reacting across every post
        recently. Right now, it's picking up on{" "}
        <span className="text-coral font-medium">this week's collective mood</span>.
      </p>
    </motion.div>
  );
}
