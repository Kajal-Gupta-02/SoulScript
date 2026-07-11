import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FeaturedPost({ post }) {
  if (!post) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <Link
        to={`/post/${post.slug}`}
        className="block relative overflow-hidden rounded-3xl p-8 sm:p-10 shadow-cloud border border-dawn/50 bg-gradient-to-br from-white/80 via-blush/30 to-dawn/40 hover:shadow-lg transition-shadow group"
      >
        <span className="inline-block text-xs font-mono tracking-wide text-coral mb-3 px-3 py-1 rounded-full bg-coral/10">
          LATEST
        </span>
        <h2 className="text-3xl sm:text-4xl mb-3 group-hover:text-coral transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-ink/75 leading-relaxed max-w-xl mb-4">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs font-mono text-teal/70">
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTimeMinutes} min read</span>
        </div>
      </Link>
    </motion.div>
  );
}