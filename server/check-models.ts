import { GoogleGenerativeAI } from "@google/generative-ai";

// Kiểm tra danh sách các mô hình Gemini khả dụng
async function checkGeminiModels() {
  try {
    console.log('Đang kiểm tra các mô hình Gemini khả dụng...');
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY không được cung cấp.");
      return;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Lấy danh sách mô hình
    try {
      // @ts-ignore - vì hàm này có thể không có trong các phiên bản cũ của thư viện
      const models = await genAI.getModels();
      console.log('Danh sách mô hình khả dụng:', models);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách mô hình:', error);
      console.log('Tiếp tục với kiểm tra cơ bản...');
    }
    
    // Danh sách mô hình cần kiểm tra
    const modelNames = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro"
    ];
    
    // Kiểm tra từng mô hình
    for (const modelName of modelNames) {
      try {
        console.log(`\nKiểm tra mô hình: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Kiểm tra khả năng phản hồi text
        const result = await model.generateContent("Viết một câu ngắn về AI");
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ Mô hình ${modelName} hoạt động với text: "${text.substring(0, 100)}..."`);
        
        // Kiểm tra thông tin về mô hình
        try {
          // @ts-ignore
          const modelInfo = await model.getModelInfo();
          console.log(`Thông tin mô hình ${modelName}:`, modelInfo);
          
          // @ts-ignore
          if (modelInfo && modelInfo.supportedGenerationMethods) {
            console.log(`Phương thức sinh được hỗ trợ: ${modelInfo.supportedGenerationMethods.join(', ')}`);
          }
        } catch (error) {
          console.log(`Không thể lấy thông tin chi tiết về mô hình ${modelName}`);
        }
        
      } catch (error) {
        console.error(`❌ Lỗi với mô hình ${modelName}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra mô hình:', error);
  }
}

// Chạy hàm kiểm tra
checkGeminiModels();