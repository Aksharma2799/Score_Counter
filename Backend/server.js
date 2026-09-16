const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage setup for video files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `badminton-match-${uniqueSuffix}.webm`);
  },
});

const upload = multer({ storage });

// API: Save Match Stats
app.post("/api/matches", (req, res) => {
  const { category, player1, player2, partner1, partner2, score1, score2 } =
    req.body;
  console.log("Match Saved:", { category, player1, player2, score1, score2 });
  res
    .status(201)
    .json({ success: true, message: "Match stats saved successfully" });
});

// API: Upload Video Recording
app.post("/api/upload-video", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No video file provided" });
  }
  console.log("Video Saved:", req.file.path);
  res.status(200).json({
    success: true,
    message: "Video uploaded successfully",
    filePath: req.file.path,
    filename: req.file.filename,
  });
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
