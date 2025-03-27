# AI Virtual Try-On - Thử Đồ Ảo Thông Minh

Ứng dụng thử đồ ảo thông minh sử dụng AI Gemini 2.0 để tạo hình ảnh người mẫu mặc quần áo từ hình ảnh sản phẩm được tải lên.

## Tính năng

- Tải lên hình ảnh quần áo (JPG/PNG)
- Chọn kiểu người mẫu (Nam, Nữ, Trẻ trung, Trung niên, Châu Á...)
- Chọn kiểu nền (Studio, Bãi biển, Công viên, Quán cà phê...)
- Thêm hướng dẫn bằng văn bản cho AI
- Tạo hình ảnh người mẫu mặc quần áo
- Tải xuống và chia sẻ kết quả

## Cài đặt trên môi trường phát triển

```bash
# Clone repository
git clone <repository-url>

# Di chuyển vào thư mục dự án
cd ai-virtual-tryon

# Cài đặt các thư viện
npm install

# Tạo file .env và cấu hình các biến môi trường
cp .env.example .env
# Chỉnh sửa file .env và thêm API key của Gemini

# Chạy ứng dụng ở chế độ phát triển
npm run dev
```

## Triển khai lên Netlify

Để triển khai ứng dụng lên Netlify, bạn cần:

1. Đăng ký tài khoản tại [Netlify](https://www.netlify.com/)
2. Liên kết repository với Netlify
3. Cấu hình các biến môi trường:
   - `GEMINI_API_KEY`: API key của Google Gemini

### Cấu hình triển khai

Tệp `netlify.toml` đã được cấu hình sẵn để triển khai cả frontend và backend:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 5000

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Netlify Functions

API backend sẽ được chạy dưới dạng Netlify Functions, đảm bảo khả năng mở rộng và bảo mật.

## Môi trường và API

Ứng dụng sử dụng API Gemini 2.0 từ Google để tạo hình ảnh. Bạn cần có API key hợp lệ để ứng dụng hoạt động chính xác.

### Cấu hình biến môi trường

Tạo tệp `.env` với các biến sau:

```
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

## Công nghệ sử dụng

- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **AI**: Google Gemini 2.0 API (gemini-2.0-flash-exp-image-generation)
- **Khác**: TypeScript, Vite, Drizzle ORM

## Liên hệ

Nếu có bất kỳ câu hỏi hoặc đề xuất nào, vui lòng liên hệ qua email: [your-email@example.com](mailto:your-email@example.com)