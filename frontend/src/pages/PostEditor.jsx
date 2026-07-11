import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";

export default function PostEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    api.get("/posts/admin/all").then(({ data }) => {
      const post = data.find((p) => p._id === id);
      if (post) {
        setTitle(post.title);
        setExcerpt(post.excerpt || "");
        setContent(post.content);
        setCoverImage(post.coverImage || "");
        setTags((post.tags || []).join(", "));
      }
    });
  }, [id, isEditing]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title,
      excerpt,
      content,
      coverImage,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (isEditing) {
        await api.put(`/posts/${id}`, payload);
      } else {
        await api.post("/posts", payload);
      }
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't save the post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <h1 className="text-3xl mb-4">{isEditing ? "Edit post" : "New post"}</h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          maxLength={150}
          className="w-full px-4 py-3 rounded-xl bg-white/70 border border-dawn focus:border-coral outline-none text-lg font-display"
          required
        />
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short excerpt (shown on the homepage)"
          maxLength={300}
          className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-dawn focus:border-coral outline-none"
        />
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="Cover image URL (optional)"
          className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-dawn focus:border-coral outline-none"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags, comma separated (e.g. life, tech, thoughts)"
          className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-dawn focus:border-coral outline-none"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post in Markdown..."
          rows={16}
          className="w-full px-4 py-3 rounded-xl bg-white/70 border border-dawn focus:border-coral outline-none font-mono text-sm"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-coral text-white px-6 py-2.5 rounded-full font-medium hover:brightness-105 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : isEditing ? "Save changes" : "Publish post"}
        </button>
      </motion.form>
    </div>
  );
}
