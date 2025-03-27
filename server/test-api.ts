import { generateTryOnImage } from './services/gemini';
import fs from 'fs';
import path from 'path';
import { ClothingItem } from '../shared/schema';

// Hàm test API
async function testGeminiAPI() {
  try {
    console.log('Bắt đầu kiểm tra API Gemini...');
    
    // Tạo một item giả lập
    const testItem: ClothingItem = {
      id: 999,
      originalImage: 'original/1742927816795-z6442402147614_d3ad213c8ba1da4e94e979792213d325.jpg', // Sử dụng ảnh có thật
      generatedImage: null,
      promptText: 'A young Asian male model in a casual pose',
      modelType: 'Nam Châu Á',
      backgroundType: 'Studio (mặc định)',
      status: 'pending',
      createdAt: new Date()
    };
    
    // Đảm bảo ảnh test tồn tại trong thư mục uploads
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(path.join(uploadsDir, testItem.originalImage))) {
      console.error(`Không tìm thấy ảnh test: ${testItem.originalImage}`);
      console.log('Vui lòng thay đổi tên file trong biến testItem.originalImage để trỏ đến một ảnh có sẵn trong thư mục uploads');
      return;
    }
    
    console.log(`Đang tạo ảnh cho item ID: ${testItem.id}`);
    const base64Image = await generateTryOnImage(testItem);
    
    if (base64Image) {
      console.log('✅ Thành công! API đã trả về dữ liệu hình ảnh');
      console.log(`Độ dài chuỗi base64: ${base64Image.length} ký tự`);
      
      // Lưu kết quả vào file để kiểm tra
      const resultPath = path.join(uploadsDir, 'test-result.txt');
      fs.writeFileSync(resultPath, base64Image.substring(0, 100) + '...');
      console.log(`Đã lưu phần đầu của kết quả vào file: ${resultPath}`);
      
      // Lưu hình ảnh kết quả
      const imageBuffer = Buffer.from(base64Image, 'base64');
      const imagePath = path.join(uploadsDir, 'test-result.jpg');
      fs.writeFileSync(imagePath, imageBuffer);
      console.log(`Đã lưu hình ảnh kết quả vào: ${imagePath}`);
    } else {
      console.error('❌ Lỗi: API không trả về dữ liệu hình ảnh');
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi thử nghiệm API:', error);
  }
}

// Chạy hàm test
testGeminiAPI();