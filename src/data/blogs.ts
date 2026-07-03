import { BlogPost } from "@/types/blog.types";

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    slug: "ung-dung-hoat-chat-nam-hau-thu-tai-tao-than-kinh",
    title: "Ứng dụng hoạt chất sinh học từ Nấm Hầu Thủ trong tái tạo tế bào thần kinh",
    excerpt: "Các nghiên cứu lâm sàng chỉ ra rằng Hericenones và Erinacines trong nấm hầu thủ có khả năng kích thích yếu tố tăng trưởng thần kinh (NGF) mạnh mẽ.",
    content: `
      <p>Nấm Hầu Thủ (Hericium erinaceus) từ lâu đã được công nhận là một loại dược liệu quý trong y học cổ truyền phương Đông. Tuy nhiên, các đột phá công nghệ sinh học phân tử vào năm 2026 đã vén màn cơ chế hoạt động chính xác ở cấp độ tế bào của loại nấm đặc biệt này.</p>
      <br/>
      <h3 class="text-primary-neon font-heading font-bold text-base uppercase">Khám phá cấu trúc Hericenones và Erinacines</h3>
      <p class="mt-2 text-text-dark">Hai nhóm hợp chất độc quyền này có cấu trúc phân tử siêu nhỏ, cho phép chúng vượt qua hàng rào máu não một cách dễ dàng. Tại đây, chúng tương tác trực tiếp với các thụ thể thần kinh, kích thích sản sinh NGF (Nerve Growth Factor) - yếu tố tăng trưởng cốt lõi chịu trách nhiệm sửa chữa, tái tạo và phát triển các bao myelin bọc sợi thần kinh.</p>
      <br/>
      <h3 class="text-primary-neon font-heading font-bold text-base uppercase">Ứng dụng thực tiễn trong y học tương lai</h3>
      <p class="mt-2 text-text-dark">Quy trình chiết xuất siêu tới hạn áp dụng tại phòng Lab CyberMushroom giúp giữ lại cấu trúc nguyên bản của các hoạt chất này mà không làm biến tính bởi nhiệt độ. Đây là nền tảng quan trọng giúp hỗ trợ điều trị các hội chứng suy giảm trí nhớ, tăng cường khả năng tập trung sâu và tối ưu hóa mật độ liên kết nơ-ron cho các kỹ sư công nghệ và nhà nghiên cứu phải làm việc với cường độ cao.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop",
    author: {
      name: "GS. TS Nguyễn Văn Hùng",
      role: "Hội đồng Sinh học Phân tử"
    },
    tags: ["Nghiên Cứu", "Dược Tính", "Nấm Hầu Thủ"],
    readTimeMinutes: 5,
    publishedAt: "10.06.2026",
    viewCount: 1520
  },
  {
    id: "post-2",
    slug: "cam-nang-thiet-lap-phong-nuoi-dong-trung-ha-thao-iot",
    title: "Cẩm nang thiết lập phòng nuôi cấy nấm Đông Trùng Hạ Thảo tự động bằng IoT",
    excerpt: "Chi tiết các bước tối ưu hóa nhiệt độ, dải ánh sáng xanh bước sóng 460nm và chu kỳ độ ẩm 85% để đạt năng suất sinh khối tối đa chỉ với diện tích 2m2 tại gia.",
    content: `
      <p>Nuôi cấy Đông Trùng Hạ Thảo (Cordyceps Militaris) đòi hỏi kiểm soát tham số môi trường cực kỳ nghiêm ngặt. Việc ứng dụng vi mạch điều khiển tự động kết nối mạng cảm biến (IoT Layer) giúp đơn giản hóa chu trình này một cách tuyệt đối.</p>
      <br/>
      <h3 class="text-primary-neon font-heading font-bold text-base uppercase">1. Thiết lập dải quang phổ kích thích</h3>
      <p class="mt-2 text-text-dark">Sợi nấm Cordyceps phản hồi mạnh nhất với ánh sáng xanh lạnh dải bước sóng 460nm. Chu kỳ chiếu sáng lý tưởng là 12 giờ bật và 12 giờ tắt. Ánh sáng này kích hoạt quá trình chuyển hóa carotenoid, tạo nên sắc cam đậm đặc trưng chứa hàm lượng hoạt chất cao.</p>
      <br/>
      <h3 class="text-primary-neon font-heading font-bold text-base uppercase">2. Chu kỳ nhiệt ẩm siêu bão hòa</h3>
      <p class="mt-2 text-text-dark">Nhiệt độ phòng lab mini phải giữ cố định ở ngưỡng 20-22°C trong giai đoạn nuôi sợi và hạ xuống 18°C khi ra quả thể. Độ ẩm lý tưởng là 80-85%. Toàn bộ luồng dữ liệu này được các đầu dò thu thập và truyền về trung tâm điều phối, tự động kích hoạt máy phun sương siêu âm vô trùng.</p>
    `,
    coverImage: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop",
    author: {
      name: "Kỹ sư Lê Hoàng Nam",
      role: "Trưởng Bộ phận Thiết bị IoT"
    },
    tags: ["Công Nghệ", "Hướng Dẫn", "Lab Mini"],
    readTimeMinutes: 8,
    publishedAt: "08.06.2026",
    viewCount: 940
  }
];