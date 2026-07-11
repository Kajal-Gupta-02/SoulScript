import SubscribeForm from "../components/SubscribeForm";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../api";
import PostCard from "../components/PostCard";
import FeaturedPost from "../components/FeaturedPost";
import TagFilter from "../components/TagFilter";
import VibeStrip from "../components/VibeStrip";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [summary, setSummary] = useState({ totalPosts: 0, tags: [] });
  const [activeTag, setActiveTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/posts"), api.get("/posts/meta/summary")])
      .then(([postsRes, summaryRes]) => {
        setPosts(postsRes.data);
        setSummary(summaryRes.data);
      })
      .catch(() => setError("Couldn't load posts right now. Try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter((p) => p.tags?.includes(activeTag));
  }, [posts, activeTag]);

  const [featured, ...rest] = filteredPosts;

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl sm:text-5xl mb-3">Thoughts, out loud.</h1>
        <p className="text-ink/70 max-w-xl mx-auto mb-4">
          A quiet corner of the internet for things worth writing down —
          and worth talking about. Read something, leave a vibe, say what you think.
        </p>
        {summary.totalPosts > 0 && (
          <p className="text-xs font-mono text-teal/60">
            {summary.totalPosts} {summary.totalPosts === 1 ? "post" : "posts"} shared so far
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-white/50 rounded-2xl px-6 py-5 mb-10 border border-dawn/40 text-center"
      >
        <p className="text-sm text-ink/70 leading-relaxed max-w-lg mx-auto">
          Hi, I'm Kajal — this is where I put down the things I'm too shy to
          say out loud. Letters to people I'll never send them to, and
          spirals my brain won't let go of. Stay a while, and if something
          feels familiar, tell me in the comments.
        </p>
      </motion.div>

      <VibeStrip />
      <SubscribeForm />

      <TagFilter tags={summary.tags} activeTag={activeTag} onSelect={setActiveTag} />

      {loading && <p className="text-center text-ink/60">Loading posts...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && filteredPosts.length === 0 && !error && (
        <p className="text-center text-ink/60">
          {activeTag
            ? `No posts tagged #${activeTag} yet.`
            : "No posts yet — the first one is coming soon."}
        </p>
      )}

      {!activeTag && featured && <FeaturedPost post={featured} />}

      <div className="space-y-6">
        {(activeTag ? filteredPosts : rest).map((post, i) => (
          <PostCard key={post._id} post={post} index={i} />
        ))}
      </div>
    </div>
  );
}