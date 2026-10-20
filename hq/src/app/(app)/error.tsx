"use client";
import { Button, Card, Empty } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card>
      <Empty title="Cette page n'a pas pu s'afficher" action={<Button onClick={reset}>Réessayer</Button>}>
        {error.message}
      </Empty>
    </Card>
  );
}
