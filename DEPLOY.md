# Hướng dẫn triển khai ứng dụng lên Netlify

## Bước 1: Đăng ký tài khoản Netlify

Đăng ký tài khoản tại [Netlify](https://www.netlify.com/) nếu bạn chưa có.

## Bước 2: Cài đặt Netlify CLI (tùy chọn)

```bash
npm install -g netlify-cli
```

## Bước 3: Cài đặt các dependency cần thiết cho Netlify Functions

```bash
npm install serverless-http
```

## Bước 4: Kết nối repository với Netlify

1. Đăng nhập vào Netlify
2. Chọn "New site from Git"
3. Chọn GitHub/GitLab và xác thực
4. Chọn repository của dự án này

## Bước 5: Cấu hình triển khai

Thiết lập các thông số sau:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

## Bước 6: Thiết lập biến môi trường

Thêm các biến môi trường sau trong phần "Site settings" > "Environment variables":

- `GEMINI_API_KEY`: API key của Google Gemini

## Bước 7: Triển khai

Nhấn nút "Deploy site" để triển khai ứng dụng.

## Cấu trúc tệp triển khai

Dự án đã được cấu hình với các tệp sau để hỗ trợ triển khai:

- `netlify.toml`: Cấu hình chính cho Netlify
- `netlify/functions/api.js`: Netlify Function cho backend API
- `.env.example`: Mẫu tệp biến môi trường

## Khắc phục sự cố

- **Lỗi triển khai**: Kiểm tra log trong Netlify Dashboard
- **Lỗi API**: Kiểm tra biến môi trường và log của Netlify Functions
- **Lỗi tạo hình ảnh**: Đảm bảo GEMINI_API_KEY hợp lệ và có đủ quota