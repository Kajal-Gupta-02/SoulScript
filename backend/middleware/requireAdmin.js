const jwt = require("jsonwebtoken");

// Gate keeper for anything only the blog owner should be able to do:
// creating, editing, or deleting posts. Everything else on the site
// stays open to visitors with no login at all.
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Admin login required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Not authorized." });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired, please log in again." });
  }
}

module.exports = requireAdmin;
