import { Button } from "@/components/ui/button";
import { ArrowDown, Share2, RefreshCw, PlusCircle } from "lucide-react";
import { ClothingItem } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

interface ResultsSectionProps {
  item: ClothingItem;
  onReset: () => void;
  onRegenerate?: (item: ClothingItem) => void;
}

export default function ResultsSection({ item, onReset, onRegenerate }: ResultsSectionProps) {
  // Function to handle image download
  const handleDownload = () => {
    // Create anchor element
    const link = document.createElement('a');
    
    // Set download attributes
    link.href = `/api/uploads/${item.generatedImage}`;
    link.download = `virtual-tryon-${item.id}.jpg`;
    
    // Append to body, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle sharing
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Virtual Try-On',
          text: 'Xem ảnh thử đồ ảo được tạo bởi AI!',
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support navigator.share
        // Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã sao chép đường dẫn vào clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <section id="results-section" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Kết quả</h2>
        
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-50 rounded-xl p-6 md:p-8 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Original Image */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Ảnh gốc</h3>
                <div className="bg-white rounded-lg overflow-hidden shadow-sm aspect-square flex items-center justify-center">
                  <img 
                    src={`/api/uploads/${item.originalImage}`} 
                    alt="Original product image" 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                
                {/* Image details */}
                <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin sản phẩm</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-500">ID sản phẩm:</span>
                      <span className="col-span-2 font-medium">{item.id}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-500">Kiểu mẫu:</span>
                      <span className="col-span-2 font-medium">{item.modelType || "Tự động (mặc định)"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-500">Nền:</span>
                      <span className="col-span-2 font-medium">{item.backgroundType || "Studio (mặc định)"}</span>
                    </div>
                    {item.promptText && (
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-500">Lệnh mô tả:</span>
                        <span className="col-span-2 font-medium">{item.promptText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Generated Image */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Ảnh đã tạo</h3>
                <div className="bg-white rounded-lg overflow-hidden shadow-sm aspect-square flex items-center justify-center">
                  <img 
                    src={`/api/uploads/${item.generatedImage}`} 
                    alt="AI generated model wearing the product" 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                
                {/* Generation details */}
                <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin hình ảnh</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-500">Trạng thái:</span>
                      <span className="col-span-2">
                        {item.status === "completed" ? (
                          <span className="text-green-600 font-medium">Đã hoàn thành</span>
                        ) : item.status === "processing" ? (
                          <span className="text-blue-600 font-medium">Đang xử lý</span>
                        ) : (
                          <span className="text-red-600 font-medium">Thất bại</span>
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-500">Model AI:</span>
                      <span className="col-span-2 font-medium">Gemini 2.0 Flash Exp</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-500">Ngày tạo:</span>
                      <span className="col-span-2 font-medium">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Không có thông tin'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white"
              >
                <ArrowDown className="h-5 w-5" />
                <span>Tải xuống ảnh</span>
              </Button>
              
              <Button 
                onClick={handleShare}
                variant="outline" 
                className="inline-flex items-center gap-2"
              >
                <Share2 className="h-5 w-5" />
                <span>Chia sẻ</span>
              </Button>
              
              <Button 
                onClick={() => onRegenerate && onRegenerate(item)}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!onRegenerate}
              >
                <RefreshCw className="h-5 w-5" />
                <span>Tạo lại</span>
              </Button>
            </div>
          </div>
          
          {/* Try Another */}
          <div className="text-center mt-10">
            <Button 
              onClick={onReset}
              variant="outline" 
              className="inline-flex items-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Thử với sản phẩm khác</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
