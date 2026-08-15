import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [pendingComments, setPendingComments] = useState(null);

  async function load() {
  try {
    const [postsRes, subsRes, commentsRes] = await Promise.all([
      api.get("/posts/admin/all"),
      api.get("/subscribers/count"),
      api.get("/comments/admin/queue?status=pending"),
    ]);
    setPosts(postsRes.data);
    setSubscriberCount(subsRes.data.count);
    setPendingComments(commentsRes.data.length);
  } catch (err) {
    if (err.response?.status === 401) navigate("/admin/login");
    else setError("Couldn't load posts.");
  }
}

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function togglePublish(post) {
    await api.put(`/posts/${post._id}`, { published: !post.published });
    load();
  }

  async function handleDelete(post) {
    if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    await api.delete(`/posts/${post._id}`);
    load();
  }

  function logout() {
    localStorage.removeItem("soulscript_admin_token");
    navigate("/");
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            to="/admin/comments"
            className="relative px-4 py-2 rounded-full text-sm font-medium border border-dawn hover:border-coral"
          >
            Comments
            {pendingComments > 0 && (
              <span className="absolute -top-2 -right-2 bg-coral text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {pendingComments}
              </span>
            )}
          </Link>
          <Link
            to="/admin/new"
            className="bg-coral text-white px-4 py-2 rounded-full text-sm font-medium hover:brightness-105"
          >
            + New post
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-full text-sm font-medium border border-dawn hover:border-coral"
          >
            Log out
          </button>
        </div>
      </div>

      {subscriberCount !== null && (
        <p className="text-sm text-ink/60 mb-6">
          📧 <span className="font-semibold text-teal">{subscriberCount}</span> email subscribers
        </p>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-3">
        {posts.map((post, i) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white/70 rounded-2xl p-4 shadow-cloud border border-dawn/50 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-teal">{post.title}</p>
              <p className="text-xs text-ink/50 font-mono">
                {post.published ? "Published" : "Draft"} ·{" "}
                {new Date(post.createdAt).toLocaleDateString("en-IN")} · ★ {post.savesCount || 0} saved · ↗ {post.sharesCount || 0} shared
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                to={`/admin/edit/${post._id}`}
                className="text-xs px-3 py-1.5 rounded-full border border-dawn hover:border-coral"
              >
                Edit
              </Link>
              <button
                onClick={() => togglePublish(post)}
                className="text-xs px-3 py-1.5 rounded-full border border-dawn hover:border-coral"
              >
                {post.published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => handleDelete(post)}
                className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
        {posts.length === 0 && (
          <p className="text-ink/60 text-sm">No posts yet. Create your first one.</p>
        )}
      </div>
    </div>
  );
}
