"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { TextArea, TextField } from "@/components/Field";
import { MEASUREMENTS } from "@/lib/measurements";
import { buildCsv } from "@/lib/csv";
import { buildPdf } from "@/lib/pdf";
import { shareOrDownload } from "@/lib/share";
import { slugify } from "@/lib/slug";
import { getSession, saveSession } from "@/lib/storage";
import { useDebouncedSave } from "@/lib/useDebouncedSave";
import type { Session } from "@/lib/types";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [showMeta, setShowMeta] = useState(false);
  const [busy, setBusy] = useState<"" | "pdf" | "csv">("");

  useEffect(() => {
    const s = getSession(params.id);
    if (!s) {
      router.replace("/");
      return;
    }
    setSession(s);
  }, [params.id, router]);

  useDebouncedSave(session);

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-4 pt-10">
        <p className="text-sm text-ink/40">Loading…</p>
      </main>
    );
  }

  function patchSession<K extends keyof Session>(k: K, v: Session[K]) {
    setSession((s) => (s ? { ...s, [k]: v } : s));
  }

  function patchMeasurement(n: number, field: "value" | "notes", v: string) {
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

  function metadataValue(n: number): string {
    if (!session) return "";
    if (n === 1) return session.clothesWorn;
    if (n === 2) return session.braSize;
    if (n === 43) return session.heelHeightDuringMeasurement;
    if (n === 44) return session.heelHeightForEvent;
    return "";
  }

  async function exportPdf() {
    if (!session || busy) return;
    setBusy("pdf");
    try {
      saveSession(session);
      const bytes = await buildPdf(session);
      const filename = `measurements-${slugify(session.clientName)}-${session.measurementDate}.pdf`;
      await shareOrDownload(filename, "application/pdf", bytes);
    } finally {
      setBusy("");
    }
  }

  async function exportCsv() {
    if (!session || busy) return;
    setBusy("csv");
    try {
      saveSession(session);
      const csv = buildCsv(session);
      const filename = `measurements-${slugify(session.clientName)}-${session.measurementDate}.csv`;
      await shareOrDownload(filename, "text/csv;charset=utf-8", csv);
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pt-safe pb-safe">
      <header className="flex items-center justify-between pt-4">
        <Link
          href="/"
          aria-label="Home"
          className="flex h-12 w-12 items-center justify-center rounded-lg text-ink/60 active:bg-black/5"
        >
          ←
        </Link>
        <h1 className="text-lg font-semibold">Review</h1>
        <button
          onClick={() => setShowMeta((v) => !v)}
          className="text-sm text-ink/60 active:text-ink"
        >
          {showMeta ? "Hide" : "Edit"} info
        </button>
      </header>

      <section className="mt-3 rounded-xl border border-ink/10 bg-white p-3">
        <div className="text-base font-semibold">
          {session.clientName || "(no name)"}
        </div>
        <div className="text-xs text-ink/50">{session.measurementDate}</div>
      </section>

      {showMeta ? (
        <section className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-ink/10 bg-white p-3">
          <TextField
            label="Client full name"
            value={session.clientName}
            onChange={(e) => patchSession("clientName", e.target.value)}
          />
          <TextField
            label="Date"
            type="date"
            value={session.measurementDate}
            onChange={(e) => patchSession("measurementDate", e.target.value)}
          />
          <TextField
            label="Bra size"
            value={session.braSize}
            onChange={(e) => patchSession("braSize", e.target.value)}
          />
          <TextField
            label="Clothes worn"
            value={session.clothesWorn}
            onChange={(e) => patchSession("clothesWorn", e.target.value)}
          />
          <TextField
            label="Heels during measurements"
            value={session.heelHeightDuringMeasurement}
            onChange={(e) =>
              patchSession("heelHeightDuringMeasurement", e.target.value)
            }
          />
          <TextField
            label="Heels for event"
            value={session.heelHeightForEvent}
            onChange={(e) => patchSession("heelHeightForEvent", e.target.value)}
          />
          <TextArea
            label="Comments"
            value={session.comments}
            onChange={(e) => patchSession("comments", e.target.value)}
          />
        </section>
      ) : null}

      <section className="mt-4 space-y-1">
        {MEASUREMENTS.map((m) => {
          if (m.isMetadata) {
            return (
              <div
                key={m.n}
                className="flex items-center gap-3 rounded-lg border border-ink/5 bg-ink/[0.03] px-3 py-2"
              >
                <div className="w-8 text-xs font-semibold tabular-nums text-ink/40">
                  {m.n.toString().padStart(2, "0")}
                </div>
                <div className="flex-1 text-sm text-ink/60">{m.label}</div>
                <div className="text-sm text-ink/70 tabular-nums">
                  {metadataValue(m.n) || "—"}
                </div>
              </div>
            );
          }
          const entry = session!.measurements[m.n] ?? { value: "", notes: "" };
          return (
            <details
              key={m.n}
              className="rounded-lg border border-ink/10 bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5">
                <div className="w-8 text-xs font-semibold tabular-nums text-ink/40">
                  {m.n.toString().padStart(2, "0")}
                </div>
                <div className="flex-1 truncate text-sm">{m.label}</div>
                <div
                  className={`text-base font-semibold tabular-nums ${
                    entry.value ? "text-ink" : "text-ink/30"
                  }`}
                >
                  {entry.value || "—"}
                </div>
                <Link
                  href={`/session/${session!.id}/m/${m.n}`}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2 text-xs text-ink/50 underline-offset-2 hover:underline"
                >
                  edit
                </Link>
              </summary>
              <div className="grid grid-cols-2 gap-2 border-t border-ink/5 p-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-ink/60">Value (cm)</span>
                  <input
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    value={entry.value}
                    onChange={(e) =>
                      patchMeasurement(m.n, "value", e.target.value.replace(",", "."))
                    }
                    className="w-full min-h-[48px] rounded-lg border border-ink/15 bg-white px-3 text-base tabular-nums focus:border-ink focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-ink/60">Notes</span>
                  <input
                    value={entry.notes}
                    onChange={(e) => patchMeasurement(m.n, "notes", e.target.value)}
                    className="w-full min-h-[48px] rounded-lg border border-ink/15 bg-white px-3 text-base focus:border-ink focus:outline-none"
                  />
                </label>
              </div>
            </details>
          );
        })}
      </section>

      <div className="sticky bottom-0 mt-6 flex gap-3 bg-paper/95 pt-3 pb-2 backdrop-blur">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={exportCsv}
          disabled={busy !== ""}
        >
          {busy === "csv" ? "…" : "Export CSV"}
        </Button>
        <Button
          variant="primary"
          className="flex-[1.4]"
          onClick={exportPdf}
          disabled={busy !== ""}
        >
          {busy === "pdf" ? "…" : "Export PDF"}
        </Button>
      </div>
    </main>
  );
}
