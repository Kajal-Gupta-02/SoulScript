import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { username, password });
      localStorage.setItem("soulscript_admin_token", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-20">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white/70 rounded-3xl p-7 shadow-cloud border border-dawn/50 space-y-4"
      >
        <h1 className="text-2xl mb-1">Admin login</h1>
        <p className="text-sm text-ink/60 mb-4">Only for the person who writes here.</p>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          className="w-full px-4 py-2.5 rounded-xl bg-cloud/70 border border-dawn focus:border-coral outline-none"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full px-4 py-2.5 rounded-xl bg-cloud/70 border border-dawn focus:border-coral outline-none"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-coral text-white py-2.5 rounded-full font-medium hover:brightness-105 transition disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </motion.form>
    </div>
  );
}
