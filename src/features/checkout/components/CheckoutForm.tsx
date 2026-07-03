"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { createOrderAction } from "@/features/checkout/actions";
import { CheckoutInput, PaymentMethodType } from "@/types/payment.types";
import { supabase } from "@/lib/supabaseClient";
import { formatVND } from "@/lib/utils";
import { ShieldCheck, Truck, CreditCard, Activity, AlertTriangle, MapPin } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  sku: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  clearCart: () => void;
}

// Cấu trúc kiểu dữ liệu Sổ địa chỉ phòng Lab
interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  area: string;
  detail: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const voucherCode = searchParams.get("voucher") || undefined;
  const { items, clearCart } = useCartStore() as unknown as CartStore;
  
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // MÀNG TRẠNG THÁI BIỂU MẪU QUYẾT TOÁN
  const [formData, setFormData] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingArea: "HANOI", 
    shippingDetail: "",
    paymentMethod: "VIETQR" as PaymentMethodType
  });

  // 1. KÍCH HOẠT TRUY QUẤT SỔ ĐỊA CHỈ PHÒNG LAB TỰ ĐỘNG KHI KHỞI CHẠY
  useEffect(() => {
    async function loadLabAddresses() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Gọi dữ liệu từ bảng addresses dựa trên RLS đã mở khóa
          const { data, error } = await supabase
            .from("addresses")
            .select("id, name, phone, area, detail");
          
          if (!error && data) {
            setSavedAddresses(data as unknown as SavedAddress[]);
          }
        }
      } catch (err) {
        console.error("Không thể kết nối cổng đọc sổ địa chỉ:", err);
      }
    }
    loadLabAddresses();
  }, []);

  // HÀM XỬ LÝ ĐIỀN NHANH TOẠ ĐỘ PHÒNG LAB
  const handleSelectQuickAddress = (addr: SavedAddress) => {
    setFormData({
      ...formData,
      shippingName: addr.name,
      shippingPhone: addr.phone,
      shippingArea: addr.area,
      shippingDetail: addr.detail
    });
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal > 2000000 ? 0 : 35000;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (items.length === 0) {
      setServerError("Khay sinh khối trống rỗng. Hãy nạp vật phẩm trước khi quyết toán.");
      return;
    }

    startTransition(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login?redirect=/checkout");
          return;
        }

        const checkoutPayload: CheckoutInput = {
          shippingName: formData.shippingName.trim(),
          shippingPhone: formData.shippingPhone.trim(),
          shippingDetail: formData.shippingDetail.trim(),
          shippingArea: formData.shippingArea,
          paymentMethod: formData.paymentMethod,
          voucherCode: voucherCode,
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        };

        // GỌI THÔNG QUA SERVER ACTION (TUYỆT ĐỐI KHÔNG GỌI TRỰC TIẾP RPC TỪ CLIENT CHỐNG LỖI 403)
        const response = await createOrderAction(checkoutPayload, session.user.id);

        if (!response.success || !response.orderId) {
          setServerError(response.error || "Lỗi cục bộ không thể thiết lập vận đơn.");
          return;
        }

        clearCart();
        
        if (formData.paymentMethod === "VIETQR") {
          router.push(`/checkout/payment?orderId=${response.orderId}`);
        } else {
          router.push(`/checkout/success?orderId=${response.orderId}`);
        }

      } catch (err) {
        setServerError("Mạch xử lý bất đối xứng bị đứt gãy hỏa tốc.");
        console.error(err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-mono w-full">
      
      {/* KHỐI TRÁI: THU THẬP THÔNG SỐ TOẠ ĐỘ VÀ PHƯƠNG THỨC TRẢ TIỀN (8 CỘT) */}
      <div className="lg:col-span-8 flex flex-col gap-5 w-full">
        <div className="glass-premium p-5 border-white/5 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-primary-cyan uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
            <Truck className="w-4 h-4" /> TOẠ ĐỘ PHÒNG LAB TIẾP NHẬN SINH KHỐI
          </span>

          {/* BỘ CHỌN ĐỊA CHỈ NHANH ĐƯỢC ĐỒNG BỘ */}
          {savedAddresses.length > 0 && (
            <div className="flex flex-col gap-2 bg-white/2 p-3 border border-white/5 rounded-sm">
              <span className="text-[10px] text-text-dark uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary-neon" /> Chọn nhanh tọa độ phòng Lab đã lưu:
              </span>
              <div className="flex flex-wrap gap-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSelectQuickAddress(addr)}
                    className="bg-background-dark border border-white/10 hover:border-primary-cyan px-2.5 py-1.5 text-[10px] text-text-pure font-bold transition-all text-left cursor-pointer uppercase truncate max-w-xs"
                    title={`${addr.name} - ${addr.detail}`}
                  >
                    🏢 {addr.name} ({addr.area})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-dark uppercase">Họ tên kỹ sư tiếp nhận</label>
              <input required type="text" disabled={isPending} value={formData.shippingName} onChange={(e) => setFormData({...formData, shippingName: e.target.value})} placeholder="NÔNG ĐẶNG ĐÍCH" className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-cyan uppercase font-bold" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-text-dark uppercase">Tần số liên lạc (Phone)</label>
              <input required type="tel" disabled={isPending} value={formData.shippingPhone} onChange={(e) => setFormData({...formData, shippingPhone: e.target.value})} placeholder="0987xxxxxx" className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-cyan font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-dark uppercase">Đặc khu hành chính</label>
              <select value={formData.shippingArea} disabled={isPending} onChange={(e) => setFormData({...formData, shippingArea: e.target.value})} className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-cyan font-bold uppercase">
                <option value="HANOI">MIỀN BẮC // HÀ NỘI HUB</option>
                <option value="DANANG">MIỀN TRUNG // ĐÀ NẴNG HUB</option>
                <option value="HCM">MIỀN NAM // SÀI GÒN HUB</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-text-dark uppercase">Địa chỉ chi tiết phòng Lab</label>
              <input required type="text" disabled={isPending} value={formData.shippingDetail} onChange={(e) => setFormData({...formData, shippingDetail: e.target.value})} placeholder="Số 12, ngõ 34, đường ABC, quận XYZ" className="bg-background-dark border border-white/10 p-2.5 text-text-pure outline-none focus:border-primary-cyan" />
            </div>
          </div>
        </div>

        {/* KHỐI CHỌN CỔNG THANH TOÁN */}
        <div className="glass-premium p-5 border-white/5 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-primary-cyan uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" /> ĐIỀU HỢP GIAO THỨC CHUYỂN GIAO TÀI CHÍNH
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`border p-4 flex items-start gap-3 cursor-pointer transition-all ${formData.paymentMethod === "VIETQR" ? "border-primary-cyan bg-primary-cyan/5" : "border-white/10 bg-black/20 hover:border-white/20"}`}>
              <input type="radio" name="paymentMethod" value="VIETQR" checked={formData.paymentMethod === "VIETQR"} onChange={() => setFormData({...formData, paymentMethod: "VIETQR"})} className="mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <strong className="text-text-pure font-black tracking-wide uppercase">Cổng VietQR Khớp Lệnh Tự Động</strong>
                <span className="text-text-dark text-[10px]">Xác thực luồng tiền <strong className="text-primary-neon">&lt; 3 giây</strong>. Khuyên dùng để nhận hàng hỏa tốc.</span>
              </div>
            </label>

            <label className={`border p-4 flex items-start gap-3 cursor-pointer transition-all ${formData.paymentMethod === "COD" ? "border-primary-cyan bg-primary-cyan/5" : "border-white/10 bg-black/20 hover:border-white/20"}`}>
              <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === "COD"} onChange={() => setFormData({...formData, paymentMethod: "COD"})} className="mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <strong className="text-text-pure font-black tracking-wide uppercase">Quyết toán COD ngoại tuyến</strong>
                <span className="text-text-dark text-[10px]">Nhận sinh khối, kiểm tra thuộc tính lâm sàng rồi giao tiền mặt cho shipper.</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: BẢNG KÊ KHAI CHI PHÍ & SUBMIT BUTTON (4 CỘT) */}
      <div className="lg:col-span-4 flex flex-col gap-4 w-full">
        <div className="glass-premium p-5 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-text-pure uppercase border-b border-white/5 pb-2 block">Báo cáo tóm tắt vận đơn</span>
          
          <div className="flex flex-col gap-2 border-b border-white/5 pb-4 text-text-muted">
            <div className="flex justify-between">
              <span>Tổng khối lượng nấm:</span>
              <span className="text-text-pure font-bold">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển phòng bọc:</span>
              <span className="text-text-pure font-bold">{shippingFee === 0 ? "MIỄN PHÍ" : formatVND(shippingFee)}</span>
            </div>
            {voucherCode && (
              <div className="flex justify-between text-primary-neon font-bold">
                <span>Mã ưu đãi đã khóa:</span>
                <span className="uppercase">{voucherCode}</span>
              </div>
            )}
          </div>

          {/* HIỂN THỊ LỖI NẾU CÓ CHÈN CHI TIẾT TỪ POSTGRES */}
          {serverError && (
            <div className="border border-red-500/20 bg-red-500/5 p-3 flex items-start gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="break-all">{serverError}</span>
            </div>
          )}

          {/* NÚT KÍCH HOẠT QUYẾT TOÁN TỐI CAO */}
          <button 
            type="submit" 
            disabled={isPending}
            className="h-11 bg-primary-neon text-background-deep font-heading font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-cyan transition-all cursor-pointer shadow-neon-cyan/10 w-full disabled:opacity-40"
          >
            {isPending ? (
              <>
                <Activity className="w-4 h-4 animate-spin" /> ĐANG KHÓA KHO LƯU TRỮ...
              </>
            ) : (
              <>
                KÍCH HOẠT VẬN ĐƠN NGAY
              </>
            )}
          </button>
          
          <span className="text-[9px] text-text-dark text-center uppercase flex items-center justify-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Màng mã hóa đầu cuối Quantum Secure được bật
          </span>
        </div>
      </div>

    </form>
  );
}