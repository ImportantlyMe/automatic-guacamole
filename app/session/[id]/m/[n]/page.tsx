"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ProgressDots } from "@/components/ProgressDots";
import {
  MEASUREMENT_NUMBERS,
  getMeasurement,
  getMeasurementIndex,
  getNextMeasurementNumber,
  getPrevMeasurementNumber,
} from "@/lib/measurements";
import { getSession, saveSession } from "@/lib/storage";
import { useDebouncedSave } from "@/lib/useDebouncedSave";
import type { Session } from "@/lib/types";

export default function MeasurementPage() {
  const router = useRouter();
  const params = useParams<{ id: string; n: string }>();
  const sessionId = params.id;
  const n = Number(params.n);

  const def = useMemo(() => getMeasurement(n), [n]);
  const validNumber = !!def && !def.isMetadata;

  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!validNumber) return;
    const s = getSession(sessionId);
    if (!s) {
      router.replace("/");
      return;
    }
    setSession(s);
    setLoaded(true);
  }, [sessionId, validNumber, router]);

  useEffect(() => {
    if (loaded && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [loaded, n]);

  useDebouncedSave(session);

  if (!validNumber || !def) return notFound();
  if (!loaded || !session) {
    return (
      <main className="mx-auto max-w-xl px-4 pt-10">
        <p className="text-sm text-ink/40">Loading…</p>
      </main>
    );
  }

  const entry = session.measurements[n] ?? { value: "", notes: "" };
  const idx = getMeasurementIndex(n);
  const total = MEASUREMENT_NUMBERS.length;
  const prevN = getPrevMeasurementNumber(n);
  const nextN = getNextMeasurementNumber(n);

  function patch(field: "value" | "notes", v: string) {
    setSession((s) =>
      s
        ? {
            ...s,
            measurements: {
              ...s.measurements,
              [n]: { ...(s.measurements[n] ?? { value: "", notes: "" }), [field]: v },
            },
          }
        : s
    );
  }

  function commitNow() {
    if (session) saveSession(session);
  }

  function goNext() {
    commitNow();
    if (nextN != null) router.push(`/session/${sessionId}/m/${nextN}`);
    else router.push(`/session/${sessionId}/review`);
  }

  function goPrev() {
    commitNow();
    if (prevN != null) router.push(`/session/${sessionId}/m/${prevN}`);
    else router.push(`/session/new`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pt-safe pb-safe">
      <header className="flex items-center justify-between pt-4">
        <Link
          href={`/session/${sessionId}/review`}
          className="text-sm text-ink/60 active:text-ink"
        >
          Review
        </Link>
        <div className="text-sm font-medium text-ink/50 tabular-nums">
          {idx + 1} of {total}
        </div>
      </header>

      <section className="mt-6">
        <div className="text-5xl font-bold tabular-nums text-ink/15">
          {n.toString().padStart(2, "0")}
        </div>
        <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight">
          {def.label}
        </h1>
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
        className="mt-6 flex flex-col gap-4"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink/70">
            Value (cm)
          </span>
          <input
            ref={inputRef}
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            enterKeyHint="next"
            value={entry.value}
            onChange={(e) => patch("value", e.target.value.replace(",", "."))}
            placeholder="0.0"
            className="w-full min-h-[64px] rounded-xl border border-ink/15 bg-white px-4 text-3xl font-semibold tabular-nums text-ink placeholder:text-ink/25 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink/70">
            Notes (optional)
          </span>
          <input
            value={entry.notes}
            onChange={(e) => patch("notes", e.target.value)}
            placeholder="anything tricky"
            className="w-full min-h-[48px] rounded-xl border border-ink/15 bg-white px-4 text-base text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </label>

        <div className="mt-2 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={goPrev}
          >
            ← Back
          </Button>
          <Button type="submit" variant="primary" className="flex-[1.4]">
            {nextN != null ? "Next →" : "Review →"}
          </Button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/50">
          Jump
        </h2>
        <ProgressDots sessionId={sessionId} current={n} session={session} />
      </div>
    </main>
  );
}
