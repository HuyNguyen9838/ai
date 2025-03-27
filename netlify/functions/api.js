// Netlify Function để phục vụ API
const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Đọc biến môi trường
dotenv.config();

// Khởi tạo express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cấu hình multer cho việc upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join('/tmp', 'uploads', 'original');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file JPG hoặc PNG'));
    }
  }
});

// In-memory storage cho các item
const clothingItems = new Map();
let currentId = 1;

// Helper function để chuyển file thành base64
function fileToGenerativePart(filePath, mimeType) {
  const fileData = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: Buffer.from(fileData).toString("base64"),
      mimeType
    },
  };
}

// Model configuration
const CURRENT_MODEL = {
  modelName: "gemini-2.0-flash-exp-image-generation",
  temperature: 0.4,
  topP: 0.95,
  topK: 32,
  maxOutputTokens: 4096,
  responseModalities: ["TEXT", "IMAGE"]
};

// Khởi tạo Gemini API
let genAI;
function initGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY không được cung cấp. Tính năng tạo hình ảnh sẽ không hoạt động.");
    return false;
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  return true;
}

// API Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được tải lên' });
    }

    const filePath = req.file.path;
    const fileName = path.basename(filePath);
    
    // Tạo item mới
    const newItem = {
      id: currentId++,
      originalImage: fileName,
      status: 'pending',
      modelType: req.body.modelType || 'Tự động (mặc định)',
      backgroundType: req.body.backgroundType || 'Studio (mặc định)',
      promptText: req.body.promptText || '',
      createdAt: new Date().toISOString()
    };
    
    clothingItems.set(newItem.id, newItem);
    
    return res.status(201).json(newItem);
  } catch (error) {
    console.error('Error processing upload:', error);
    return res.status(500).json({ message: 'Lỗi khi xử lý tệp tải lên' });
  }
});

app.post('/api/generate/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = clothingItems.get(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm với ID này' });
    }
    
    // Đánh dấu là đang xử lý
    item.status = 'processing';
    clothingItems.set(id, item);
    
    // Generate image
    console.log(`Đang tạo hình ảnh cho sản phẩm ${id} với:
- Loại người mẫu: ${item.modelType}
- Nền: ${item.backgroundType}
- Độ dài prompt: ${item.promptText ? item.promptText.length : 0} ký tự`);
    
    const generatedBase64 = await generateTryOnImage(item);
    
    // Lưu hình ảnh đã tạo
    const uploadPath = path.join('/tmp', 'uploads', 'generated');
    fs.mkdirSync(uploadPath, { recursive: true });
    
    const generatedFileName = `${Date.now()}_generated.jpg`;
    const generatedFilePath = path.join(uploadPath, generatedFileName);
    
    fs.writeFileSync(generatedFilePath, Buffer.from(generatedBase64, 'base64'));
    
    // Cập nhật item
    item.generatedImage = generatedFileName;
    item.status = 'completed';
    clothingItems.set(id, item);
    
    return res.status(200).json(item);
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Cập nhật item trạng thái lỗi
    const id = parseInt(req.params.id);
    const item = clothingItems.get(id);
    
    if (item) {
      item.status = 'failed';
      item.error = error.message;
      clothingItems.set(id, item);
    }
    
    return res.status(500).json({ 
      message: 'Lỗi khi tạo hình ảnh',
      error: error.message 
    });
  }
});

app.get('/api/clothing/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = clothingItems.get(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm với ID này' });
    }
    
    return res.status(200).json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    return res.status(500).json({ message: 'Lỗi khi truy xuất thông tin sản phẩm' });
  }
});

// Serve uploaded files
app.get('/api/uploads/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join('/tmp', 'uploads', folder, filename);
  
  console.log(`Accessed: /${folder}/${filename}`);
  
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    return res.status(404).json({ message: 'Không tìm thấy tệp' });
  }
});

// Generate try-on image function
async function generateTryOnImage(item) {
  if (!genAI) {
    if (!initGeminiAPI()) {
      throw new Error("Không thể khởi tạo Gemini API. Vui lòng kiểm tra API key.");
    }
  }

  try {
    console.log("Đang tạo hình ảnh với Gemini API...");
    console.log(`Sử dụng mô hình: ${CURRENT_MODEL.modelName}`);
    
    const generationConfig = {
      temperature: CURRENT_MODEL.temperature,
      topP: CURRENT_MODEL.topP,
      maxOutputTokens: CURRENT_MODEL.maxOutputTokens,
      topK: CURRENT_MODEL.topK,
      responseModalities: CURRENT_MODEL.responseModalities
    };
    
    const model = genAI.getGenerativeModel({ 
      model: CURRENT_MODEL.modelName,
      generationConfig
    });
    
    // Get the image file path
    const origImagePath = path.join('/tmp', 'uploads', 'original', item.originalImage);
    
    console.log(`Processing image: ${origImagePath}`);
    
    // Ensure the file exists
    if (!fs.existsSync(origImagePath)) {
      throw new Error(`Không tìm thấy tệp hình ảnh: ${origImagePath}`);
    }
    
    // Create image part
    const imagePart = fileToGenerativePart(
      origImagePath,
      origImagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
    );
    
    // Create prompt based on user input and image type
    let promptText = `Generate a photorealistic image of a person wearing this clothing item. I'd like to see how it would look on a real model.

Important: 
- Return ONLY an image of a human model wearing this clothing item
- The output must be a standalone jpg/png image
- Do not include any text descriptions or explanations in your response
- Generate a new image with a real person wearing exactly this item of clothing
- Make the final image clear, high-quality, and in a standard fashion catalog style
`;
    
    // Add user prompt if provided
    if (item.promptText) {
      promptText += `\nCustom instructions: ${item.promptText}\n`;
    }
    
    // Enhanced model type processing
    if (item.modelType && item.modelType !== "Tự động (mặc định)") {
      // Extract demographic details based on model type
      let gender = "neutral";
      let body = "";
      let age = "";
      let ethnicity = "";
      
      if (item.modelType.includes("Nam")) {
        gender = "male";
      } else if (item.modelType.includes("Nữ")) {
        gender = "female";
      }
      
      if (item.modelType.includes("Dáng cao")) {
        body = "tall";
      } else if (item.modelType.includes("Dáng trung bình")) {
        body = "average height";
      }
      
      if (item.modelType.includes("Trẻ trung")) {
        age = "young adult (20-30 years old)";
      } else if (item.modelType.includes("Trung niên")) {
        age = "middle-aged (35-50 years old)";
      }
      
      if (item.modelType.includes("Châu Á")) {
        ethnicity = "Asian";
      }
      
      // Construct a detailed model description
      let modelDescription = `Model specifications: ${gender} model`;
      
      if (body) {
        modelDescription += `, ${body}`;
      }
      
      if (age) {
        modelDescription += `, ${age}`;
      }
      
      if (ethnicity) {
        modelDescription += `, ${ethnicity} ethnicity`;
      }
      
      promptText += `\n${modelDescription}`;
    }
    
    // Enhanced background processing
    if (item.backgroundType && item.backgroundType !== "Studio (mặc định)") {
      let backgroundDescription = "";
      
      switch (item.backgroundType) {
        case "Bãi biển":
          backgroundDescription = "a beautiful beach with golden sand and blue ocean waves in the background";
          break;
        case "Công viên":
          backgroundDescription = "a lush green park with trees and walking paths";
          break;
        case "Phố chính":
          backgroundDescription = "a bustling main street with urban architecture in the background";
          break;
        case "Quán cà phê":
          backgroundDescription = "a cozy coffee shop interior with warm lighting and seating areas";
          break;
        case "Cửa hàng thời trang":
          backgroundDescription = "a modern fashion store interior with minimal design";
          break;
        case "Phòng khách":
          backgroundDescription = "a contemporary living room with modern furniture";
          break;
        case "Sân vườn":
          backgroundDescription = "a beautiful garden with flowers and greenery";
          break;
        case "Ngoài trời":
          backgroundDescription = "an outdoor setting with natural light";
          break;
        case "Đô thị":
          backgroundDescription = "an urban cityscape background";
          break;
        case "Thiên nhiên":
          backgroundDescription = "a natural landscape with trees and vegetation";
          break;
        case "Trung tính":
          backgroundDescription = "a neutral, solid color background";
          break;
        default:
          backgroundDescription = item.backgroundType;
      }
      
      promptText += `\nBackground setting: ${backgroundDescription}`;
    }
    
    console.log("Generated prompt:", promptText);
    
    console.log("Đang gửi yêu cầu tạo hình ảnh đến Gemini API...");
    console.log("Đang đợi phản hồi (quá trình này có thể mất 1-2 phút)...");
    
    // Thiết lập timeout 5 phút
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Quá thời gian chờ - Gemini API không phản hồi sau 5 phút")), 5 * 60 * 1000);
    });
    
    // Generate the image with timeout
    const result = await Promise.race([
      model.generateContent([
        promptText,
        imagePart
      ]),
      timeoutPromise
    ]);
    
    const response = result.response;
    
    // Check if there are parts in the response and they include images
    if (response.candidates && 
        response.candidates[0] && 
        response.candidates[0].content && 
        response.candidates[0].content.parts) {
      
      const parts = response.candidates[0].content.parts;
      
      // Log parts structure for debugging
      console.log("Response parts:", JSON.stringify(parts.map(p => ({
        hasText: 'text' in p,
        hasInlineData: 'inlineData' in p && p.inlineData ? true : false,
        mimeType: 'inlineData' in p && p.inlineData ? p.inlineData.mimeType : undefined
      })), null, 2));
      
      // Find image part
      for (const part of parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          
          if (base64Data) {
            console.log("Found image data in response");
            console.log("Đã tạo hình ảnh thành công với Gemini");
            console.log(`Received base64 image data (length: ${base64Data.length} characters)`);
            return base64Data;
          }
        }
      }
      
      // Also check for text part that might contain base64 data
      for (const part of parts) {
        if (part.text) {
          // Try to extract base64 data from text
          const base64Regex = /data:image\/(jpeg|png);base64,([^"]*)/;
          const matches = part.text.match(base64Regex);
          
          if (matches && matches[2]) {
            console.log("Found base64 data in text response");
            return matches[2];
          }
        }
      }
    }
    
    // If we get here, no image data was found
    throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi từ Gemini")
  } catch (error) {
    console.error("Lỗi khi tạo hình ảnh với Gemini:", error);
    throw error;
  }
}

// Error handler
app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi máy chủ nội bộ'
  });
});

// Export handler function for serverless deployment
module.exports.handler = serverless(app);