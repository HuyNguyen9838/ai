# Hướng dẫn cài đặt và chạy ứng dụng

## Yêu cầu hệ thống

- Node.js 18+ 
- npm 8+

## Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd ai-virtual-tryon
```

2. Cài đặt các thư viện phụ thuộc:

```bash
npm install
```

3. Cấu hình biến môi trường:

```bash
# Sao chép tệp .env.example thành .env
cp .env.example .env

# Chỉnh sửa tệp .env và thêm API key của Gemini
nano .env
```

4. Chạy ứng dụng trong môi trường phát triển:

```bash
npm run dev
```

5. Truy cập ứng dụng:

Mở trình duyệt và truy cập địa chỉ [http://localhost:5000](http://localhost:5000)

## Cấu trúc thư mục

```
ai-virtual-tryon/
├── attached_assets/     # Tài sản, hình ảnh mẫu cho ứng dụng
├── client/              # Mã nguồn frontend
│   ├── src/             # Mã nguồn React
│   │   ├── components/  # Các component UI
│   │   ├── hooks/       # React hooks
│   │   ├── lib/         # Thư viện utility
│   │   ├── pages/       # Các trang của ứng dụng
│   │   ├── App.tsx      # Component chính
│   │   ├── index.css    # CSS toàn cục
│   │   └── main.tsx     # Entry point của React
│   └── index.html       # HTML template
├── server/              # Mã nguồn backend
│   ├── services/        # Các dịch vụ
│   ├── index.ts         # Entry point của server
│   ├── routes.ts        # Định nghĩa các API route
│   ├── storage.ts       # Logic lưu trữ dữ liệu
│   └── vite.ts          # Cấu hình Vite cho server
├── shared/              # Mã nguồn dùng chung
│   └── schema.ts        # Định nghĩa schema dữ liệu
├── uploads/             # Thư mục chứa hình ảnh upload
│   ├── original/        # Hình ảnh gốc được upload
│   └── generated/       # Hình ảnh được tạo bởi AI
├── netlify/             # Cấu hình triển khai Netlify
│   └── functions/       # Netlify serverless functions
├── .env                 # Biến môi trường (không đưa vào git)
├── .env.example         # Mẫu biến môi trường
├── netlify.toml         # Cấu hình Netlify
├── package.json         # Cấu hình npm và dependencies
├── tailwind.config.ts   # Cấu hình Tailwind CSS
└── vite.config.ts       # Cấu hình Vite
```

## Tính năng chính

1. **Tải lên hình ảnh sản phẩm**:
   - Hỗ trợ định dạng JPG và PNG
   - Giới hạn kích thước file 10MB

2. **Tùy chọn người mẫu**:
   - Giới tính: Nam, Nữ
   - Hình dáng: Cao, Trung bình
   - Độ tuổi: Trẻ trung, Trung niên
   - Sắc tộc: Châu Á

3. **Tùy chọn nền**:
   - Studio (mặc định)
   - Bãi biển
   - Công viên
   - Phố chính
   - Quán cà phê
   - Cửa hàng thời trang
   - Phòng khách
   - Sân vườn
   - Ngoài trời
   - Đô thị
   - Thiên nhiên
   - Trung tính

4. **Xử lý kết quả**:
   - Hiển thị hình ảnh gốc và hình ảnh đã tạo
   - Tải xuống hình ảnh đã tạo
   - Chia sẻ kết quả
   - Tạo lại hình ảnh với cài đặt mới

## Khắc phục sự cố

1. **Lỗi "GEMINI_API_KEY không được cung cấp"**:
   - Kiểm tra file .env đã được tạo và chứa API key hợp lệ

2. **Hình ảnh không được tạo**:
   - Kiểm tra kết nối mạng
   - Đảm bảo API key Gemini còn hiệu lực và có đủ quota
   - Kiểm tra định dạng hình ảnh đầu vào (chỉ hỗ trợ JPG/PNG)

3. **Tải lên hình ảnh bị lỗi**:
   - Kiểm tra kích thước file (tối đa 10MB)
   - Đảm bảo định dạng file được hỗ trợ

4. **Server không khởi động**:
   - Kiểm tra Node.js và npm đã được cài đặt đúng phiên bản
   - Kiểm tra các thư viện đã được cài đặt đầy đủ

## Liên hệ hỗ trợ

Nếu bạn gặp vấn đề khác, vui lòng liên hệ: [your-email@example.com](mailto:your-email@example.com)