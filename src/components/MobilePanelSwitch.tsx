// Below lg the editor pages show one panel at a time instead of two columns
// side by side; this picks which one. From lg up it isn't rendered.
export function MobilePanelSwitch<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="lg:hidden shrink-0 bg-[color:var(--ink)] px-4 pb-2">
      <div className="flex gap-1 bg-white/5 rounded p-0.5" role="tablist" aria-label="Panel">
        {options.map((option) => (
          <button
            key={option.value}
            role="tab"
            aria-selected={value === option.value}
            className={`flex-1 [font-family:var(--font-mono)] text-[11px] tracking-[0.06em] rounded px-3 py-1.5 border-none cursor-pointer transition-colors ${
              value === option.value
                ? 'bg-[color:var(--accent)] text-[color:var(--ink)] font-semibold'
                : 'bg-transparent text-[#8896AB]'
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
