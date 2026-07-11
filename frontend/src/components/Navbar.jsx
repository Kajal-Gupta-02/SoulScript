import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 backdrop-blur-md bg-cloud/70 border-b border-dawn/60"
    >
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-teal tracking-tight">
          SoulScript
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-ink/80">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-coral transition-colors ${isActive ? "text-coral" : ""}`
            }
          >
            Read
          </NavLink>
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `hover:text-coral transition-colors ${isActive ? "text-coral" : ""}`
            }
          >
            Saved
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `hover:text-coral transition-colors ${isActive ? "text-coral" : ""}`
            }
          >
            About
          </NavLink>
        </nav>
      </div>
    </motion.header>
  );
}
