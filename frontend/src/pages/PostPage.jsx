import SaveShareBar from "../components/SaveShareBar";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api";
import ReactionDock from "../components/ReactionDock";
import CommentSection from "../components/CommentSection";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/posts/${slug}`)
      .then(({ data }) => setPost(data))
      .catch(() => setError("This post couldn't be found."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="text-center py-20 text-ink/60">Loading...</p>;
  }

  if (error || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-ink/70 mb-4">{error}</p>
        <Link to="/" className="text-coral underline">
          Back to all posts
        </Link>
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-5 py-12"
    >
      <Link to="/" className="text-sm text-teal/70 hover:text-coral mb-6 inline-block">
        ← All posts
      </Link>

      {post.coverImage && (
        <img
          src={post.coverImage}
          alt=""
          className="w-full rounded-3xl mb-8 shadow-cloud object-cover max-h-80"
        />
      )}

      <div className="flex items-center gap-3 text-xs font-mono text-teal/70 mb-3">
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readingTimeMinutes} min read</span>
      </div>

      <h1 className="text-3xl sm:text-4xl mb-6">{post.title}</h1>

      <div className="prose-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 mb-8">
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

      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <ReactionDock postId={post._id} />
        <SaveShareBar post={post} />
      </div>

      <CommentSection postId={post._id} />
    </motion.article>
  );
}
