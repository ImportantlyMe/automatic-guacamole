"use client";

import Link from "next/link";
import { MEASUREMENT_NUMBERS } from "@/lib/measurements";
import type { Session } from "@/lib/types";

type Props = {
  sessionId: string;
  current: number;
  session: Session;
};

export function ProgressDots({ sessionId, current, session }: Props) {
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {MEASUREMENT_NUMBERS.map((n) => {
        const filled = !!session.measurements[n]?.value?.trim();
        const isCurrent = n === current;
        return (
          <Link
            key={n}
            href={`/session/${sessionId}/m/${n}`}
            aria-label={`Go to measurement ${n}`}
            className={`flex h-9 items-center justify-center rounded-md text-[11px] font-semibold tracking-tight transition-colors ${
              isCurrent
                ? "bg-ink text-paper"
                : filled
                ? "bg-ink/15 text-ink"
                : "bg-ink/5 text-ink/40"
            }`}
          >
            {n}
          </Link>
        );
      })}
    </div>
  );
}
