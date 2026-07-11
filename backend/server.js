require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const postsRoutes = require("./routes/posts");
const subscribersRoutes = require("./routes/subscribers");
const commentsRoutes = require("./routes/comments");
const reactionsRoutes = require("./routes/reactions");
const authRoutes = require("./routes/auth");

const app = express();

// --- Security basics -------------------------------------------------
app.use(helmet());
app.disable("x-powered-by");

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools like curl/Postman (no origin header) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize()); // strips out any $ / . operators someone tries to inject via body/query

// A gentle global limiter on top of the stricter per-route ones
const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(globalLimiter);

// --- Routes ------------------------------------------------------------
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/subscribers", subscribersRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/reactions", reactionsRoutes);

// Fallback error handler so raw stack traces never reach a visitor
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end." });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`SoulScript API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
