
const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Parse JSON bodies
app.use(express.json());

// Ensure upload directories exist
const UPLOAD_DIR = path.join('/tmp', 'uploads');
const ORIGINAL_DIR = path.join(UPLOAD_DIR, 'original');
const GENERATED_DIR = path.join(UPLOAD_DIR, 'generated');

[UPLOAD_DIR, ORIGINAL_DIR, GENERATED_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Handle file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(ORIGINAL_DIR, fileName);
    
    await fs.promises.writeFile(filePath, req.file.buffer);

    res.status(201).json({
      id: Date.now(),
      originalImage: `original/${fileName}`,
      status: 'pending'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Serve static files
app.use('/api/uploads', express.static(UPLOAD_DIR));

exports.handler = serverless(app);
