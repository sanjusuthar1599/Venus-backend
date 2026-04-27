const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

connectDB();

app.use(cors());
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


app.use("/api/auth", authRoutes);
app.use("/post", postRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
