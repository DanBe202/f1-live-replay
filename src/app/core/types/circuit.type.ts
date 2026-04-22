export type Coordinates = {
  x: number;
  y: number;
}

export type TrackMarker = {
  angle: number;
  length: number;
  number: number;
  trackPosition: Coordinates;
}

export type CandidateLap = {
  driverNumber: string;
  lapNumber: number;
  lapStartDate: string;
  lapStartSessionTime: number;
  lapTime: number;
  session: string;
  sessionStartTime: number;
}

export type CircuitData = {
  corners: TrackMarker[];
  marshalLights: TrackMarker[];
  marshalSectors: TrackMarker[];
  candidateLap: CandidateLap;
  circuitKey: number;
  circuitName: string;
  countryIocCode: string;
  countryKey: number;
  countryName: string;
  location: string;
  meetingKey: string;
  meetingName: string;
  meetingOfficialName: string | null;
  raceDate: string;
  rotation: number;
  round: number;
  trackPositionTime: number[];
  x: number[];
  y: number[];
  year: number;
}
