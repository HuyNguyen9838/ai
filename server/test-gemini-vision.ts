import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Hàm chuyển đổi tệp hình ảnh thành một phần dữ liệu cho API
function fileToGenerativePart(filePath: string, mimeType: string) {
  const imageData = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: Buffer.from(imageData).toString('base64'),
      mimeType
    },
  };
}

async function testGeminiVision() {
  try {
    console.log("Kiểm tra khả năng phân tích hình ảnh của Gemini...");
    
    // Lấy API key từ biến môi trường
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Không tìm thấy GEMINI_API_KEY trong biến môi trường!");
      return;
    }
    
    // Khởi tạo API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Sử dụng mô hình vision
    const modelName = "gemini-1.5-pro-latest"; // gemini-1.5-pro bây giờ có khả năng vision tích hợp
    const model = genAI.getGenerativeModel({ model: modelName });
    
    console.log(`Sử dụng mô hình: ${modelName}`);
    
    // Đường dẫn đến hình ảnh kiểm tra
    const imagePath = path.join(process.cwd(), 'uploads', 'original', 'test-image.png');
    console.log(`Sử dụng hình ảnh: ${imagePath}`);
    
    // Chuyển đổi hình ảnh thành định dạng yêu cầu
    const imagePart = fileToGenerativePart(imagePath, 'image/png');
    
    // Tạo lời nhắc để phân tích hình ảnh
    const prompt = "Hãy mô tả chi tiết món quần áo này. Bao gồm màu sắc, kiểu dáng, chất liệu, và bất kỳ chi tiết đặc biệt nào khác.";
    
    console.log("Gửi request đến Gemini API...");
    
    // Gửi yêu cầu phân tích hình ảnh
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    console.log("\n✅ Phân tích hình ảnh từ Gemini API:");
    console.log(text);
    
  } catch (error) {
    console.error("❌ Lỗi:", error);
  }
}

// Chạy hàm kiểm tra
testGeminiVision();