"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui";

const CardStudio = dynamic(() => import("@/components/card-studio"), { ssr: false, loading: () => <Skeleton className="h-[80vh]" /> });

export default function CardStudioPage() {
  return <CardStudio />;
}
