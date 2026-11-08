interface BlogFilterProps {
  selectedTag: string | null;
  tags: string[];
  onChange: (tag: string | null) => void;
}

export function BlogFilter({ selectedTag, tags, onChange }: BlogFilterProps) {
  return (
    <aside aria-label="Lọc bài viết theo từ khóa" className="flex min-w-0 flex-col gap-3 rounded-xl border border-primary-cyan/20 bg-surface-glass p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:p-3.5">
      <h2 className="shrink-0 font-heading text-xs font-black uppercase tracking-[0.16em] text-text-pure sm:pr-2">Chủ đề</h2>
      <div className="flex min-w-0 flex-wrap gap-2">
        <button type="button" aria-pressed={selectedTag === null} onClick={() => onChange(null)} className={`min-h-10 rounded-full border px-3 py-2 text-left text-[11px] font-bold transition-colors focus-visible:bio-focus motion-reduce:transition-none ${selectedTag === null ? "border-primary-neon bg-primary-neon/10 text-primary-neon ring-1 ring-primary-neon/30" : "border-primary-cyan/20 text-text-dark hover:border-primary-cyan/50 hover:text-text-pure"}`}>Tất cả chủ đề</button>
        {tags.map((tag) => (
          <button key={tag} type="button" aria-pressed={selectedTag === tag} onClick={() => onChange(tag)} className={`min-h-10 max-w-full truncate rounded-full border px-3 py-2 text-left text-[11px] font-semibold transition-colors focus-visible:bio-focus motion-reduce:transition-none ${selectedTag === tag ? "border-primary-cyan bg-primary-cyan/10 text-primary-cyan ring-1 ring-primary-cyan/30" : "border-primary-cyan/20 text-text-dark hover:border-primary-cyan/50 hover:text-text-pure"}`}># {tag}</button>
        ))}
      </div>
    </aside>
  );
}
