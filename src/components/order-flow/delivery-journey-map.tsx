import { CheckCircle2, Navigation, PackageCheck, XCircle } from "lucide-react";
import { DeliveryRoadMap } from "@/components/order-flow/delivery-road-map";

interface DeliveryJourneyMapProps {
  orderId: string;
  status: string;
}

const stages = [
  { key: "PENDING", label: "Tiếp nhận" },
  { key: "PROCESSING", label: "Xuất kho" },
  { key: "SHIPPED", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã đến" },
] as const;

const stageIndex: Record<string, number> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

const statusCopy: Record<string, string> = {
  PENDING: "Đơn hàng đang chờ được tiếp nhận tại kho.",
  PROCESSING: "Đơn hàng đang được chuẩn bị để rời kho.",
  SHIPPED: "Phương tiện đang trên hành trình giao hàng.",
  DELIVERED: "Hành trình đã hoàn thành tại điểm nhận.",
  CANCELLED: "Hành trình đã dừng vì đơn hàng bị hủy.",
};

export function DeliveryJourneyMap({ orderId, status }: DeliveryJourneyMapProps) {
  const normalizedStatus = status.toUpperCase();
  const cancelled = normalizedStatus === "CANCELLED";
  const currentStage = stageIndex[normalizedStatus] ?? 0;
  const progress = cancelled ? 0 : Math.round((currentStage / (stages.length - 1)) * 100);
  const vehicleSeed = orderId.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  const usesBike = vehicleSeed % 2 === 0;

  return (
    <figure
      aria-labelledby="delivery-map-title"
      className="relative isolate min-w-0 overflow-hidden rounded-xl border border-primary-cyan/30 bg-surface-glass p-3 shadow-[0_0_30px_rgba(0,210,230,0.05)] backdrop-blur-xl sm:p-4"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_50%_45%,rgba(0,245,255,0.12),transparent_52%)]" />

      <figcaption className="relative z-10 flex min-w-0 flex-col gap-2 border-b border-primary-cyan/15 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-wider text-primary-cyan">Bản đồ hành trình</p>
          <h2 id="delivery-map-title" className="mt-1 break-words font-heading text-lg font-semibold text-text-pure">
            Tuyến đường Hà Nội – Thái Nguyên
          </h2>
        </div>
        <span className="w-fit rounded-lg border border-primary-cyan/20 bg-primary-cyan/5 px-3 py-2 text-xs font-medium text-text-muted">
          {usesBike ? "Phương tiện: Xe máy" : "Phương tiện: Xe tải"}
        </span>
      </figcaption>

      <div className="relative z-10">
        <DeliveryRoadMap status={normalizedStatus} usesBike={usesBike} />
      </div>

      <div className="relative z-10 mt-4">
        <div
          role="progressbar"
          aria-label="Tiến độ hành trình giao hàng"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={cancelled ? "Hành trình đã hủy" : stages[currentStage].label}
          className="h-1 overflow-hidden rounded-full bg-primary-cyan/15"
        >
          <div className={`h-full transition-[width] duration-700 motion-reduce:transition-none ${cancelled ? "bg-red-400" : "bg-gradient-to-r from-primary-cyan to-primary-neon"}`} style={{ width: `${progress}%` }} />
        </div>
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stages.map((stage, index) => {
            const complete = !cancelled && index <= currentStage;
            return (
              <li key={stage.key} aria-current={!cancelled && index === currentStage ? "step" : undefined} className={`flex min-w-0 items-center gap-2 text-xs font-semibold ${!cancelled && index === currentStage ? "text-primary-cyan" : complete ? "text-text-pure" : "text-text-dark"}`}>
                {complete ? <CheckCircle2 className="h-3 w-3 shrink-0 text-primary-neon" /> : <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full border border-current" />}
                <span className="break-words">{stage.label}</span>
              </li>
            );
          })}
        </ol>
        <p className={`mt-4 flex items-start gap-2 rounded-r-md border-l-2 bg-primary-cyan/[0.04] p-3 text-xs leading-5 ${cancelled ? "border-red-400 text-red-400" : "border-primary-cyan text-text-muted"}`}>
          {cancelled ? <XCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <PackageCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-cyan" />}
          <span>
            <strong className="inline-flex items-center gap-1 text-text-pure"><Navigation aria-hidden="true" className="h-3 w-3" /> Bản đồ đường bộ thực:</strong>{" "}
            {statusCopy[normalizedStatus] ?? statusCopy.PENDING} Vị trí xe hiện được ước tính theo trạng thái đơn; GPS từ thiết bị người giao chưa được kết nối.
          </span>
        </p>
      </div>
    </figure>
  );
}
