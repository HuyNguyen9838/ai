
const express = require('express');
const serverless = require('serverless-http');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Parse JSON bodies
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

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

// Generate image with Gemini
app.post('/api/generate/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const originalImagePath = path.join(ORIGINAL_DIR, `${id}.jpg`);

    if (!fs.existsSync(originalImagePath)) {
      return res.status(404).json({ message: 'Original image not found' });
    }

    const imageData = fs.readFileSync(originalImagePath);
    const base64Image = Buffer.from(imageData).toString('base64');

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const result = await model.generateContent([
      "Generate a photorealistic image of a person wearing this clothing item.",
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    
    if (!response || !response.candidates || !response.candidates[0]) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedImagePath = path.join(GENERATED_DIR, `${id}_generated.jpg`);
    await fs.promises.writeFile(generatedImagePath, Buffer.from(response.candidates[0].content, 'base64'));

    res.json({
      id: id,
      generatedImage: `generated/${id}_generated.jpg`,
      status: 'completed'
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      message: 'Không thể tạo hình ảnh. Vui lòng thử lại.',
      error: error.message 
    });
  }
});

// Serve static files
app.use('/api/uploads', express.static(UPLOAD_DIR));

exports.handler = serverless(app);
