import type { FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";

interface AccountAddressFormProps {
  area: string;
  detail: string;
  editing: boolean;
  name: string;
  pending: boolean;
  phone: string;
  onAreaChange: (value: string) => void;
  onCancel: () => void;
  onDetailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export function AccountAddressForm(props: AccountAddressFormProps) {
  return (
    <form onSubmit={props.onSubmit} className="min-w-0 border border-white/5 bg-black/20 p-4 font-mono text-xs sm:p-5">
      <div className="flex flex-col gap-3 border-b border-white/5 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="break-words font-heading text-xs font-bold uppercase tracking-wider text-text-pure">{props.editing ? "Hiệu chỉnh tọa độ nhận hàng" : "Thêm tọa độ nhận hàng mới"}</h2>
        {props.editing && <button type="button" onClick={props.onCancel} className="inline-flex min-h-11 items-center justify-center gap-2 border border-red-500/20 bg-red-500/5 px-3 text-[10px] font-bold text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"><X aria-hidden="true" className="h-3 w-3" /> Hủy chỉnh sửa</button>}
      </div>
      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="min-w-0 text-[10px] uppercase tracking-wide text-text-dark" htmlFor="account-address-name">Tên người nhận
          <input id="account-address-name" autoComplete="name" required value={props.name} onChange={(event) => props.onNameChange(event.target.value)} className="mt-2 min-h-11 w-full min-w-0 border border-white/10 bg-background-dark p-3 text-xs font-bold uppercase text-text-pure outline-none focus:border-primary-neon" />
        </label>
        <label className="min-w-0 text-[10px] uppercase tracking-wide text-text-dark" htmlFor="account-address-phone">Số điện thoại
          <input id="account-address-phone" type="tel" autoComplete="tel" required value={props.phone} onChange={(event) => props.onPhoneChange(event.target.value)} className="mt-2 min-h-11 w-full min-w-0 border border-white/10 bg-background-dark p-3 text-xs text-text-pure outline-none focus:border-primary-neon" />
        </label>
        <label className="min-w-0 text-[10px] uppercase tracking-wide text-text-dark" htmlFor="account-address-area">Khu vực
          <select id="account-address-area" value={props.area} onChange={(event) => props.onAreaChange(event.target.value)} className="mt-2 min-h-11 w-full min-w-0 border border-white/10 bg-background-dark p-3 text-xs font-bold uppercase text-text-pure outline-none focus:border-primary-neon">
            <option value="HANOI">MIỀN BẮC // HÀ NỘI HUB</option><option value="DANANG">MIỀN TRUNG // ĐÀ NẴNG HUB</option><option value="HCM">MIỀN NAM // SÀI GÒN HUB</option>
          </select>
        </label>
        <label className="min-w-0 text-[10px] uppercase tracking-wide text-text-dark" htmlFor="account-address-detail">Địa chỉ chi tiết
          <input id="account-address-detail" autoComplete="street-address" required value={props.detail} onChange={(event) => props.onDetailChange(event.target.value)} className="mt-2 min-h-11 w-full min-w-0 border border-white/10 bg-background-dark p-3 text-xs text-text-pure outline-none focus:border-primary-neon" />
        </label>
      </div>
      <button type="submit" disabled={props.pending} className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 font-black uppercase tracking-widest text-background-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-cyan disabled:opacity-50 ${props.editing ? "bg-primary-cyan" : "bg-primary-neon"}`}>
        {props.editing ? <Save aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}{props.pending ? "Đang lưu..." : props.editing ? "Cập nhật địa chỉ" : "Đăng ký địa chỉ"}
      </button>
    </form>
  );
}
