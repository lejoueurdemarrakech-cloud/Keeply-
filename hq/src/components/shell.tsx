"use client";
import { Command } from "cmdk";
import {
  Aperture,
  Bot,
  ClipboardCheck,
  Gauge,
  HeartPulse,
  Inbox,
  ListChecks,
  LogOut,
  Monitor,
  Moon,
  MoreHorizontal,
  Plug,
  Plus,
  Radar,
  Search,
  Settings,
  Star,
  Store,
  Sun,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { toast } from "sonner";
import { api, useApi } from "@/lib/client";
import { cx } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: "mails" | "sante" | "prospects" | "valider";
}

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Pilotage",
    items: [
      { href: "/", label: "Aujourd'hui", icon: <Sun /> },
      { href: "/valider", label: "À valider", icon: <ClipboardCheck />, badge: "valider" },
      { href: "/ventes", label: "Ventes", icon: <TrendingUp /> },
      { href: "/sante", label: "Santé de l'app", icon: <HeartPulse />, badge: "sante" },
    ],
  },
  {
    label: "Croissance",
    items: [
      { href: "/instagram", label: "Instagram & Ads", icon: <Aperture /> },
      { href: "/prospection", label: "Prospection", icon: <Radar />, badge: "prospects" },
      { href: "/harvey", label: "Harvey", icon: <Bot /> },
    ],
  },
  {
    label: "Relation",
    items: [
      { href: "/mails", label: "Mails", icon: <Inbox />, badge: "mails" },
      { href: "/clients", label: "Clients", icon: <Store /> },
      { href: "/avis", label: "Avis", icon: <Star /> },
    ],
  },
  {
    label: "Organisation",
    items: [
      { href: "/taches", label: "Tâches", icon: <ListChecks /> },
      { href: "/outils", label: "Outils", icon: <Wrench /> },
      { href: "/claude", label: "Crédits Claude", icon: <Gauge /> },
    ],
  },
];
const BOTTOM: NavItem[] = [
  { href: "/connexions", label: "Connexions", icon: <Plug /> },
  { href: "/reglages", label: "Réglages", icon: <Settings /> },
];
const ALL = [...GROUPS.flatMap((g) => g.items), ...BOTTOM];

interface Counts {
  mails?: { urgentCount: number } | null;
  health?: { problems: unknown[] } | null;
  prospects?: { replied: unknown[] };
}

function useCounts() {
  const { data } = useApi<Counts>("/api/today", { refreshInterval: 5 * 60_000 });
  const { data: review } = useApi<{ pending: number }>("/api/review?count=1", { refreshInterval: 5 * 60_000 });
  return {
    valider: review?.pending ?? 0,
    mails: data?.mails?.urgentCount ?? 0,
    sante: data?.health?.problems.length ?? 0,
    prospects: data?.prospects?.replied.length ?? 0,
  };
}

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-2">
      <svg viewBox="0 0 64 64" className="size-8 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="16" fill="var(--violet)" />
        <circle cx="22" cy="24" r="6" fill="#F3BE72" />
        <circle cx="42" cy="24" r="6" fill="#F3BE72" />
        <circle cx="22" cy="42" r="6" fill="#F3BE72" />
        <circle cx="42" cy="42" r="6" fill="none" stroke="#F3BE72" strokeWidth="2.5" strokeDasharray="3 3" />
      </svg>
      <span className="font-display text-[19px] font-bold">
        Keeply <span className="text-ink-3">HQ</span>
      </span>
    </Link>
  );
}

function NavLink({ item, active, count, onClick }: { item: NavItem; active: boolean; count?: number; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cx(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-semibold transition-colors duration-150 [&_svg]:size-[18px] [&_svg]:shrink-0",
        active ? "bg-violet-soft text-violet" : "text-ink-2 hover:bg-bg-2 hover:text-ink",
      )}
    >
      {item.icon}
      <span className="flex-1 truncate">{item.label}</span>
      {!!count && <span className={cx("tnum rounded-full px-1.5 text-[11.5px] leading-5", item.badge === "prospects" ? "bg-mint-soft text-mint" : "bg-coral-soft text-coral")}>{count}</span>}
    </Link>
  );
}

type ThemeMode = "light" | "dark" | "system";
const themeListeners = new Set<() => void>();
function readTheme(): ThemeMode {
  try {
    return (localStorage.getItem("hq-theme") as ThemeMode) || "system";
  } catch {
    return "system";
  }
}
function applyTheme(m: ThemeMode) {
  try {
    localStorage.setItem("hq-theme", m);
  } catch {}
  const t = m === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : m;
  document.documentElement.setAttribute("data-theme", t);
  themeListeners.forEach((l) => l());
}

function ThemeSwitch() {
  const mode = useSyncExternalStore(
    (cb) => {
      themeListeners.add(cb);
      return () => themeListeners.delete(cb);
    },
    readTheme,
    () => "system" as ThemeMode,
  );
  const apply = applyTheme;
  const opts = [
    { v: "light" as const, icon: <Sun />, label: "Clair" },
    { v: "dark" as const, icon: <Moon />, label: "Sombre" },
    { v: "system" as const, icon: <Monitor />, label: "Système" },
  ];
  return (
    <div className="flex rounded-xl border border-line bg-surface p-0.5" role="radiogroup" aria-label="Thème">
      {opts.map((o) => (
        <button
          key={o.v}
          role="radio"
          aria-checked={mode === o.v}
          title={o.label}
          onClick={() => apply(o.v)}
          className={cx("grid flex-1 place-items-center rounded-[10px] py-1.5 [&_svg]:size-4", mode === o.v ? "bg-violet-soft text-violet" : "text-ink-3 hover:text-ink")}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

async function logout() {
  await api("POST", "/api/auth/logout", undefined, { silent: true });
  // Rechargement complet voulu : la session vient de changer.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = "/login";
}

function Sidebar({ onSearch }: { onSearch: () => void }) {
  const path = usePathname();
  const counts = useCounts();
  return (
    <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col border-r border-line bg-surface/60 px-3 py-4 backdrop-blur lg:flex">
      <Logo />
      <button
        onClick={onSearch}
        className="mt-5 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2 text-[13.5px] text-ink-3 transition-colors hover:border-line-2 hover:text-ink-2"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Rechercher, agir…</span>
        <kbd className="rounded-md border border-line px-1.5 text-[11px] font-semibold">⌘K</kbd>
      </button>
      <nav className="mt-4 flex-1 space-y-4 overflow-y-auto" aria-label="Navigation principale">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="mb-1 px-3 text-[12px] font-semibold text-ink-3">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map((i) => (
                <NavLink key={i.href} item={i} active={isActive(path, i.href)} count={i.badge ? counts[i.badge] : 0} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="space-y-0.5 border-t border-line pt-3">
        {BOTTOM.map((i) => (
          <NavLink key={i.href} item={i} active={isActive(path, i.href)} />
        ))}
        <div className="flex items-center gap-2 px-1 pt-2">
          <div className="flex-1">
            <ThemeSwitch />
          </div>
          <button onClick={logout} title="Se déconnecter" className="grid size-9 place-items-center rounded-xl text-ink-3 hover:bg-bg-2 hover:text-ink">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

const MOBILE_TABS = ["/", "/ventes", "/mails", "/instagram"];

function MobileNav({ onSearch }: { onSearch: () => void }) {
  const path = usePathname();
  const counts = useCounts();
  const [more, setMore] = useState(false);
  const tabs = MOBILE_TABS.map((h) => ALL.find((i) => i.href === h)!);
  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/85 px-4 py-2.5 backdrop-blur-lg lg:hidden">
        <Logo />
        <button onClick={onSearch} className="grid size-10 place-items-center rounded-xl text-ink-2 hover:bg-bg-2" aria-label="Rechercher">
          <Search className="size-5" />
        </button>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden" aria-label="Navigation">
        <div className="grid grid-cols-5">
          {tabs.map((t) => {
            const active = isActive(path, t.href);
            const count = t.badge ? counts[t.badge] : 0;
            return (
              <Link key={t.href} href={t.href} className={cx("relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold [&_svg]:size-[21px]", active ? "text-violet" : "text-ink-3")}>
                {t.icon}
                <span className="max-w-full truncate px-1">{t.label.split(" ")[0]}</span>
                {!!count && <span className="absolute top-1 left-[calc(50%+6px)] size-2 rounded-full bg-coral" />}
              </Link>
            );
          })}
          <button onClick={() => setMore(true)} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-ink-3 [&_svg]:size-[21px]">
            <MoreHorizontal />
            Plus
          </button>
        </div>
      </nav>
      {more && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Plus de pages">
          <button className="absolute inset-0 bg-night/50" onClick={() => setMore(false)} aria-label="Fermer" />
          <div className="rise absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-line bg-surface p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-[17px] font-semibold">Toutes les pages</p>
              <button onClick={() => setMore(false)} className="rounded-lg p-2 text-ink-3" aria-label="Fermer">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {ALL.filter((i) => !MOBILE_TABS.includes(i.href)).map((i) => (
                <NavLink key={i.href} item={i} active={isActive(path, i.href)} count={i.badge ? counts[i.badge] : 0} onClick={() => setMore(false)} />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1">
                <ThemeSwitch />
              </div>
              <button onClick={logout} className="flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold text-ink-2 hover:bg-bg-2">
                <LogOut className="size-4" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Palette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const router = useRouter();
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const run = async (label: string, fn: () => Promise<unknown>) => {
    setOpen(false);
    const id = toast.loading(label + "…");
    await fn();
    toast.success(label + " : terminé", { id });
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Palette de commandes">
      <button className="absolute inset-0 bg-night/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-label="Fermer" />
      <Command className="rise relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl" loop>
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search className="size-4 text-ink-3" />
          <Command.Input autoFocus placeholder="Aller à une page ou lancer une action…" className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3" />
        </div>
        <Command.List className="max-h-[52vh] overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-ink-3">
          <Command.Empty className="px-3 py-6 text-center text-[14px] text-ink-3">Rien trouvé.</Command.Empty>
          <Command.Group heading="Actions">
            {[
              { label: "Nouveau post Instagram", icon: <Plus />, act: () => go("/instagram?tab=creer") },
              { label: "Nouvelle tâche", icon: <Plus />, act: () => go("/taches?new=1") },
              { label: "Chercher des restaurants à prospecter", icon: <Radar />, act: () => go("/prospection?search=1") },
              { label: "Relever les mails", icon: <Inbox />, act: () => run("Relève des mails", () => fetch("/api/mail?refresh=1")) },
              { label: "Tester l'app maintenant", icon: <HeartPulse />, act: () => run("Test de santé", () => api("POST", "/api/health/run")) },
              { label: "Lancer la tâche planifiée", icon: <Settings />, act: () => run("Tâche planifiée", () => fetch("/api/cron?force=1")) },
            ].map((a) => (
              <Command.Item key={a.label} onSelect={a.act} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] data-[selected=true]:bg-violet-soft data-[selected=true]:text-violet [&_svg]:size-4">
                {a.icon}
                {a.label}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Pages">
            {ALL.map((i) => (
              <Command.Item key={i.href} onSelect={() => go(i.href)} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] data-[selected=true]:bg-violet-soft data-[selected=true]:text-violet [&_svg]:size-4">
                {i.icon}
                {i.label}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

/** Tant que l'app est ouverte, lance la tâche planifiée toutes les 3 minutes. */
function Heartbeat() {
  useEffect(() => {
    const tick = () => fetch("/api/cron").catch(() => undefined);
    const first = setTimeout(tick, 8000);
    const t = setInterval(tick, 3 * 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  return null;
}

export function Shell({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="flex min-h-dvh">
      <Sidebar onSearch={() => setPalette(true)} />
      <div className="min-w-0 flex-1">
        <MobileNav onSearch={() => setPalette(true)} />
        <main className="mx-auto w-full max-w-[1280px] px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-9 lg:pb-14">{children}</main>
      </div>
      <Palette open={palette} setOpen={setPalette} />
      <Heartbeat />
    </div>
  );
}
