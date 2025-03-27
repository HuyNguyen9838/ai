import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

// Hàm để kiểm tra khả năng tạo/xử lý ảnh của các mô hình
async function testImageCapabilities() {
  try {
    console.log('Kiểm tra khả năng xử lý ảnh của các mô hình Gemini...');
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY không được cung cấp.");
      return;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Đường dẫn đến tệp hình ảnh 
    const imagePath = path.join(process.cwd(), 'uploads', 'original', '1742927816795-z6442402147614_d3ad213c8ba1da4e94e979792213d325.jpg');
    
    // Đảm bảo rằng tệp tồn tại
    if (!fs.existsSync(imagePath)) {
      console.error(`Không tìm thấy tệp hình ảnh: ${imagePath}`);
      return;
    }
    
    // Đọc tệp và chuyển đổi thành base64
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString('base64');
    
    // Tạo phần dữ liệu hình ảnh
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg'
      }
    };
    
    // Kiểm tra các mô hình
    const modelNames = [
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];
    
    // Prompt cơ bản để mô tả ảnh (không yêu cầu tạo hình ảnh mới)
    const describePrompt = "Mô tả chi tiết về hình ảnh này";
    
    // Prompt yêu cầu tạo ảnh mới (thực hiện thử trực tiếp, có thể không được hỗ trợ)
    const generatePrompt = `Tạo một hình ảnh của một người mẫu mặc món quần áo trong hình ảnh này.
    Hãy trả về một hình ảnh mới thay vì mô tả. Đừng trả lời bằng văn bản.`;
    
    for (const modelName of modelNames) {
      console.log(`\n===== Kiểm tra mô hình: ${modelName} =====`);
      
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            maxOutputTokens: 2048
          }
        });
        
        console.log(`1. Kiểm tra khả năng MÔ TẢ hình ảnh của ${modelName}...`);
        try {
          const result = await model.generateContent([
            describePrompt,
            imagePart
          ]);
          
          const response = result.response;
          const text = response.text();
          
          console.log(`✅ Mô hình ${modelName} có thể xử lý ảnh và mô tả: "${text.substring(0, 150)}..."`);
        } catch (error) {
          console.error(`❌ Lỗi khi mô tả ảnh với ${modelName}:`, error);
        }
        
        console.log(`\n2. Kiểm tra khả năng TẠO hình ảnh của ${modelName}...`);
        try {
          const result = await model.generateContent([
            generatePrompt,
            imagePart
          ]);
          
          const response = result.response;
          
          console.log(`Phân tích cấu trúc phản hồi từ ${modelName}:`);
          
          if (response.candidates && 
              response.candidates[0] && 
              response.candidates[0].content && 
              response.candidates[0].content.parts) {
            
            const parts = response.candidates[0].content.parts;
            
            // Log parts structure for debugging
            console.log("Parts:", JSON.stringify(parts.map(p => ({
              hasText: 'text' in p,
              hasInlineData: 'inlineData' in p && p.inlineData ? true : false,
              mimeType: 'inlineData' in p && p.inlineData ? p.inlineData.mimeType : undefined
            })), null, 2));
            
            // Kiểm tra xem có phần nào chứa hình ảnh không
            let hasImage = false;
            for (const part of parts) {
              if (part.inlineData) {
                hasImage = true;
                console.log(`✅ Tìm thấy dữ liệu hình ảnh trong phản hồi từ ${modelName}`);
                break;
              }
            }
            
            if (!hasImage) {
              console.log(`❌ Không tìm thấy dữ liệu hình ảnh trong phản hồi từ ${modelName}, chỉ có văn bản.`);
              const text = response.text();
              console.log(`Phản hồi văn bản: "${text.substring(0, 150)}..."`);
            }
          } else {
            console.log(`❌ Cấu trúc phản hồi từ ${modelName} không chứa phần nào.`);
          }
        } catch (error) {
          console.error(`❌ Lỗi khi tạo ảnh với ${modelName}:`, error);
        }
      } catch (error) {
        console.error(`❌ Lỗi chung với mô hình ${modelName}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi tổng quan:', error);
  }
}

// Chạy hàm kiểm tra
testImageCapabilities();