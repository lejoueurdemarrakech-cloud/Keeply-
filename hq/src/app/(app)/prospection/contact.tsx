"use client";
import { AtSign, Mail, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { toast } from "sonner";
import { cx } from "@/components/ui";
import { SCRIPTS, fill, igLink, mapsLink, mobile, telLink, waLink } from "@/lib/channels";
import { api } from "@/lib/client";
import type { Prospect } from "@/lib/types";

type Touch = NonNullable<Prospect["touches"]>[number];

/** Note un contact hors mail (WhatsApp, appel, Instagram, visite) et passe le commerce en « Contacté ». */
export async function logTouch(p: Prospect, channel: Touch["channel"], note?: string) {
  const touches = [...(p.touches ?? []), { at: new Date().toISOString(), channel, note }];
  const next = new Date();
  next.setDate(next.getDate() + 3);
  await api("PATCH", `/api/prospects/${p.id}`, {
    touches,
    status: p.status === "nouveau" ? "contacte" : p.status,
    nextAction: { at: next.toISOString(), label: channel === "visite" ? "Repasser ou écrire sur WhatsApp" : "Relancer" },
    history: [...p.history, { at: new Date().toISOString(), event: { whatsapp: "WhatsApp envoyé", appel: "Appelé", instagram: "Message Instagram", visite: "Visité", mail: "Mail envoyé" }[channel] + (note ? ` : ${note}` : "") }],
  });
}

const btn = "inline-flex size-8 items-center justify-center rounded-lg border border-line text-ink-2 transition-colors hover:border-violet hover:text-violet";

/** Boutons rapides : chaque clic ouvre le bon outil et garde une trace. */
export function ContactActions({ p, onChange, size = "md" }: { p: Prospect; onChange: () => void; size?: "sm" | "md" }) {
  const touched = (c: Touch["channel"]) => p.touches?.some((t) => t.channel === c);
  const act = (c: Touch["channel"]) => async () => {
    await logTouch(p, c);
    toast.success("Noté dans l'historique.");
    onChange();
  };
  const wa = SCRIPTS.find((s) => s.id === "wa-1")!;
  const mail = SCRIPTS.find((s) => s.id === "mail-1")!;
  return (
    <div className={cx("flex flex-wrap gap-1", size === "sm" && "[&_a]:size-7 [&_button]:size-7")} onClick={(e) => e.stopPropagation()}>
      {p.phone && mobile(p) && (
        <a className={cx(btn, touched("whatsapp") && "border-mint text-mint")} title="WhatsApp (message prêt)" href={waLink(p, fill(wa.body, p))} target="_blank" rel="noreferrer" onClick={act("whatsapp")}>
          <MessageCircle className="size-4" />
        </a>
      )}
      {p.phone && (
        <a className={cx(btn, touched("appel") && "border-mint text-mint")} title={`Appeler ${p.phone}`} href={telLink(p)} onClick={act("appel")}>
          <Phone className="size-4" />
        </a>
      )}
      {p.email && (
        <a className={cx(btn, touched("mail") && "border-mint text-mint")} title={`Écrire à ${p.email}`} href={`mailto:${p.email}?subject=${encodeURIComponent(fill(mail.subject!, p))}&body=${encodeURIComponent(fill(mail.body, p))}`} onClick={act("mail")}>
          <Mail className="size-4" />
        </a>
      )}
      {p.instagram && (
        <a className={cx(btn, touched("instagram") && "border-mint text-mint")} title={`@${p.instagram}`} href={igLink(p)} target="_blank" rel="noreferrer" onClick={act("instagram")}>
          <AtSign className="size-4" />
        </a>
      )}
      <a className={btn} title="Voir sur la carte" href={mapsLink(p)} target="_blank" rel="noreferrer">
        <MapPin className="size-4" />
      </a>
      <button className={cx(btn, touched("visite") && "border-mint text-mint")} title="Je suis passé le voir" onClick={act("visite")}>
        <Store className="size-4" />
      </button>
    </div>
  );
}

/** Nombre de façons de joindre ce commerce. */
export const reach = (p: Prospect) => Number(!!p.email) + Number(!!p.phone) + Number(!!p.instagram) + Number(!!p.address);
