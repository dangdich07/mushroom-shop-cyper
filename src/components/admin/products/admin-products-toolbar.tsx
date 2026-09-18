import { Plus, Search } from "lucide-react";

interface Props {
  category: string;
  count: number;
  onCategoryChange: (value: string) => void;
  onCreate: () => void;
  onSearchChange: (value: string) => void;
  search: string;
}

export function AdminProductsToolbar({ category, count, onCategoryChange, onCreate, onSearchChange, search }: Props) {
  return <section aria-label="Công cụ sản phẩm" className="grid min-w-0 gap-3 border border-white/5 bg-black/20 p-4 md:grid-cols-[minmax(0,1fr)_minmax(180px,260px)_auto] md:items-end"><div className="min-w-0"><label htmlFor="admin-product-search" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-text-dark">Tìm sản phẩm</label><div className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dark" /><input id="admin-product-search" type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tên sản phẩm hoặc SKU" className="min-h-11 w-full min-w-0 border border-white/10 bg-background-dark py-2 pl-9 pr-3 font-mono text-xs uppercase text-text-pure focus-visible:bio-focus" /></div></div><div className="min-w-0"><label htmlFor="admin-product-category" className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-text-dark">Phân loại</label><select id="admin-product-category" value={category} onChange={(event) => onCategoryChange(event.target.value)} className="min-h-11 w-full border border-white/10 bg-background-dark px-3 font-mono text-xs font-bold uppercase text-text-pure focus-visible:bio-focus"><option value="ALL">Tất cả chủng loại</option><option value="MEDICINAL">Nấm dược liệu</option><option value="FOOD">Nấm thực phẩm</option><option value="EQUIPMENT">Thiết bị & vật tư</option></select></div><div className="flex flex-wrap items-center gap-3 md:justify-end"><span className="font-mono text-[10px] uppercase text-text-dark">Hiển thị: <strong className="text-text-pure">{count}</strong></span><button type="button" onClick={onCreate} className="inline-flex min-h-11 items-center gap-2 bg-primary-neon px-4 font-mono text-[10px] font-bold uppercase text-background-deep hover:bg-primary-cyan focus-visible:bio-focus"><Plus aria-hidden="true" className="h-4 w-4" />Tạo sản phẩm</button></div></section>;
}
