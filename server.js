const express = require("express");
const multer = require("multer");
const { BrevoClient } = require("@getbrevo/brevo");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());
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
// Solemn command endpoint
app.post("/command", async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || !command.trim()) {
      return res.status(400).json({
        success: false,
        error: "Command is required",
      });
    }

    const sendMatch = command.match(
      /^send\s+(.+?)\s+to\s+gmail\s+([^\s]+)$/i
    );

    if (sendMatch) {
      const filename = sendMatch[1].trim();
      const recipient = sendMatch[2].trim();

      const { data: files, error: listError } = await supabase.storage
        .from("SolemnAI-files")
        .list("test", {
          limit: 100,
          offset: 0,
          sortBy: {
            column: "created_at",
            order: "desc",
          },
        });

      if (listError) {
        console.error("Workspace lookup error:", listError);
        return res.status(500).json({
          success: false,
          error: "Could not access Solemn Workspace",
        });
      }

const file = files.find(
  (file) => file.name === filename || file.name.endsWith(`-${filename}`)
);
      if (!file) {
        return res.status(404).json({
          success: false,
          error: `File "${filename}" was not found in Solemn Workspace`,
        });
      }

      const storagePath = `test/${file.name}`;

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("SolemnAI-files")
        .download(storagePath);

      if (downloadError) {
        console.error("File download error:", downloadError);
        return res.status(500).json({
          success: false,
          error: "Could not retrieve file from Solemn Workspace",
        });
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());

const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

try {
  await brevoClient.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.BREVO_FROM_EMAIL,
      name: "Solemn AI",
    },
    to: [
      {
        email: recipient,
      },
    ],
    subject: `File from Solemn: ${filename}`,
    textContent: "Sent automatically by Solemn AI agent.",
    attachment: [
      {
        name: filename,
        content: buffer.toString("base64"),
      },
    ],
  });
} catch (error) {
  console.error("Brevo error:", error);

  return res.status(500).json({
    success: false,
    error: error.message,
  });
}

      return res.json({
        success: true,
        message: `✅ ${filename} was sent to ${recipient}`,
      });
    }

    const { data: files, error } = await supabase.storage
      .from("SolemnAI-files")
      .list("test", {
        limit: 100,
        offset: 0,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      console.error("Workspace lookup error:", error);

      return res.status(500).json({
        success: false,
        error: "Could not access Solemn Workspace",
      });
    }

    res.json({
      success: true,
      command,
      files,
      message: `Solemn received your command: "${command}"`,
    });
  } catch (error) {
    console.error("Command error:", error);

    res.status(500).json({
      success: false,
      error: "Command failed",
    });
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Solemn running on port ${PORT}`);
});
// List files in Solemn Workspace
app.get("/workspace/files", async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from("SolemnAI-files")
      .list("test", {
        limit: 100,
        offset: 0,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      console.error("Supabase list error:", error);

      return res.status(500).json({
        error: "Failed to list workspace files",
      });
    }

    res.json({
      success: true,
      files: data,
    });
  } catch (error) {
    console.error("Workspace files error:", error);

    res.status(500).json({
      error: "Failed to get workspace files",
    });
  }
});