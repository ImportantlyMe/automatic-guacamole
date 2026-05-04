import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { MEASUREMENTS } from "./measurements";
import type { Session } from "./types";

const PAGE_WIDTH = 595.28; // A4 portrait
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 36;
const MARGIN_Y = 40;

type Ctx = {
  pdf: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
};

function newPage(ctx: Ctx): void {
  ctx.page = ctx.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.y = PAGE_HEIGHT - MARGIN_Y;
}

function ensureSpace(ctx: Ctx, needed: number): void {
  if (ctx.y - needed < MARGIN_Y) {
    newPage(ctx);
  }
}

function drawText(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont = ctx.font
): void {
  ctx.page.drawText(text, { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const probe = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(probe, size) <= maxWidth) {
      line = probe;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function sanitize(text: string): string {
  // pdf-lib's standard fonts use WinAnsi; replace anything outside.
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, "-")
    .replace(/…/g, "...");
}

export async function buildPdf(session: Session): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ctx: Ctx = {
    pdf,
    page: pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    font,
    bold,
    y: PAGE_HEIGHT - MARGIN_Y,
  };

  // Header
  drawText(ctx, "Measurement Sheet", MARGIN_X, ctx.y, 18, bold);
  ctx.y -= 22;
  const sub = `${session.clientName || "(no name)"}  -  ${session.measurementDate}`;
  drawText(ctx, sanitize(sub), MARGIN_X, ctx.y, 11, font);
  ctx.y -= 18;

  // Metadata block (two columns)
  const colGap = 18;
  const colWidth = (PAGE_WIDTH - MARGIN_X * 2 - colGap) / 2;
  const meta: Array<[string, string]> = [
    ["Clothes worn", session.clothesWorn],
    ["Bra size", session.braSize],
    ["Heels during", session.heelHeightDuringMeasurement],
    ["Heels for event", session.heelHeightForEvent],
  ];

  const metaSize = 10;
  const labelSize = 9;
  const lineGap = 4;

  let leftY = ctx.y;
  let rightY = ctx.y;
  for (let i = 0; i < meta.length; i++) {
    const [label, val] = meta[i];
    const isLeft = i % 2 === 0;
    const x = isLeft ? MARGIN_X : MARGIN_X + colWidth + colGap;
    const cy = isLeft ? leftY : rightY;
    drawText(ctx, label.toUpperCase(), x, cy, labelSize, bold);
    const lines = wrap(sanitize(val || "-"), font, metaSize, colWidth);
    let y = cy - 12;
    for (const ln of lines) {
      drawText(ctx, ln, x, y, metaSize, font);
      y -= metaSize + lineGap;
    }
    if (isLeft) leftY = y - 4;
    else rightY = y - 4;
  }
  ctx.y = Math.min(leftY, rightY) - 4;

  if (session.comments) {
    drawText(ctx, "COMMENTS", MARGIN_X, ctx.y, labelSize, bold);
    ctx.y -= 12;
    const lines = wrap(
      sanitize(session.comments),
      font,
      metaSize,
      PAGE_WIDTH - MARGIN_X * 2
    );
    for (const ln of lines) {
      drawText(ctx, ln, MARGIN_X, ctx.y, metaSize, font);
      ctx.y -= metaSize + lineGap;
    }
    ctx.y -= 4;
  }

  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.y },
    end: { x: PAGE_WIDTH - MARGIN_X, y: ctx.y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  ctx.y -= 14;

  // Table header
  const colN = MARGIN_X;
  const colName = MARGIN_X + 26;
  const colValue = PAGE_WIDTH - MARGIN_X - 160;
  const colNotes = PAGE_WIDTH - MARGIN_X - 100;
  const rowSize = 9;
  const rowGap = 6;

  drawText(ctx, "#", colN, ctx.y, rowSize, bold);
  drawText(ctx, "MEASUREMENT", colName, ctx.y, rowSize, bold);
  drawText(ctx, "VALUE (cm)", colValue, ctx.y, rowSize, bold);
  drawText(ctx, "NOTES", colNotes, ctx.y, rowSize, bold);
  ctx.y -= rowSize + 4;
  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.y + 2 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: ctx.y + 2 },
    thickness: 0.3,
    color: rgb(0.7, 0.7, 0.7),
  });
  ctx.y -= 4;

  for (const m of MEASUREMENTS) {
    let value = "";
    let notes = "";
    if (m.isMetadata) {
      if (m.n === 1) value = session.clothesWorn;
      if (m.n === 2) value = session.braSize;
      if (m.n === 43) value = session.heelHeightDuringMeasurement;
      if (m.n === 44) value = session.heelHeightForEvent;
    } else {
      const entry = session.measurements[m.n];
      value = entry?.value ?? "";
      notes = entry?.notes ?? "";
    }

    const nameLines = wrap(sanitize(m.label), font, rowSize, colValue - colName - 6);
    const notesLines = wrap(
      sanitize(notes),
      font,
      rowSize,
      PAGE_WIDTH - MARGIN_X - colNotes
    );
    const rowLines = Math.max(nameLines.length, notesLines.length);
    const rowHeight = rowLines * (rowSize + 2) + rowGap;

    ensureSpace(ctx, rowHeight + 6);

    drawText(ctx, m.n.toString().padStart(2, "0"), colN, ctx.y, rowSize, font);
    for (let i = 0; i < nameLines.length; i++) {
      drawText(ctx, nameLines[i], colName, ctx.y - i * (rowSize + 2), rowSize, font);
    }
    if (value) {
      drawText(ctx, sanitize(value), colValue, ctx.y, rowSize, bold);
    }
    for (let i = 0; i < notesLines.length; i++) {
      drawText(ctx, notesLines[i], colNotes, ctx.y - i * (rowSize + 2), rowSize, font);
    }
    ctx.y -= rowHeight;
    ctx.page.drawLine({
      start: { x: MARGIN_X, y: ctx.y + 2 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: ctx.y + 2 },
      thickness: 0.2,
      color: rgb(0.85, 0.85, 0.85),
    });
    ctx.y -= 2;
  }

  return pdf.save();
}
