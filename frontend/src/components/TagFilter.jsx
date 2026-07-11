import { motion } from "framer-motion";

export default function TagFilter({ tags, activeTag, onSelect }) {
  if (!tags || tags.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="flex flex-wrap justify-center gap-2 mb-10"
    >
      <button
        onClick={() => onSelect(null)}
        className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${
          !activeTag
            ? "bg-coral text-white border-coral"
            : "bg-white/60 text-teal border-dawn hover:border-coral/50"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${
            activeTag === tag
              ? "bg-coral text-white border-coral"
              : "bg-white/60 text-teal border-dawn hover:border-coral/50"
          }`}
        >
          #{tag}
        </button>
      ))}
    </motion.div>
  );
}