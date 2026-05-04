"use client";

import { useEffect, useRef } from "react";
import { saveSession } from "./storage";
import type { Session } from "./types";

export function useDebouncedSave(session: Session | null, delayMs = 300): void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveSession(session);
    }, delayMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [session, delayMs]);
}
