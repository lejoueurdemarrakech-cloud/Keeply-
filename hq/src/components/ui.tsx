"use client";
import clsx from "clsx";
import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { delta, pct } from "@/lib/format";

export const cx = clsx;

/* ---------- Mise en page ---------- */

export function PageHeader({ title, subtitle, actions, icon }: { title: string; subtitle?: ReactNode; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <header className="rise mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 items-center gap-4">
        {icon && <div className="glass hidden size-12 shrink-0 place-items-center rounded-2xl text-violet sm:grid [&_svg]:size-6">{icon}</div>}
        <div className="min-w-0">
          <h1 className="font-display text-[28px] leading-[1.1] font-bold tracking-tight sm:text-[34px]">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-[62ch] text-[15px] text-ink-2">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ children, className, title, action, pad = true, id }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode; pad?: boolean; id?: string }) {
  return (
    <section id={id} className={cx("glass min-w-0 rounded-[22px]", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-1">
          {title && <h2 className="font-display text-[16px] font-semibold tracking-tight">{title}</h2>}
          {action}
        </div>
      )}
      <div className={cx(pad && "p-5", pad && (title || action) && "pt-3")}>{children}</div>
    </section>
  );
}

/* ---------- Boutons ---------- */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md"; loading?: boolean; icon?: ReactNode };

export function Button({ variant = "secondary", size = "md", loading, icon, className, children, disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-[background-color,border-color,transform,opacity] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-[14px]",
        variant === "primary" && "bg-violet text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_24px_-12px_var(--violet)] hover:bg-violet-2",
        variant === "secondary" && "border border-line-2 bg-glass-strong text-ink backdrop-blur-md hover:border-violet/40",
        variant === "ghost" && "text-ink-2 hover:bg-bg-2 hover:text-ink",
        variant === "danger" && "border border-line-2 bg-glass-strong text-coral backdrop-blur-md hover:border-coral",
        className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ---------- Indicateurs ---------- */

const TONE_ICON = { violet: "bg-violet-soft text-violet", honey: "bg-honey-soft text-honey", mint: "bg-mint-soft text-mint", coral: "bg-coral-soft text-coral" } as const;

export function Stat({ label, value, prev, current, hint, tone, invert, icon }: { label: string; value: ReactNode; current?: number; prev?: number; hint?: ReactNode; tone?: "violet" | "honey" | "mint" | "coral"; invert?: boolean; icon?: ReactNode }) {
  const d = current !== undefined && prev !== undefined ? delta(current, prev) : null;
  const good = d === null ? null : invert ? d < 0 : d > 0;
  return (
    <div className="glass min-w-0 rounded-[20px] p-4">
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
        {icon ? (
          <span className={cx("grid size-7 shrink-0 place-items-center rounded-lg [&_svg]:size-3.5", TONE_ICON[tone ?? "violet"])}>{icon}</span>
        ) : (
          tone && <span className={cx("size-2 shrink-0 rounded-full", { violet: "bg-violet", honey: "bg-honey", mint: "bg-mint", coral: "bg-coral" }[tone])} />
        )}
        <span className="truncate">{label}</span>
      </div>
      <div className="font-display tnum mt-2 truncate text-[27px] leading-none font-bold tracking-tight">{value}</div>
      <div className="mt-2 flex min-h-5 items-center gap-2 text-[12.5px] text-ink-3">
        {d !== null && Math.abs(d) > 0.0005 && (
          <span className={cx("tnum shrink-0 rounded-md px-1.5 py-0.5 font-semibold whitespace-nowrap", good ? "bg-mint-soft text-mint" : "bg-coral-soft text-coral")}>
            {d > 0 ? "+" : ""}
            {pct(d, 0)}
          </span>
        )}
        {hint && <span className="truncate">{hint}</span>}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "violet" | "honey" | "mint" | "coral" | "sky"; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap",
        tone === "neutral" && "bg-bg-2 text-ink-2 ring-1 ring-line ring-inset",
        tone === "violet" && "bg-violet-soft text-violet",
        tone === "honey" && "bg-honey-soft text-honey",
        tone === "mint" && "bg-mint-soft text-mint",
        tone === "coral" && "bg-coral-soft text-coral",
        tone === "sky" && "bg-[color-mix(in_srgb,var(--sky)_14%,transparent)] text-sky",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Signale que les chiffres affichés sont des exemples. */
export function DemoBadge({ show = true, what = "à connecter" }: { show?: boolean; what?: string }) {
  if (!show) return null;
  return (
    <a href="/connexions" title="Connecte ton compte pour voir tes vrais chiffres" className="inline-flex">
      <Badge tone="honey">{what}</Badge>
    </a>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

export function Empty({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      {icon && <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-violet-soft text-violet">{icon}</div>}
      <p className="font-display font-semibold">{title}</p>
      {children && <p className="mt-1 max-w-[46ch] text-[14px] text-ink-2">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-coral/30 bg-coral-soft px-4 py-3 text-[13.5px] text-coral">{children}</div>;
}

/* ---------- Formulaires ---------- */

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block min-w-0", className)}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12.5px] text-ink-3">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200", checked ? "bg-violet" : "bg-line-2")}
    >
      <span className={cx("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ease-[var(--ease-out-quint)]", checked && "translate-x-5")} />
    </button>
  );
}

export function Segmented<T extends string>({ value, onChange, options, size = "md" }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; size?: "sm" | "md" }) {
  return (
    <div className="glass inline-flex max-w-full overflow-x-auto rounded-xl p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            "rounded-[10px] font-semibold whitespace-nowrap transition-colors duration-150",
            size === "sm" ? "px-2.5 py-1 text-[12.5px]" : "px-3.5 py-1.5 text-[13.5px]",
            value === o.value ? "bg-violet text-white shadow-[0_4px_12px_-6px_var(--violet)]" : "text-ink-2 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string; icon?: ReactNode; count?: number }[] }) {
  return (
    <div className="-mx-4 mb-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist">
      <div className="glass inline-flex gap-1 rounded-2xl p-1">
        {tabs.map((t) => {
          const on = value === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={on}
              onClick={() => onChange(t.value)}
              className={cx(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-[14px] font-semibold whitespace-nowrap transition-[background-color,color] duration-150 [&_svg]:size-4",
                on ? "bg-violet text-white shadow-[0_6px_16px_-8px_var(--violet)]" : "text-ink-2 hover:bg-bg-2 hover:text-ink",
              )}
            >
              {t.icon}
              {t.label}
              {t.count ? <span className={cx("tnum rounded-full px-1.5 text-[11.5px]", on ? "bg-white/20 text-white" : "bg-violet-soft text-violet")}>{t.count}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Petit titre de section dans une page. */
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-2 mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-[18px] font-bold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

/** Jauge circulaire (score, progression). */
export function Ring({ value, size = 56, stroke = 6, color = "var(--violet)", children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: "stroke-dashoffset 0.6s var(--ease-out-quint)" }} />
      </svg>
      <div className="tnum absolute inset-0 grid place-items-center text-[12.5px] font-bold">{children}</div>
    </div>
  );
}

/* ---------- Fenêtre ---------- */

export function Modal({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cx(
        "glass-strong m-auto max-h-[92dvh] w-[calc(100%-24px)] overflow-hidden rounded-[24px] p-0 text-ink backdrop:bg-night/40 backdrop:backdrop-blur-sm open:flex open:flex-col",
        wide ? "max-w-3xl" : "max-w-lg",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 className="font-display text-[17px] font-semibold">{title}</h2>
        <button onClick={onClose} className="rounded-lg p-1.5 text-ink-3 hover:bg-bg-2 hover:text-ink" aria-label="Fermer">
          <X className="size-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">{open && children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
    </dialog>
  );
}

/* ---------- Divers ---------- */

/** Rendu Markdown minimal (titres, gras, listes) sans dépendance. */
export function Markdown({ text }: { text: string }) {
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^(?:[-*•] (.*)(?:\n|$))+/gm, (block) => `<ul>${block.trim().split("\n").map((l) => `<li>${l.replace(/^[-*•] /, "")}</li>`).join("")}</ul>`)
    .replace(/^(?:\d+\. (.*)(?:\n|$))+/gm, (block) => `<ol>${block.trim().split("\n").map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`).join("")}</ol>`)
    .split(/\n{2,}/)
    .map((p) => (/^<(h\d|ul|ol)/.test(p.trim()) ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`))
    .join("");
  return <div className="prose-hq text-[14.5px] text-ink-2" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Copié" : label}
    </Button>
  );
}
