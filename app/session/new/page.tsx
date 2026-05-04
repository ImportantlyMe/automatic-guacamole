"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { TextArea, TextField } from "@/components/Field";
import { newSession, saveSession } from "@/lib/storage";
import { MEASUREMENT_NUMBERS } from "@/lib/measurements";
import type { Session } from "@/lib/types";

export default function NewSessionPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session>(() => newSession());

  function update<K extends keyof Session>(key: K, value: Session[K]) {
    setSession((s) => ({ ...s, [key]: value }));
  }

  function onStart(e: React.FormEvent) {
    e.preventDefault();
    saveSession(session);
    const first = MEASUREMENT_NUMBERS[0];
    router.push(`/session/${session.id}/m/${first}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pt-safe pb-safe">
      <header className="flex items-center gap-3 pt-4">
        <Link
          href="/"
          aria-label="Back"
          className="flex h-12 w-12 items-center justify-center rounded-lg text-ink/60 active:bg-black/5"
        >
          ←
        </Link>
        <h1 className="text-xl font-semibold">New session</h1>
      </header>

      <form onSubmit={onStart} className="mt-4 flex flex-1 flex-col gap-4">
        <TextField
          label="Client full name"
          value={session.clientName}
          onChange={(e) => update("clientName", e.target.value)}
          autoFocus
          autoCapitalize="words"
          autoComplete="name"
          required
        />
        <TextField
          label="Date"
          type="date"
          value={session.measurementDate}
          onChange={(e) => update("measurementDate", e.target.value)}
          required
        />
        <TextField
          label="Bra size"
          value={session.braSize}
          onChange={(e) => update("braSize", e.target.value)}
          placeholder="e.g. 34C"
        />
        <TextField
          label="Clothes worn during measuring"
          value={session.clothesWorn}
          onChange={(e) => update("clothesWorn", e.target.value)}
          placeholder="e.g. fitted leotard"
        />
        <TextField
          label="Heel height worn during measurements"
          value={session.heelHeightDuringMeasurement}
          onChange={(e) =>
            update("heelHeightDuringMeasurement", e.target.value)
          }
          placeholder="e.g. 4cm"
        />
        <TextField
          label="Heel height for the event"
          value={session.heelHeightForEvent}
          onChange={(e) => update("heelHeightForEvent", e.target.value)}
          placeholder="e.g. 8cm"
        />
        <TextArea
          label="General comments"
          value={session.comments}
          onChange={(e) => update("comments", e.target.value)}
          placeholder="Anything to remember"
        />

        <div className="mt-2 pb-2">
          <Button type="submit" variant="primary" className="w-full">
            Start measuring →
          </Button>
        </div>
      </form>
    </main>
  );
}
