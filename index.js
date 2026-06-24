const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const postRoutes = require("./routes/postRoutes");
const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const envOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...envOrigins,
]);

function isAllowedOrigin(origin) {
  return (
    allowedOrigins.has(origin) ||
    /^https:\/\/.*\.netlify\.app$/i.test(origin) ||
    /^https:\/\/.*\.vercel\.app$/i.test(origin) ||
    /^https:\/\/.*\.onrender\.com$/i.test(origin)
  );
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders(res) {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

/** Lightweight health check — responds before DB is ready (keeps Render awake). */
app.get("/api/health", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(200).json({
    ok: true,
    db: dbReady ? "connected" : "connecting",
  });
});

app.use("/api/auth", authRoutes);
app.use("/post", postRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/inquiries", inquiryRoutes);

app.use((err, req, res, next) => {
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectDB().catch((err) => {
  console.error("DB connection failed ❌", err.message);
});
