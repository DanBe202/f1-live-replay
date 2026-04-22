export type CarPath = {
  "driver_number": number,
  "location": CarLocation[],
}

export type CarLocation = {
  "date": Date,
  "session_key": number,
  "z": number,
  "x": number,
  "meeting_key": number,
  "driver_number": number,
  "y": number
}
