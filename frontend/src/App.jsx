import SavedPosts from "./pages/SavedPosts";
import Unsubscribe from "./pages/Unsubscribe";
import { Routes, Route } from "react-router-dom";
import VibeOrb from "./components/VibeOrb";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAdminAuth from "./components/RequireAdminAuth";

import Home from "./pages/Home";
import PostPage from "./pages/PostPage";
import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PostEditor from "./pages/PostEditor";
import commentModeration from "./pages/commentModeration";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <VibeOrb />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/unsubscribe/:token" element={<Unsubscribe />} />
          <Route path="/saved" element={<SavedPosts />} />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdminAuth>
                <AdminDashboard />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/admin/new"
            element={
              <RequireAdminAuth>
                <PostEditor />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <RequireAdminAuth>
                <PostEditor />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/admin/comments"
            element={
              <RequireAdminAuth>
                <CommentModeration />
              </RequireAdminAuth>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
