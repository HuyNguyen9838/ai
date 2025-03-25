import { Zap, Sliders, Database, Clock, CreditCard, Shield } from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgClass: string;
  iconColor: string;
}

function Feature({ icon, title, description, iconBgClass, iconColor }: FeatureProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${iconBgClass} rounded-full flex items-center justify-center ${iconColor} mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Tạo hình nhanh chóng",
      description: "Chỉ mất từ 15-30 giây để AI tạo ra hình ảnh mẫu người mặc sản phẩm của bạn.",
      iconBgClass: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      icon: <Sliders className="h-6 w-6" />,
      title: "Tùy chọn đa dạng",
      description: "Chọn kiểu mẫu người, loại nền và nhiều tùy chỉnh khác cho phù hợp với nhu cầu của bạn.",
      iconBgClass: "bg-purple-100",
      iconColor: "text-purple-500",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Công nghệ AI tiên tiến",
      description: "Sử dụng Gemini 2.0 API, mang lại kết quả chân thực và tự nhiên vượt trội.",
      iconBgClass: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Tiết kiệm thời gian",
      description: "Quên đi quy trình thuê người mẫu, chụp ảnh và chỉnh sửa tốn kém và mất thời gian.",
      iconBgClass: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Giải pháp kinh tế",
      description: "Chi phí thấp hơn nhiều so với các phương pháp truyền thống nhưng vẫn mang lại kết quả chuyên nghiệp.",
      iconBgClass: "bg-rose-100",
      iconColor: "text-rose-600",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Bảo mật dữ liệu",
      description: "Ảnh của bạn được mã hóa và xử lý an toàn, đảm bảo quyền riêng tư và bảo mật.",
      iconBgClass: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
