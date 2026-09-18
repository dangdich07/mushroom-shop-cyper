"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary";
import { CheckoutPaymentMethods } from "@/components/checkout/checkout-payment-methods";
import { CheckoutShippingSection } from "@/components/checkout/checkout-shipping-section";
import { CheckoutSubmitStatus } from "@/components/checkout/checkout-submit-status";
import type { CheckoutFormData, CheckoutSavedAddress } from "@/components/checkout/checkout.types";
import { createOrderAction } from "@/features/checkout/actions";
import { supabase } from "@/lib/supabaseClient";
import { useCartStore } from "@/store/useCartStore";
import type { CheckoutInput } from "@/types/payment.types";

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const voucherCode = searchParams.get("voucher") || undefined;
  const { items, clearCart } = useCartStore();
  const idempotencyRef = useRef<{ fingerprint: string; key: string } | null>(null);

  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<CheckoutSavedAddress[]>([]);

  // MÀNG TRẠNG THÁI BIỂU MẪU QUYẾT TOÁN
  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingName: "",
    shippingPhone: "",
    shippingArea: "HANOI",
    shippingDetail: "",
    paymentMethod: "VIETQR",
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
            setSavedAddresses(data as unknown as CheckoutSavedAddress[]);
          }
        }
      } catch (err) {
        console.error("Không thể kết nối cổng đọc sổ địa chỉ:", err);
      }
    }
    loadLabAddresses();
  }, []);

  // HÀM XỬ LÝ ĐIỀN NHANH TOẠ ĐỘ PHÒNG LAB
  const handleSelectQuickAddress = (addr: CheckoutSavedAddress) => {
    setFormData({
      ...formData,
      shippingName: addr.name,
      shippingPhone: addr.phone,
      shippingArea: addr.area,
      shippingDetail: addr.detail,
    });
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal > 2000000 ? 0 : 35000;
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const estimatedBeforeDiscount = subtotal + shippingFee;

  const handleSubmitOrder = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (items.length === 0) {
      setServerError("Khay sinh khối trống rỗng. Hãy nạp vật phẩm trước khi quyết toán.");
      return;
    }

    startTransition(async () => {
      try {
        const checkoutPayload: CheckoutInput = {
          shippingName: formData.shippingName.trim(),
          shippingPhone: formData.shippingPhone.trim(),
          shippingDetail: formData.shippingDetail.trim(),
          shippingArea: formData.shippingArea,
          paymentMethod: formData.paymentMethod,
          voucherCode: voucherCode,
          items: items.map(item => ({
            productId: item.id,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        };

        // GỌI THÔNG QUA SERVER ACTION (TUYỆT ĐỐI KHÔNG GỌI TRỰC TIẾP RPC TỪ CLIENT CHỐNG LỖI 403)
        const fingerprint = JSON.stringify(checkoutPayload);
        if (!idempotencyRef.current || idempotencyRef.current.fingerprint !== fingerprint) {
          idempotencyRef.current = { fingerprint, key: crypto.randomUUID() };
        }
        const response = await createOrderAction(checkoutPayload, idempotencyRef.current.key);

        if (!response.success || !response.orderId) {
          setServerError(response.error || "Lỗi cục bộ không thể thiết lập vận đơn.");
          return;
        }

        clearCart();
        if (response.trackingToken) {
          sessionStorage.setItem(`tracking-token:${response.orderId}`, response.trackingToken);
        }

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
    <form onSubmit={handleSubmitOrder} className="grid w-full min-w-0 grid-cols-1 items-start gap-8 font-mono text-xs lg:grid-cols-12" aria-busy={isPending || undefined}>
      <div className="flex min-w-0 flex-col gap-5 lg:col-span-8">
        <CheckoutShippingSection addresses={savedAddresses} disabled={isPending} formData={formData} onChange={setFormData} onSelectAddress={handleSelectQuickAddress} />
        <CheckoutPaymentMethods disabled={isPending} paymentMethod={formData.paymentMethod} onChange={(paymentMethod) => setFormData({ ...formData, paymentMethod })} />
      </div>

      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4">
        <CheckoutOrderSummary
          itemCount={items.length}
          totalQuantity={totalQuantity}
          subtotal={subtotal}
          shippingFee={shippingFee}
          estimatedBeforeDiscount={estimatedBeforeDiscount}
          voucherCode={voucherCode}
        />
        <CheckoutSubmitStatus isPending={isPending} serverError={serverError} />
      </aside>
    </form>
  );
}
