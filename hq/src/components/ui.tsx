"use client";
import clsx from "clsx";
import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { delta, pct } from "@/lib/format";

export const cx = clsx;

/* ---------- Mise en page ---------- */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="font-display text-[28px] leading-tight font-bold sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-[62ch] text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ children, className, title, action, pad = true, id }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode; pad?: boolean; id?: string }) {
  return (
    <section id={id} className={cx("min-w-0 rounded-2xl border border-line bg-surface shadow-card", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-1">
          {title && <h2 className="font-display text-[15.5px] font-semibold">{title}</h2>}
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
        variant === "primary" && "bg-violet text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_8px_20px_-10px_var(--violet)] hover:bg-violet-2",
        variant === "secondary" && "border border-line bg-surface text-ink hover:border-line-2 hover:bg-surface-2",
        variant === "ghost" && "text-ink-2 hover:bg-bg-2 hover:text-ink",
        variant === "danger" && "border border-line bg-surface text-coral hover:border-coral",
        className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ---------- Indicateurs ---------- */

export function Stat({ label, value, prev, current, hint, tone, invert }: { label: string; value: ReactNode; current?: number; prev?: number; hint?: ReactNode; tone?: "violet" | "honey" | "mint" | "coral"; invert?: boolean }) {
  const d = current !== undefined && prev !== undefined ? delta(current, prev) : null;
  const good = d === null ? null : invert ? d < 0 : d > 0;
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2 text-[13px] text-ink-2">
        {tone && <span className={cx("size-2 rounded-full", { violet: "bg-violet", honey: "bg-honey", mint: "bg-mint", coral: "bg-coral" }[tone])} />}
        <span className="truncate">{label}</span>
      </div>
      <div className="font-display tnum mt-1.5 truncate text-[26px] leading-none font-bold">{value}</div>
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
        tone === "neutral" && "bg-bg-2 text-ink-2",
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
export function DemoBadge({ show = true, what = "données d'exemple" }: { show?: boolean; what?: string }) {
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
  return <div className="rounded-xl border border-coral/30 bg-coral-soft px-4 py-3 text-[13.5px] text-coral">{children}</div>;
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
    <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-line bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            "rounded-[10px] font-semibold whitespace-nowrap transition-colors duration-150",
            size === "sm" ? "px-2.5 py-1 text-[12.5px]" : "px-3.5 py-1.5 text-[13.5px]",
            value === o.value ? "bg-violet-soft text-violet" : "text-ink-2 hover:text-ink",
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
    <div className="-mx-4 mb-6 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cx(
              "relative flex items-center gap-2 px-3 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors",
              value === t.value ? "text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {t.icon}
            {t.label}
            {t.count ? <span className="tnum rounded-full bg-violet-soft px-1.5 text-[11.5px] text-violet">{t.count}</span> : null}
            {value === t.value && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-violet" />}
          </button>
        ))}
      </div>
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
        "m-auto max-h-[92dvh] w-[calc(100%-24px)] overflow-hidden rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-night/50 backdrop:backdrop-blur-[2px] open:flex open:flex-col",
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
