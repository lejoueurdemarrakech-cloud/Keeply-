import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-display text-[56px] font-extrabold text-violet">404</p>
        <p className="mt-1 text-ink-2">Cette page n&apos;existe pas.</p>
        <Link href="/" className="mt-4 inline-block font-semibold text-violet hover:underline">
          Retour à Aujourd&apos;hui
        </Link>
      </div>
    </main>
  );
}
