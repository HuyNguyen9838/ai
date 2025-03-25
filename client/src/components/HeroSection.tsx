import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Thử đồ ảo thông minh <span className="text-blue-500">bằng AI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Tải ảnh sản phẩm lên và AI sẽ tự động tạo mẫu người mặc bộ trang phục của bạn một cách tự nhiên.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full text-gray-700">
            <Check className="h-5 w-5 mr-2 text-green-500" />
            <span>Nhanh chóng</span>
          </div>
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full text-gray-700">
            <Check className="h-5 w-5 mr-2 text-green-500" />
            <span>Chất lượng cao</span>
          </div>
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full text-gray-700">
            <Check className="h-5 w-5 mr-2 text-green-500" />
            <span>Dễ sử dụng</span>
          </div>
        </div>
        
        <a href="#upload-section">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl">
            Bắt đầu ngay
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </a>
      </div>
    </section>
  );
}
