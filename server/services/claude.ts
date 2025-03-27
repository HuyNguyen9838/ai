import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { ClothingItem } from '@shared/schema';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = "claude-3-7-sonnet-20250219";

// Định nghĩa kiểu dữ liệu để làm việc với Anthropic SDK
type AnthropicClient = InstanceType<typeof Anthropic>;
let anthropicClient: AnthropicClient | null = null;

/**
 * Khởi tạo API Anthropic
 * @returns True nếu khởi tạo thành công, nếu không thì false
 */
export function initClaudeAPI(): boolean {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY không được cung cấp. Tính năng tạo hình ảnh sẽ không hoạt động.");
    return false;
  }
  
  try {
    anthropicClient = new Anthropic({
      apiKey: apiKey,
    });
    console.log("Đã khởi tạo Claude API thành công.");
    return true;
  } catch (error) {
    console.error("Lỗi khi khởi tạo Claude API:", error);
    return false;
  }
}

/**
 * Hàm tạo hình ảnh thử đồ sử dụng Claude API
 * @param item Món quần áo với hình ảnh gốc và thông tin liên quan
 * @returns Chuỗi base64 của hình ảnh được tạo
 */
export async function generateTryOnImage(item: ClothingItem): Promise<string> {
  if (!anthropicClient) {
    if (!initClaudeAPI()) {
      throw new Error("Không thể khởi tạo Claude API. Vui lòng kiểm tra API key.");
    }
    // Nếu vẫn không có anthropic sau khi khởi tạo
    if (!anthropicClient) {
      throw new Error("Không thể khởi tạo Claude API sau khi thử lại.");
    }
  }
  
  try {
    // Lấy đường dẫn đến file hình ảnh
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const imagePath = path.join(uploadsDir, item.originalImage);
    
    console.log(`Đang xử lý hình ảnh: ${imagePath}`);
    
    // Đảm bảo file tồn tại
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Không tìm thấy file hình ảnh: ${imagePath}`);
    }
    
    // Đọc và chuyển đổi hình ảnh sang base64
    const imageFile = fs.readFileSync(imagePath);
    const base64Image = Buffer.from(imageFile).toString('base64');
    
    // Tạo prompt cho Claude dựa trên đầu vào của người dùng
    let systemPrompt = `Bạn là một chuyên gia tạo hình ảnh thời trang. Nhiệm vụ của bạn là tạo một hình ảnh duy nhất, 
    chất lượng cao, thực tế, hoàn chỉnh của một người mẫu mặc món quần áo được cung cấp. Đây là một dịch vụ thử đồ ảo.`;
    
    let userPrompt = `Tạo một hình ảnh chất lượng cao, thực tế của một người mẫu mặc món quần áo này. 
    Hình ảnh phải trông giống như một catalog thời trang chuyên nghiệp.
    
    CHÚ Ý QUAN TRỌNG:
    - KHÔNG bao gồm bất kỳ văn bản hoặc chữ viết nào trong hình ảnh
    - KHÔNG bao gồm khung viền hoặc đường viền
    - KHÔNG bao gồm nhiều hình ảnh hoặc bất kỳ dạng xem khác ngoài một hình ảnh duy nhất
    - KHÔNG được vẽ hoặc tái tạo lại món đồ - phải sử dụng đúng món đồ từ hình ảnh được cung cấp
    - Hình ảnh phải có nền trắng hoặc phông nền studio đơn giản`;
    
    // Thêm prompt của người dùng nếu được cung cấp
    if (item.promptText) {
      userPrompt += `\n\nHướng dẫn tùy chỉnh: ${item.promptText}\n`;
    }
    
    // Thêm loại người mẫu và nền nếu không phải mặc định
    if (item.modelType && item.modelType !== "Tự động (mặc định)") {
      userPrompt += `\nLoại người mẫu: ${item.modelType}`;
    }
    
    if (item.backgroundType && item.backgroundType !== "Studio (mặc định)") {
      userPrompt += `\nCài đặt nền: ${item.backgroundType}`;
    }
    
    console.log("Đã tạo prompt:", userPrompt);
    
    // Gọi Claude API để tạo hình ảnh
    const response = await anthropicClient.messages.create({
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
                media_type: item.originalImage.toLowerCase().endsWith('.png') ? "image/png" : "image/jpeg",
                data: base64Image
              }
            }
          ],
        }
      ],
    });
    
    // Log cấu trúc phản hồi
    console.log("Claude phản hồi với các phần dữ liệu:", response.content.map(part => {
      // @ts-ignore - Chúng ta biết rằng 'type' tồn tại trong các phần tử này
      const type = part.type || 'unknown';
      return type;
    }));
    
    // Kiểm tra từng phần của phản hồi
    for (const part of response.content) {
      // Dùng Type Guard mạnh để kiểm tra
      const contentType = Object.prototype.hasOwnProperty.call(part, 'type') ? 
        // @ts-ignore - TypeScript không thể biết được thuộc tính này tồn tại
        part.type : null;
        
      if (contentType === 'image') {
        console.log("Đã tìm thấy phần hình ảnh trong phản hồi");
        
        // @ts-ignore - TypeScript không thể biết cấu trúc này
        if (part.source && part.source.data) {
          // @ts-ignore - TypeScript không thể biết cấu trúc này
          return part.source.data;
        }
      }
    }
    
    // Kiểm tra phần văn bản nếu không tìm thấy phần hình ảnh
    for (const part of response.content) {
      // Dùng Type Guard tương tự
      const contentType = Object.prototype.hasOwnProperty.call(part, 'type') ? 
        // @ts-ignore
        part.type : null;
      
      if (contentType === 'text') {
        console.log("Tìm thấy phần văn bản trong phản hồi");
        
        try {
          // @ts-ignore
          const text = part.text || '';
          
          // Tìm dữ liệu base64 trong văn bản
          const base64Regex = /data:image\/(jpeg|png);base64,([^"]*)/;
          const matches = text.match(base64Regex);
          
          if (matches && matches[2]) {
            console.log("Đã tìm thấy dữ liệu base64 trong văn bản");
            return matches[2];
          }
        } catch (err) {
          console.error("Lỗi khi xử lý phần văn bản:", err);
        }
      }
    }
    
    // Nếu không tìm thấy hình ảnh trong phản hồi
    throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi từ Claude");
  } catch (error) {
    console.error("Lỗi khi tạo hình ảnh với Claude:", error);
    throw error;
  }
}