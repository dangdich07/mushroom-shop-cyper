import { MapPin, Pencil, Trash2 } from "lucide-react";

export interface AccountAddressItem {
  id: string;
  name: string;
  phone: string;
  area: string;
  detail: string;
}

interface AccountAddressListProps {
  addresses: AccountAddressItem[];
  deleting: boolean;
  editingAddressId: string | null;
  onDelete: (id: string) => void;
  onEdit: (address: AccountAddressItem) => void;
}

export function AccountAddressList({ addresses, deleting, editingAddressId, onDelete, onEdit }: AccountAddressListProps) {
  if (addresses.length === 0) {
    return (
      <div role="status" className="flex min-h-40 flex-col items-center justify-center gap-3 border border-dashed border-white/10 bg-black/10 p-6 text-center">
        <MapPin aria-hidden="true" className="h-8 w-8 text-text-dark opacity-40" />
        <p className="font-mono text-xs uppercase leading-relaxed text-text-dark">Sổ địa chỉ trống. Hãy thêm tọa độ nhận hàng mới bên dưới.</p>
      </div>
    );
  }

  return (
    <ul className="grid min-w-0 gap-3" aria-label="Danh sách địa chỉ nhận hàng">
      {addresses.map((address) => {
        const editing = editingAddressId === address.id;
        return (
          <li key={address.id} className={`min-w-0 border p-4 ${editing ? "border-primary-neon bg-primary-neon/5" : "border-white/5 bg-background-card/20"}`}>
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <MapPin aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${editing ? "text-primary-neon" : "text-primary-cyan"}`} />
                <div className="min-w-0 font-mono">
                  <p className="break-words text-[11px] font-bold uppercase tracking-wide text-text-pure">{address.name}</p>
                  <p className="mt-1 break-all text-xs text-primary-cyan">{address.phone}</p>
                  <span className="mt-2 inline-flex border border-primary-neon/20 bg-white/5 px-2 py-1 text-[9px] font-black text-primary-neon">{address.area}</span>
                  <p className="mt-2 break-words text-xs leading-relaxed text-text-muted">{address.detail}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 self-end sm:self-start">
                <button type="button" onClick={() => onEdit(address)} disabled={editing} aria-label={`Sửa địa chỉ ${address.name}`} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/10 text-text-dark hover:border-primary-cyan/40 hover:text-primary-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-cyan disabled:opacity-30">
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onDelete(address.id)} disabled={deleting} aria-label={`Xóa địa chỉ ${address.name}`} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/10 text-text-dark hover:border-red-500/40 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:opacity-50">
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
