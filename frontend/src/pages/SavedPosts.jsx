import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function SavedPosts() {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem("soulscript_saved_posts") || "[]"));
    } catch {
      setSaved([]);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="text-3xl mb-6">Your saved posts</h1>
      {saved.length === 0 ? (
        <p className="text-ink/60">
          Nothing saved yet — tap "Save" on any post to keep it here.
        </p>
      ) : (
        <ul className="space-y-3">
          {saved.map((post) => (
            <motion.li
              key={post.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                to={`/post/${post.slug}`}
                className="block bg-white/60 hover:bg-white/90 rounded-2xl p-4 border border-dawn/50 transition-colors"
              >
                <p className="font-medium text-teal">{post.title}</p>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}