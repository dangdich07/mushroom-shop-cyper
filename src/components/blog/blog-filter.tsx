interface BlogFilterProps {
  selectedTag: string | null;
  tags: string[];
  onChange: (tag: string | null) => void;
}

export function BlogFilter({ selectedTag, tags, onChange }: BlogFilterProps) {
  return (
    <aside aria-label="Lọc bài viết theo từ khóa" className="flex min-w-0 flex-col gap-4 border border-white/5 bg-black/10 p-4 font-mono text-xs lg:sticky lg:top-24">
      <h2 className="border-b border-white/5 pb-2 font-heading text-xs font-black uppercase tracking-widest text-text-pure">Màng Lọc Từ Khóa</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        <button type="button" aria-pressed={selectedTag === null} onClick={() => onChange(null)} className={`min-h-11 break-words border px-3 py-2 text-left text-[10px] font-bold uppercase transition-colors focus-visible:bio-focus motion-reduce:transition-none ${selectedTag === null ? "border-primary-neon bg-primary-neon/10 text-primary-neon ring-1 ring-primary-neon/30" : "border-white/5 text-text-dark hover:border-white/10 hover:text-text-pure"}`}>● HIỂN THỊ TẤT CẢ</button>
        {tags.map((tag) => (
          <button key={tag} type="button" aria-pressed={selectedTag === tag} onClick={() => onChange(tag)} className={`min-h-11 break-words border px-3 py-2 text-left text-[10px] font-bold uppercase transition-colors focus-visible:bio-focus motion-reduce:transition-none ${selectedTag === tag ? "border-primary-cyan bg-primary-cyan/10 text-primary-cyan ring-1 ring-primary-cyan/30" : "border-white/5 text-text-dark hover:border-white/10 hover:text-text-pure"}`}># {tag}</button>
        ))}
      </div>
    </aside>
  );
}

