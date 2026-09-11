// Small shared form primitives for the GIF and sticker workshops — split out
// once those moved to their own pages so both could use the same slider/toggle
// instead of each redefining it.

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format,
  hint,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex justify-between font-display text-xs uppercase tracking-wide text-foreground">
        {label}
        <span className="tabular-nums text-muted">{format(value)}</span>
      </span>
      {hint && <span className="-mt-1 text-xs text-muted">{hint}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky"
      />
    </label>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex flex-col">
        <span className="font-display text-xs uppercase tracking-wide text-foreground">
          {label}
        </span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
      <span
        className={`card-sm relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-sky" : "bg-foreground/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-cloud shadow-[0_1px_3px_rgba(14,36,56,0.35)] transition-all ${
            checked ? "left-[1.4rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
