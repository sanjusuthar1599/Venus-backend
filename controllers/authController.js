const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");

  const adminEmail = String(process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminEmail || !adminPassword) {
    return res.status(503).json({
      message:
        "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in the API .env file.",
    });
  }

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { role: "admin", email: adminEmail },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: { email: adminEmail, role: "admin" },
  });
};

module.exports = { login };
