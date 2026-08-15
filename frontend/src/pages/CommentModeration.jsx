import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const units = [
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

export default function CommentModeration() {
  const [comments, setComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/comments/admin/queue?status=${statusFilter}`);
      setComments(data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/admin/login");
      else setError("Couldn't load comments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function approve(id) {
    await api.patch(`/comments/${id}/approve`);
    setComments((prev) => prev.filter((c) => c._id !== id));
  }

  async function reject(id) {
    await api.patch(`/comments/${id}/reject`);
    setComments((prev) => prev.filter((c) => c._id !== id));
  }

  async function remove(id) {
    if (!confirm("Permanently delete this comment?")) return;
    await api.delete(`/comments/${id}`);
    setComments((prev) => prev.filter((c) => c._id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Comments</h1>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize ${
                statusFilter === s
                  ? "bg-coral text-white border-coral"
                  : "border-dawn hover:border-coral"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-ink/60 text-sm">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-ink/60 text-sm">Nothing here right now.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white/70 rounded-2xl p-4 shadow-cloud border space-y-2 ${
                c.flagged ? "border-red-300" : "border-dawn/50"
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-teal">{c.name}</span>
                  {c.flagged && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                      flagged
                    </span>
                  )}
                </div>
                <span className="text-xs text-ink/50 font-mono">{timeAgo(c.createdAt)}</span>
              </div>

              <p className="text-ink/85 leading-relaxed">{c.message}</p>

              <p className="text-xs text-ink/40 font-mono">
                on "{c.post?.title || "unknown post"}"
              </p>

              <div className="flex gap-2 pt-1">
                {statusFilter !== "approved" && (
                  <button
                    onClick={() => approve(c._id)}
                    className="text-xs px-3 py-1.5 rounded-full border border-teal text-teal hover:bg-teal/10"
                  >
                    Approve
                  </button>
                )}
                {statusFilter !== "rejected" && (
                  <button
                    onClick={() => reject(c._id)}
                    className="text-xs px-3 py-1.5 rounded-full border border-dawn hover:border-coral"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => remove(c._id)}
                  className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}