const express = require('express');
const serverless = require('serverless-http');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

// Middleware
app.use(express.json());

// Khởi tạo Gemini API
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

// API endpoints
app.post('/api/generate', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const result = await model.generateContent(req.body.prompt);
    const response = await result.response;
    res.json({ generated: response.text() });
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    res.status(500).json({ error: error.message });
  }
});

// Error handler (keeping original error handling)
app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi máy chủ nội bộ'
  });
});

// Export handler function
exports.handler = serverless(app);