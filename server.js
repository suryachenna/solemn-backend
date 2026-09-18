const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// File uploads stay in memory temporarily
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

// Existing health endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Solemn AI backend is alive 🚀",
  });
});

// Existing ping endpoint
app.get("/ping", (req, res) => {
  res.json({
    command: "ping",
    response: "pong",
  });
});

// Solemn Workspace upload
app.post("/workspace/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const filePath = `test/${Date.now()}-${req.file.originalname}`;

    const { error } = await supabase.storage
      .from("SolemnAI-files")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);

      return res.status(500).json({
        error: "Failed to upload file",
      });
    }

    res.json({
      success: true,
      message: "File uploaded to Solemn Workspace 🚀",
      path: filePath,
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("Workspace error:", error);

    res.status(500).json({
      error: "Workspace upload failed",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Solemn running on port ${PORT}`);
});