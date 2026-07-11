import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // { type: "success" | "error", message }
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const { data } = await api.post("/subscribers", { email });
      setStatus({ type: "success", message: data.message });
      setEmail("");
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 rounded-2xl px-6 py-5 border border-dawn/50 shadow-cloud mb-10 text-center"
    >
      <p className="text-sm font-medium text-teal mb-1">Get new posts in your inbox</p>
      <p className="text-xs text-ink/60 mb-4">No spam, just an email when something new goes up.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 px-4 py-2 rounded-full bg-cloud/70 border border-dawn focus:border-coral outline-none text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-coral text-white px-5 py-2 rounded-full text-sm font-medium hover:brightness-105 transition disabled:opacity-60"
        >
          {submitting ? "..." : "Subscribe"}
        </button>
      </form>
      {status && (
        <p className={`text-xs mt-3 ${status.type === "success" ? "text-teal" : "text-red-500"}`}>
          {status.message}
        </p>
      )}
    </motion.div>
  );
}