import { route } from "@/lib/http";
import { configOrNull } from "@/lib/connectors/config";
import { imapAction, updateMailState } from "@/lib/mail";
import type { MailCategory } from "@/lib/types";

export const POST = route(async (req: Request) => {
  const { uid, messageId, action, value } = (await req.json()) as {
    uid: string;
    messageId: string;
    action: "seen" | "unseen" | "archive" | "done" | "undone" | "priority" | "category";
    value?: number | string;
  };
  const cfg = await configOrNull("mail");
  if (cfg && (action === "seen" || action === "unseen" || action === "archive")) await imapAction(cfg, uid, action);
  await updateMailState((s) => {
    const cur = s.overrides[messageId] ?? {};
    const next = { ...cur };
    if (action === "done" || action === "archive") next.done = true;
    if (action === "undone") next.done = false;
    if (action === "priority") next.priority = Number(value);
    if (action === "category") next.category = value as MailCategory;
    return { ...s, overrides: { ...s.overrides, [messageId]: next } };
  });
  return { ok: true };
});
