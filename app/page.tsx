"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { deleteSession, listSessions } from "@/lib/storage";
import type { Session } from "@/lib/types";
import { MEASUREMENT_NUMBERS } from "@/lib/measurements";

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    setSessions(listSessions());
  }, []);

  function refresh() {
    setSessions(listSessions());
  }

  function onDelete(id: string) {
    if (!window.confirm("Delete this session?")) return;
    deleteSession(id);
    refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pt-safe pb-safe">
      <header className="pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Diana James</h1>
        <p className="text-sm text-ink/60">Measurement sessions</p>
      </header>

      <section className="mt-6">
        <Link href="/session/new" className="block">
          <Button className="w-full" variant="primary">
            + New session
          </Button>
        </Link>
      </section>

      <section className="mt-8 flex-1">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/50">
          Recent
        </h2>
        {sessions === null ? (
          <p className="text-sm text-ink/40">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-ink/50">No sessions yet.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => {
              const filled = MEASUREMENT_NUMBERS.filter(
                (n) => !!s.measurements[n]?.value?.trim()
              ).length;
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3"
                >
                  <Link
                    href={`/session/${s.id}/review`}
                    className="flex-1 min-w-0"
                  >
                    <div className="truncate text-base font-semibold">
                      {s.clientName || "(no name)"}
                    </div>
                    <div className="text-xs text-ink/50">
                      {s.measurementDate} · {filled}/{MEASUREMENT_NUMBERS.length} filled
                    </div>
                  </Link>
                  <button
                    onClick={() => onDelete(s.id)}
                    aria-label="Delete session"
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-ink/40 active:bg-black/5"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
