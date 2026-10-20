import { route } from "@/lib/http";
import { store } from "@/lib/store";
import { addTask, listTasks } from "@/lib/tasks";
import type { Task } from "@/lib/types";

export const GET = route(listTasks);
export const POST = route(async (req: Request) => addTask((await req.json()) as Task));
export const PUT = route(async (req: Request) => {
  const tasks = (await req.json()) as Task[];
  await store.set("tasks", tasks);
  return tasks;
});
