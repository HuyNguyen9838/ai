import { Link } from "wouter";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-white mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">AI</div>
              <h2 className="text-lg font-semibold">AI Virtual Try-On</h2>
            </div>
            <p className="mb-4">Công nghệ thử đồ ảo hàng đầu được phát triển với Gemini 2.0 AI, mang đến trải nghiệm mua sắm hoàn toàn mới.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Thử đồ ảo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tạo mẫu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tùy chỉnh nền</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API tích hợp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Giải pháp doanh nghiệp</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Đội ngũ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Báo chí</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Pháp lý</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Quyền sở hữu trí tuệ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; 2023 AI Virtual Try-On. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
