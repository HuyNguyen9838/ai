import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Đảm bảo meta viewport tag tồn tại và được cấu hình đúng cho thiết bị di động
function setupMobileViewport() {
  // Kiểm tra xem meta viewport tag đã tồn tại chưa
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  
  // Nếu không tìm thấy, tạo thẻ mới
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    document.head.appendChild(viewportMeta);
  }
  
  // Cập nhật content của viewport tag
  viewportMeta.setAttribute(
    'content',
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
  );
}

// Thiết lập viewport trước khi render
setupMobileViewport();

// Tạo event listener cho iOS để tránh zoom khi chạm vào input
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
