import { MEASUREMENT_NUMBERS } from "./measurements";
import type { Session } from "./types";

function escape(field: string | number | undefined | null): string {
  const s = field == null ? "" : String(field);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function buildCsv(session: Session): string {
  const headers = [
    "id",
    "createdAt",
    "clientName",
    "measurementDate",
    "clothesWorn",
    "braSize",
    "heelHeightDuringMeasurement",
    "heelHeightForEvent",
    "comments",
  ];
  for (const n of MEASUREMENT_NUMBERS) {
    headers.push(`m${pad2(n)}_value`, `m${pad2(n)}_notes`);
  }

  const row = [
    session.id,
    session.createdAt,
    session.clientName,
    session.measurementDate,
    session.clothesWorn,
    session.braSize,
    session.heelHeightDuringMeasurement,
    session.heelHeightForEvent,
    session.comments,
  ];
  for (const n of MEASUREMENT_NUMBERS) {
    const m = session.measurements[n];
    row.push(m?.value ?? "", m?.notes ?? "");
  }

  return [headers.map(escape).join(","), row.map(escape).join(",")].join("\r\n");
}
