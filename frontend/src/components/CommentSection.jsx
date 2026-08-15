import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function CommentItem({ comment, onReply }) {
  const [replying, setReplying] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function submitReply(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    onReply(comment._id, name, message);
    setName("");
    setMessage("");
    setReplying(false);
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-l-2 border-dawn/60 pl-4"
    >
      <div className="bg-white/60 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-teal">{comment.name}</span>
          <span className="text-xs text-ink/50 font-mono">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-ink/85 leading-relaxed">{comment.message}</p>
        <button
          onClick={() => setReplying((r) => !r)}
          className="text-xs font-medium text-coral mt-2 hover:underline"
        >
          {replying ? "Cancel" : "Reply"}
        </button>

        {replying && (
          <form onSubmit={submitReply} className="mt-3 space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full px-3 py-2 rounded-xl bg-cloud/70 border border-dawn text-sm"
              required
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a reply..."
              maxLength={1000}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-cloud/70 border border-dawn text-sm"
              required
            />
            <button
              type="submit"
              className="text-sm bg-coral text-white px-4 py-1.5 rounded-full hover:brightness-105 transition"
            >
              Post reply
            </button>
          </form>
        )}
      </div>

      {comment.replies?.length > 0 && (
        <ul className="mt-3 space-y-3 ml-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} onReply={onReply} />
          ))}
        </ul>
      )}
    </motion.li>
  );
}

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadComments() {
    try {
      const { data } = await api.get(`/comments/${postId}`);
      setComments(data);
    } catch {
      setError("Couldn't load comments. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (postId) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function postComment(parentComment, overrideName, overrideMessage) {
    const commentName = overrideName ?? name;
    const commentMessage = overrideMessage ?? message;
    if (!commentName.trim() || !commentMessage.trim()) return;

    setError("");
    setNotice("");
    try {
      const { data } = await api.post(`/comments/${postId}`, {
        name: commentName,
        message: commentMessage,
        parentComment,
      });
      if (!parentComment) {
        setName("");
        setMessage("");
      }
      setNotice(data.message || "Thanks! Your comment will show up once it's reviewed.");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't post your comment.");
    }
  }

  return (
    <section className="mt-12">
      <h3 className="text-xl mb-4">Join the conversation</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          postComment(null);
        }}
        className="bg-white/60 rounded-2xl p-5 shadow-cloud border border-dawn/50 space-y-3 mb-8"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={60}
          className="w-full px-4 py-2.5 rounded-xl bg-cloud/70 border border-dawn focus:border-coral outline-none"
          required
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What did you think?"
          maxLength={1000}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl bg-cloud/70 border border-dawn focus:border-coral outline-none"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {notice && <p className="text-sm text-teal">{notice}</p>}
        <button
          type="submit"
          className="bg-coral text-white px-5 py-2 rounded-full font-medium hover:brightness-105 transition"
        >
          Post comment
        </button>
      </form>

      {loading ? (
        <p className="text-ink/60 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-ink/60 text-sm">No comments yet — be the first to share your view.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <CommentItem key={c._id} comment={c} onReply={postComment} />
          ))}
        </ul>
      )}
    </section>
  );
}
