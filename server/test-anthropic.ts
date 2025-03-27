import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = "claude-3-7-sonnet-20250219";

/**
 * Kiểm tra khả năng của Anthropic Claude để tạo hình ảnh
 */
async function testAnthropicImageGeneration() {
  try {
    console.log('Kiểm tra Anthropic Claude Image Generation API...');
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY không được cung cấp.");
      return;
    }
    
    // Khởi tạo client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    // Đường dẫn đến file hình ảnh mẫu
    const imagePath = path.join(process.cwd(), 'uploads', 'original', '1742927816795-z6442402147614_d3ad213c8ba1da4e94e979792213d325.jpg');
    
    // Đảm bảo file tồn tại
    if (!fs.existsSync(imagePath)) {
      console.error(`Không tìm thấy file hình ảnh: ${imagePath}`);
      return;
    }
    
    // Đọc file và chuyển đổi sang base64
    const imageFile = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageFile).toString('base64');
    
    console.log(`Đã đọc hình ảnh, kích thước: ${imageFile.length} bytes`);
    
    // Tạo prompt
    const systemPrompt = `Bạn là một chuyên gia tạo hình ảnh thời trang. Nhiệm vụ của bạn là tạo một hình ảnh duy nhất, 
    chất lượng cao, thực tế, hoàn chỉnh của một người mẫu mặc món quần áo được cung cấp. Đây là một dịch vụ thử đồ ảo.`;
    
    const userPrompt = `Tạo một hình ảnh chất lượng cao, thực tế của một người mẫu mặc món quần áo này. 
    Hình ảnh phải trông giống như một catalog thời trang chuyên nghiệp.
    
    CHÚ Ý QUAN TRỌNG:
    - KHÔNG bao gồm bất kỳ văn bản hoặc chữ viết nào trong hình ảnh
    - KHÔNG bao gồm khung viền hoặc đường viền
    - KHÔNG bao gồm nhiều hình ảnh
    - Hình ảnh phải có nền trắng hoặc phông nền studio đơn giản`;
    
    console.log("Gửi yêu cầu đến Anthropic Claude API...");
    console.log("Prompt:", userPrompt);
    
    try {
      // Gọi API
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image
                }
              }
            ],
          }
        ],
      });
      
      console.log("Đã nhận phản hồi từ Claude API!");
      console.log("Cấu trúc phản hồi:", JSON.stringify({
        id: response.id,
        model: response.model,
        contentTypes: response.content.map(item => {
          if ('type' in item) {
            return item.type;
          }
          return 'unknown';
        }),
      }, null, 2));
      
      // Đếm số phần trong phản hồi
      const textParts = response.content.filter(item => 'type' in item && item.type === 'text');
      const imageParts = response.content.filter(item => 'type' in item && item.type === 'image');
      
      console.log(`Phản hồi có ${textParts.length} phần văn bản và ${imageParts.length} phần hình ảnh`);
      
      // Lưu hình ảnh nếu có
      if (imageParts.length > 0) {
        console.log("Tìm thấy phần hình ảnh trong phản hồi! Đang lưu...");
        
        for (let i = 0; i < imageParts.length; i++) {
          const part = imageParts[i];
          
          if ('source' in part && part.source && 'data' in part.source) {
            // Lưu hình ảnh
            const base64Data = part.source.data;
            const buffer = Buffer.from(base64Data, 'base64');
            const outputPath = path.join(process.cwd(), `claude_test_image_${i + 1}.jpg`);
            fs.writeFileSync(outputPath, buffer);
            console.log(`Đã lưu hình ảnh ${i + 1} tại: ${outputPath}`);
          }
        }
      } else {
        console.log("Không tìm thấy hình ảnh trong phản hồi");
        
        // Kiểm tra nếu có văn bản
        if (textParts.length > 0) {
          console.log("Tìm thấy phần văn bản trong phản hồi. Đang tìm kiếm dữ liệu base64...");
          
          for (const part of textParts) {
            if ('text' in part) {
              const text = part.text;
              console.log("Văn bản (50 ký tự đầu tiên):", text.substring(0, 50));
              
              // Tìm dữ liệu base64 trong văn bản
              const base64Regex = /data:image\/(jpeg|png);base64,([^"]*)/;
              const matches = text.match(base64Regex);
              
              if (matches && matches[2]) {
                console.log("Tìm thấy dữ liệu base64 trong văn bản!");
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                const outputPath = path.join(process.cwd(), `claude_text_image.jpg`);
                fs.writeFileSync(outputPath, buffer);
                console.log(`Đã lưu hình ảnh từ văn bản tại: ${outputPath}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi gọi Anthropic API:", error);
    }
  } catch (error) {
    console.error("Lỗi tổng quan:", error);
  }
}

// Chạy hàm kiểm tra
testAnthropicImageGeneration();