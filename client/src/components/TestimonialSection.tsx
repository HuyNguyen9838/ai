import Rating from "./Rating";

interface TestimonialProps {
  rating: number;
  content: string;
  name: string;
  position: string;
}

function Testimonial({ rating, content, name, position }: TestimonialProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
      <div className="flex items-center mb-4">
        <Rating value={rating} />
      </div>
      
      <p className="text-gray-600 mb-4">{content}</p>
      
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-500">{position}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialSection() {
  const testimonials = [
    {
      rating: 5,
      content: "\"Tôi đã tiết kiệm hàng nghìn đô la trong chi phí chụp ảnh sản phẩm nhờ dịch vụ này. Kết quả thực sự ấn tượng và chuyên nghiệp!\"",
      name: "Nguyễn Thị Hương",
      position: "Shop thời trang online",
    },
    {
      rating: 5,
      content: "\"Đây là công cụ tuyệt vời để cập nhật nhanh hình ảnh sản phẩm mới cho website của tôi. Khách hàng của tôi rất thích và doanh số tăng đáng kể.\"",
      name: "Trần Minh Tuấn",
      position: "Chủ cửa hàng giày",
    },
    {
      rating: 5,
      content: "\"Công nghệ AI của họ thực sự ấn tượng. Tôi có thể tạo ra hình ảnh quảng cáo chất lượng cao mà không cần thuê studio hoặc người mẫu.\"",
      name: "Phạm Hồng Hà",
      position: "Marketer thương hiệu thời trang",
    },
  ];

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Khách hàng nói gì về chúng tôi</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
