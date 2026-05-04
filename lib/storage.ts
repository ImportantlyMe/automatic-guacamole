import type { Session } from "./types";

const KEY = "dj-sessions";

function readAll(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Session[];
  } catch {
    return [];
  }
}

function writeAll(sessions: Session[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function listSessions(): Session[] {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getSession(id: string): Session | undefined {
  return readAll().find((s) => s.id === id);
}

export function saveSession(session: Session): void {
  const all = readAll();
  const idx = all.findIndex((s) => s.id === session.id);
  const next = { ...session, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = next;
  } else {
    all.push(next);
  }
  writeAll(all);
}

export function deleteSession(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
}

export function newSession(): Session {
  const now = new Date();
  const iso = now.toISOString();
  const today = iso.slice(0, 10);
  return {
    id: cryptoRandomId(),
    createdAt: iso,
    updatedAt: iso,
    clientName: "",
    measurementDate: today,
    clothesWorn: "",
    braSize: "",
    heelHeightDuringMeasurement: "",
    heelHeightForEvent: "",
    comments: "",
    measurements: {},
  };
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
