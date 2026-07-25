const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

// @desc  Upload a single file (local disk / Cloudinary via Multer)
// @route POST /api/uploads/file
const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please upload a file." });
  }

  // Multer-storage-cloudinary sets path to the remote secure URL.
  // Local storage sets path to a local directory, so we construct the url using req host.
  const fileUrl = req.file.path && req.file.path.startsWith("http")
    ? req.file.path
    : `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    message: "File uploaded successfully.",
    url: fileUrl,
  });
};

// @desc  Get secure signature for Cloudinary direct client-side upload
// @route GET /api/uploads/sign
const getUploadSignature = async (req, res) => {
  try {
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== "your_api_key" &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_API_SECRET !== "your_api_secret";

    if (!isCloudinaryConfigured) {
      return res.status(400).json({
        success: false,
        message: "Cloudinary is not configured on the backend server. Falling back to local upload.",
      });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "lms_videos";

    // Create signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate signature.", error: error.message });
  }
};

// @desc  Stream video with Range/Partial content support (CORS safe, high performance)
// @route GET /uploads/:filename
const streamFile = async (req, res) => {
  const filename = req.params.filename;
  // Uploads folder is at the backend root level
  const filePath = path.join(__dirname, "../../../uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found." });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Extension to mime-type mapper
  const ext = path.extname(filename).toLowerCase();
  const extMap = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".ogv": "video/ogg",
    ".mp3": "audio/mp3",
    ".wav": "audio/wav",
    ".m4a": "audio/x-m4a",
    ".mkv": "video/x-matroska",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".wmv": "video/x-ms-wmv",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".zip": "application/zip",
    ".txt": "text/plain",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  const contentType = extMap[ext] || "application/octet-stream";

  // Check if it's a media range request
  if (range && (contentType.startsWith("video/") || contentType.startsWith("audio/"))) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });

    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000",
      "Cross-Origin-Resource-Policy": "cross-origin",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // Normal file download/serving
    const head = {
      "Content-Length": fileSize,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000",
      "Cross-Origin-Resource-Policy": "cross-origin",
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
};

module.exports = { uploadFile, getUploadSignature, streamFile };
