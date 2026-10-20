import "server-only";
import { read, uid, update } from "@/lib/store";
import type { Task } from "@/lib/types";

export const listTasks = () => read<Task[]>("tasks", []);

export async function addTask(t: Partial<Task> & { title: string }) {
  const task: Task = { id: uid("t"), status: "todo", priority: "normale", createdAt: new Date().toISOString(), ...t };
  await update<Task[]>("tasks", [], (all) => [task, ...all]);
  return task;
}

/** Ajoute une tâche seulement si aucune tâche ouverte ne porte déjà ce lien. */
export async function addTaskOnce(link: string, t: Partial<Task> & { title: string }) {
  const open = (await listTasks()).some((x) => x.link === link && x.status !== "done");
  if (!open) await addTask({ ...t, link });
}
