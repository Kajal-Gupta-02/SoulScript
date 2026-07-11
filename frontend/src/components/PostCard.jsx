import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PostCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group"
    >
      <Link
        to={`/post/${post.slug}`}
        className="block bg-white/60 hover:bg-white/90 rounded-3xl p-6 shadow-cloud border border-dawn/50 transition-all hover:-translate-y-1"
      >
        <div className="flex items-center gap-3 text-xs font-mono text-teal/70 mb-3">
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTimeMinutes} min read</span>
        </div>
        <h2 className="text-2xl mb-2 group-hover:text-coral transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-ink/75 leading-relaxed mb-3">{post.excerpt}</p>
        )}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2.5 py-1 rounded-full bg-blush/60 text-teal"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </motion.article>
  );
}
