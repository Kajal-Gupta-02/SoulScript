import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the admin token automatically if one is stored, so admin-only
// requests (creating/editing/deleting posts) authenticate themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("soulscript_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gives every visitor a stable, anonymous id (no login) so we can stop
// one person from spamming the same reaction over and over.
export function getVisitorId() {
  let id = localStorage.getItem("soulscript_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("soulscript_visitor_id", id);
  }
  return id;
}

export default api;
