export type MeasurementEntry = {
  value: string;
  notes: string;
};

export type Session = {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  measurementDate: string;
  clothesWorn: string;
  braSize: string;
  heelHeightDuringMeasurement: string;
  heelHeightForEvent: string;
  comments: string;
  measurements: Record<number, MeasurementEntry>;
};
