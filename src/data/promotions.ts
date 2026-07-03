import { SystemVoucher, WheelPrize } from "@/types/promotion.types";

export const MOCK_SYSTEM_VOUCHERS: SystemVoucher[] = [
  {
    id: "v-1",
    code: "CYBERMUSH10",
    title: "Mã Kích Hoạt Hệ Gen Thượng Hạng",
    description: "Giảm 10% tổng giá trị hóa đơn nấm sinh khối hữu cơ.",
    type: "PERCENTAGE",
    value: 10,
    minOrderValue: 500000,
    endDate: "31.12.2026",
    isClaimed: false
  },
  {
    id: "v-2",
    code: "BIOLAB50",
    title: "Trợ Cấp Khởi Động Phòng Lab Mini",
    description: "Khấu trừ thẳng 50.000đ cho đơn hàng phôi giống thiết bị.",
    type: "FIXED_AMOUNT",
    value: 50000,
    minOrderValue: 300000,
    endDate: "15.08.2026",
    isClaimed: true
  },
  {
    id: "v-3",
    code: "NEONSHIP",
    title: "Vận Chuyển Nhiệt Siêu Tới Hạn",
    description: "Miễn phí vận chuyển bảo ôn (2-4°C) cho hóa đơn trên 1 triệu.",
    type: "FREE_SHIPPING",
    value: 35000,
    minOrderValue: 1000000,
    endDate: "01.10.2026",
    isClaimed: false
  }
];

export const MOCK_WHEEL_PRIZES: WheelPrize[] = [
  { id: 0, name: "Bào Tử Linh Chi F1", color: "bg-[#0B1120]" },
  { id: 1, name: "Voucher 50.000đ", color: "bg-[#7C3AED]" },
  { id: 2, name: "100 Điểm Tích Lũy", color: "bg-[#050816]" },
  { id: 3, name: "Phôi Nấm Mối Đen", color: "bg-[#00D9FF]" },
  { id: 4, name: "Miễn Phí Ship Nhiệt", color: "bg-[#0B1120]" },
  { id: 5, name: "May Mắn Lần Sau", color: "bg-[#1E293B]" },
];