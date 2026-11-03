import type { Metadata, Viewport } from "next";

export const metadata: Metadata = { title: "Jarvis" };
export const viewport: Viewport = { themeColor: "#07050f" };

export default function JarvisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
