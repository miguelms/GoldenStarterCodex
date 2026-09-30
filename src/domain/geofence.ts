export type Coordinate = { latitude: number; longitude: number };

export type GeofenceDecision =
  | { status: "allowed"; distanceMeters: number; radiusMeters: number }
  | { status: "outside_radius"; distanceMeters: number; radiusMeters: number }
  | { status: "low_accuracy"; accuracyMeters: number; maximumAccuracyMeters: number };

const EARTH_RADIUS_METERS = 6_371_000;

function radians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceMeters(from: Coordinate, to: Coordinate) {
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const fromLatitude = radians(from.latitude);
  const toLatitude = radians(to.latitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function decideGeofence(
  device: Coordinate,
  destination: Coordinate,
  accuracyMeters: number,
  radiusMeters: number,
  maximumAccuracyMeters = 100,
): GeofenceDecision {
  if (!Number.isFinite(accuracyMeters) || accuracyMeters > maximumAccuracyMeters) {
    return { status: "low_accuracy", accuracyMeters, maximumAccuracyMeters };
  }

  const distance = distanceMeters(device, destination);
  return distance <= radiusMeters
    ? { status: "allowed", distanceMeters: distance, radiusMeters }
    : { status: "outside_radius", distanceMeters: distance, radiusMeters };
}
