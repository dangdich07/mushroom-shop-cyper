import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, ClipboardCheck, Home, ListOrdered, PackageCheck, PackageOpen, Route, Truck } from "lucide-react";

interface OrderSuccessPanelProps {
  orderId: string;
  status: string;
}

export function OrderSuccessPanel({ orderId, status }: OrderSuccessPanelProps) {
  return (
    <section className="mx-auto max-w-[1180px] min-w-0" aria-labelledby="order-success-title">
      <nav aria-label="Điều hướng phân cấp" className="mb-3 flex min-h-11 flex-wrap items-center gap-2 text-xs text-text-dark">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 hover:text-primary-cyan focus-visible:bio-focus"><Home aria-hidden="true" className="h-3.5 w-3.5" />Trang chủ</Link>
        <ChevronRight aria-hidden="true" className="h-3 w-3 text-primary-cyan/60" />
        <Link href="/account/orders" className="inline-flex min-h-11 items-center hover:text-primary-cyan focus-visible:bio-focus">Đơn hàng</Link>
        <ChevronRight aria-hidden="true" className="h-3 w-3 text-primary-cyan/60" />
        <span aria-current="page" className="text-primary-cyan">Đặt hàng thành công</span>
      </nav>

      <div className="overflow-hidden rounded-xl border border-primary-cyan/30 bg-surface-glass shadow-[0_0_40px_rgba(0,210,230,0.06)] backdrop-blur-xl">
        <header className="relative border-b border-primary-cyan/15 bg-[radial-gradient(ellipse_at_top,rgba(0,210,230,0.12),transparent_70%)] px-4 py-6 text-center sm:px-6">
          <div aria-hidden="true" className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full border border-primary-cyan/50 bg-primary-cyan/10 shadow-[0_0_24px_rgba(0,210,230,0.2),inset_0_0_20px_rgba(0,210,230,0.08)]">
            <CheckCircle2 className="h-10 w-10 text-primary-cyan" />
          </div>
          <h1 id="order-success-title" className="mt-4 font-heading text-[clamp(26px,3vw,36px)] font-bold leading-tight tracking-tight text-text-pure">Đặt hàng thành công</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-muted">Cảm ơn bạn đã chọn CyberMushroom. Đơn hàng của bạn đã được ghi nhận.</p>
        </header>

        <div className="grid min-w-0 gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <section className="min-w-0 rounded-lg border border-primary-cyan/20 bg-primary-cyan/[0.025] p-4" aria-labelledby="success-next-steps">
            <h2 id="success-next-steps" className="font-heading text-lg font-semibold text-text-pure">Các bước tiếp theo</h2>
            <p className="mt-1 text-xs leading-5 text-text-dark">Quy trình xử lý đơn hàng. Tiến độ thực tế được cập nhật tại trang theo dõi.</p>
            <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { icon: ClipboardCheck, title: "Xác nhận đơn", description: "Kiểm tra thông tin đơn hàng và giao nhận." },
                { icon: PackageOpen, title: "Chuẩn bị hàng", description: "Chuẩn bị và đóng gói sản phẩm." },
                { icon: Truck, title: "Vận chuyển", description: "Bàn giao đơn cho đơn vị vận chuyển." },
                { icon: PackageCheck, title: "Giao hàng", description: "Giao sản phẩm đến địa chỉ nhận hàng." },
              ].map((step, index) => (
                <li key={step.title} className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary-cyan/25 bg-primary-cyan/5 text-primary-cyan"><step.icon aria-hidden="true" className="h-5 w-5" /></span>
                  <div className="min-w-0"><h3 className="text-sm font-semibold text-text-pure">{index + 1}. {step.title}</h3><p className="mt-1 text-xs leading-5 text-text-dark">{step.description}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="min-w-0 rounded-lg border border-primary-cyan/20 p-4" aria-labelledby="success-order-info">
            <h2 id="success-order-info" className="border-b border-primary-cyan/15 pb-3 font-heading text-lg font-semibold text-text-pure">Thông tin đơn hàng</h2>
            <dl className="my-4 space-y-3 text-sm">
              <div className="flex min-w-0 flex-wrap justify-between gap-2"><dt className="text-text-dark">Mã đơn hàng</dt><dd className="min-w-0 break-all font-mono text-xs font-semibold text-primary-cyan">{orderId}</dd></div>
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2"><dt className="text-text-dark">Trạng thái hiện tại</dt><dd className="max-w-full break-words rounded-md border border-primary-cyan/25 bg-primary-cyan/10 px-2.5 py-1 text-xs font-semibold text-primary-cyan">{status}</dd></div>
            </dl>
            <div className="grid grid-cols-1 gap-2">
              <Link href={`/track-order?id=${encodeURIComponent(orderId)}`} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-cyan bg-primary-neon px-3 py-2 text-sm font-semibold text-background-deep shadow-[0_0_16px_rgba(0,210,230,0.12)] hover:bg-primary-cyan focus-visible:bio-focus"><Route aria-hidden="true" className="h-4 w-4" />Theo dõi đơn hàng<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              <Link href="/account/orders" className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-cyan/35 px-3 py-2 text-sm font-semibold text-text-pure hover:bg-primary-cyan/10 focus-visible:bio-focus"><ListOrdered aria-hidden="true" className="h-4 w-4" />Xem lịch sử đơn hàng</Link>
            </div>
          </section>
        </div>
        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-primary-cyan/15 px-4 py-2">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-xs text-text-dark hover:text-primary-cyan focus-visible:bio-focus"><Home aria-hidden="true" className="h-4 w-4" />Quay về trang chủ</Link>
          <Link href="/products" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary-cyan hover:underline focus-visible:bio-focus">Tiếp tục mua sắm<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </footer>
      </div>
    </section>
  );
}
