import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiConnection() {
  try {
    console.log("Kiểm tra kết nối đến API Gemini...");
    
    // Lấy API key từ biến môi trường
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Không tìm thấy GEMINI_API_KEY trong biến môi trường!");
      return;
    }
    
    // Log 4 ký tự đầu và 4 ký tự cuối của API key (để kiểm tra)
    console.log(`API key (rút gọn): ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Khởi tạo API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Kiểm tra các mô hình có sẵn
    console.log("Các mô hình đang được dùng:");
    console.log("- gemini-1.5-pro-latest");
    console.log("- gemini-1.5-flash-latest");
    console.log("- gemini-2.0-flash-exp-image-generation");
    
    // Thử một yêu cầu văn bản đơn giản với mô hình flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    console.log("\nGửi yêu cầu văn bản đơn giản đến mô hình gemini-1.5-flash-latest...");
    
    const result = await model.generateContent("Hãy trả lời ngắn gọn: Gemini là gì?");
    const response = await result.response;
    const text = response.text();
    
    console.log("\n✅ Phản hồi từ Gemini API:");
    console.log(text);
    
    console.log("\n✅ Kiểm tra kết nối thành công!");
    
  } catch (error) {
    console.error("❌ Lỗi khi kết nối đến Gemini API:", error);
  }
}

// Chạy hàm kiểm tra
testGeminiConnection();