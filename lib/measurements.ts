// Measurement labels keyed by their canonical number (1–50).
// Numbers 1, 2, 43, 44 are session metadata; the rest are entry screens.

export type MeasurementDef = {
  n: number;
  label: string;
  isMetadata: boolean;
};

export const MEASUREMENTS: MeasurementDef[] = [
  { n: 1, label: "Clothes worn during measuring", isMetadata: true },
  { n: 2, label: "Bra size", isMetadata: true },
  { n: 3, label: "Mid neck", isMetadata: false },
  { n: 4, label: "Base of neck", isMetadata: false },
  { n: 5, label: "Above bust", isMetadata: false },
  { n: 6, label: "Bust", isMetadata: false },
  { n: 7, label: "Front bust", isMetadata: false },
  { n: 8, label: "Under bust", isMetadata: false },
  { n: 9, label: "Waist", isMetadata: false },
  { n: 10, label: "High hip 4cm below waist", isMetadata: false },
  { n: 11, label: "Middle hip 10cm below waist", isMetadata: false },
  { n: 12, label: "Hip - widest part of hips", isMetadata: false },
  { n: 13, label: "Waist to hip on side", isMetadata: false },
  { n: 14, label: "Underarm to waist on side", isMetadata: false },
  { n: 15, label: "Around shoulders - arms at side", isMetadata: false },
  { n: 16, label: "Sleeve to sleeve - front", isMetadata: false },
  { n: 17, label: "CF neck collar bone to CF waist", isMetadata: false },
  { n: 18, label: "CB neck to CF waist", isMetadata: false },
  { n: 19, label: "Shoulder neck point to bust point", isMetadata: false },
  { n: 20, label: "Shoulder neck point to underbust", isMetadata: false },
  { n: 21, label: "Shoulder neck point to front waist", isMetadata: false },
  { n: 22, label: "Shoulder edge to waist at front - straight down", isMetadata: false },
  { n: 23, label: "Bust point to bust point - around neck", isMetadata: false },
  { n: 24, label: "Distance between bust points", isMetadata: false },
  { n: 25, label: "CB neck to CB waist", isMetadata: false },
  { n: 26, label: "Shoulder neck point to waist at back - straight down", isMetadata: false },
  { n: 27, label: "Shoulder edge to waist at back - straight down", isMetadata: false },
  { n: 28, label: "Back width between shoulder edges", isMetadata: false },
  { n: 29, label: "Sleeve to sleeve - back", isMetadata: false },
  { n: 30, label: "Front sleeve point to back sleeve point", isMetadata: false },
  { n: 31, label: "Base of neck to edge of shoulder", isMetadata: false },
  { n: 32, label: "Base of neck to elbow", isMetadata: false },
  { n: 33, label: "Base of neck to wrist", isMetadata: false },
  { n: 34, label: "Armhole", isMetadata: false },
  { n: 35, label: "Upper arm circumference - widest part", isMetadata: false },
  { n: 36, label: "Edge of shoulder to widest part of the arm", isMetadata: false },
  { n: 37, label: "Elbow", isMetadata: false },
  { n: 38, label: "Wrist", isMetadata: false },
  { n: 39, label: "Waist to knee", isMetadata: false },
  { n: 40, label: "Waist to floor - CF", isMetadata: false },
  { n: 41, label: "Waist to floor - on side", isMetadata: false },
  { n: 42, label: "Waist to floor - CB", isMetadata: false },
  { n: 43, label: "Heel height/shoes worn during measurements", isMetadata: true },
  { n: 44, label: "Heel height/shoes to be worn for the event", isMetadata: true },
  { n: 45, label: "Crotch depth", isMetadata: false },
  { n: 46, label: "Inside leg seam (crotch to floor)", isMetadata: false },
  { n: 47, label: "Upper thigh circumference (widest part)", isMetadata: false },
  { n: 48, label: "Knee circumference", isMetadata: false },
  { n: 49, label: "Calf circumference", isMetadata: false },
  { n: 50, label: "Ankle circumference", isMetadata: false },
];

export const MEASUREMENT_NUMBERS: number[] = MEASUREMENTS
  .filter((m) => !m.isMetadata)
  .map((m) => m.n);

export function getMeasurement(n: number): MeasurementDef | undefined {
  return MEASUREMENTS.find((m) => m.n === n);
}

export function getNextMeasurementNumber(current: number): number | null {
  const idx = MEASUREMENT_NUMBERS.indexOf(current);
  if (idx < 0 || idx === MEASUREMENT_NUMBERS.length - 1) return null;
  return MEASUREMENT_NUMBERS[idx + 1];
}

export function getPrevMeasurementNumber(current: number): number | null {
  const idx = MEASUREMENT_NUMBERS.indexOf(current);
  if (idx <= 0) return null;
  return MEASUREMENT_NUMBERS[idx - 1];
}

export function getMeasurementIndex(n: number): number {
  return MEASUREMENT_NUMBERS.indexOf(n);
}
