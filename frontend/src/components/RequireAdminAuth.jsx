import { Navigate } from "react-router-dom";

export default function RequireAdminAuth({ children }) {
  const token = localStorage.getItem("soulscript_admin_token");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
