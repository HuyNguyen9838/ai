import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  onClick?: () => void;
}

export default function CTASection({ onClick }: CTASectionProps) {
  return (
    <section className="py-20 bg-blue-500">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Sẵn sàng nâng tầm trải nghiệm mua sắm của khách hàng?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Hãy để AI giúp bạn tạo ra hình ảnh sản phẩm hoàn hảo, tiết kiệm thời gian và chi phí so với phương pháp truyền thống.</p>
        
        <Button
          onClick={onClick}
          className="inline-flex items-center justify-center bg-white text-blue-500 hover:bg-blue-50 py-3 px-8 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl"
        >
          Bắt đầu sử dụng miễn phí
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </section>
  );
}
