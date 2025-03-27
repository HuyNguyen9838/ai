import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

async function testGeminiImageGeneration() {
  try {
    console.log('Kiểm tra khả năng tạo hình ảnh của Gemini 2.0...');
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY không được cung cấp.");
      return;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Sử dụng model Gemini 2.0 với khả năng tạo hình ảnh
    const modelName = "gemini-2.0-flash-exp-image-generation";
    console.log(`Sử dụng mô hình: ${modelName}`);
    
    // Cập nhật cấu hình để tối ưu hóa quá trình sinh hình ảnh
    const temperature = 0.4;
    const topP = 0.95;
    const maxOutputTokens = 4096;
    
    console.log(`Cấu hình mô hình: temperature=${temperature}, topP=${topP}, maxOutputTokens=${maxOutputTokens}`);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: temperature,
        topP: topP,
        maxOutputTokens: maxOutputTokens,
        // @ts-ignore - Type definitions may not be updated for this experimental model
        responseModalities: ["TEXT", "IMAGE"]
      },
    });
    
    // Đường dẫn đến tệp hình ảnh quần áo (sử dụng ảnh thu nhỏ để tối ưu thời gian xử lý)
    const imagePath = path.join(process.cwd(), 'uploads', 'original', 'test-small.png');
    
    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(imagePath)) {
      console.error(`Không tìm thấy hình ảnh để thử nghiệm tại: ${imagePath}`);
      return;
    }
    
    console.log(`Sử dụng hình ảnh: ${imagePath}`);
    
    // Đọc tệp và chuyển đổi thành base64
    const imageData = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageData).toString('base64');
    
    // Tạo phần dữ liệu hình ảnh
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
      }
    };
    
    // Prompt yêu cầu tạo ảnh mới
    const generatePrompt = `Generate a high-quality virtual try-on image showing a model wearing the clothing from the provided image. 
    Create a realistic, photographic-quality image of an attractive model wearing the provided clothing item.
    The model should be in a natural fashion pose with good lighting and a simple background.
    Be sure to maintain the exact details, colors, and patterns of the clothing item.
    Return an image of the model wearing the clothing.`;
    
    console.log("Gửi request đến Gemini API...");
    console.log("Đang đợi phản hồi (có thể mất 30-60 giây)...");
    
    // Thiết lập timeout cho request (5 phút)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 5 minutes")), 5 * 60 * 1000);
    });
    
    // Thực hiện gọi API với timeout
    const result = await Promise.race([
      model.generateContent([
        generatePrompt,
        imagePart
      ]),
      timeoutPromise
    ]) as Awaited<ReturnType<typeof model.generateContent>>;
    
    const response = result.response;
    
    console.log("Nhận được phản hồi từ Gemini API. Đang phân tích...");
    
    // Kiểm tra cấu trúc phản hồi
    if (response.candidates && 
        response.candidates[0] && 
        response.candidates[0].content && 
        response.candidates[0].content.parts) {
      
      const parts = response.candidates[0].content.parts;
      
      // Log cấu trúc phần dữ liệu để gỡ lỗi
      console.log("Cấu trúc phần dữ liệu phản hồi:", 
        JSON.stringify(parts.map(p => ({
          hasText: 'text' in p,
          hasInlineData: 'inlineData' in p && p.inlineData ? true : false,
          mimeType: 'inlineData' in p && p.inlineData ? p.inlineData.mimeType : undefined
        })), null, 2)
      );
      
      // Tìm phần dữ liệu hình ảnh trong phản hồi
      let foundImage = false;
      let outputImagePath = "";
      
      for (const part of parts) {
        if ('inlineData' in part && part.inlineData) {
          console.log("✅ Tìm thấy dữ liệu hình ảnh trong phản hồi!");
          foundImage = true;
          
          // Lưu hình ảnh
          outputImagePath = path.join(process.cwd(), 'uploads', 'generated', `gemini-test-${Date.now()}.png`);
          
          // Đảm bảo thư mục uploads/generated tồn tại
          const generatedDir = path.join(process.cwd(), 'uploads', 'generated');
          fs.mkdirSync(generatedDir, { recursive: true });
          
          fs.writeFileSync(outputImagePath, Buffer.from(part.inlineData.data, 'base64'));
          console.log(`Đã lưu hình ảnh kết quả: ${outputImagePath}`);
          break;
        }
      }
      
      if (!foundImage) {
        // Nếu không có hình ảnh, kiểm tra phản hồi văn bản
        for (const part of parts) {
          if ('text' in part && part.text) {
            console.log("❌ Không tìm thấy hình ảnh, chỉ có phản hồi văn bản:");
            // Đảm bảo rằng text tồn tại và là một chuỗi
            const textContent = typeof part.text === 'string' ? part.text : '';
            console.log(textContent.substring(0, 200) + "...");
            break;
          }
        }
      }
    } else {
      console.log("❌ Phản hồi không có cấu trúc mong đợi", JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

// Chạy hàm kiểm tra
testGeminiImageGeneration();