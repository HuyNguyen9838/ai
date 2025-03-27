import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

// Hàm để kiểm tra khả năng của Gemini 2.0
async function testGemini2() {
  try {
    console.log('Kiểm tra khả năng của Gemini 2.0...');
    
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
    
    // Kiểm tra mô hình Gemini 2.0
    const modelName = "gemini-2.0-flash";
    
    console.log(`\n===== Kiểm tra mô hình: ${modelName} =====`);
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 8192
        }
      });
      
      console.log(`1. Kiểm tra khả năng MÔ TẢ hình ảnh của ${modelName}...`);
      try {
        const result = await model.generateContent([
          "Mô tả chi tiết về hình ảnh này",
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
        const promptText = `Generate a photorealistic image of a person wearing this clothing item. I'd like to see how it would look on a real model.

Important: 
- Return ONLY an image of a human model wearing this clothing item
- The output must be a standalone jpg/png image
- Do not include any text descriptions or explanations in your response
- Generate a new image with a real person wearing exactly this item of clothing
- Make the final image clear, high-quality, and in a standard fashion catalog style`;
        
        const result = await model.generateContent([
          promptText,
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
              
              // Lưu hình ảnh để kiểm tra
              const imageData = part.inlineData.data;
              const buffer = Buffer.from(imageData, 'base64');
              const outputPath = path.join(process.cwd(), 'generated_test.jpg');
              fs.writeFileSync(outputPath, buffer);
              console.log(`✅ Đã lưu hình ảnh được tạo tại: ${outputPath}`);
              
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
    
  } catch (error) {
    console.error('❌ Lỗi tổng quan:', error);
  }
}

// Chạy hàm kiểm tra
testGemini2();