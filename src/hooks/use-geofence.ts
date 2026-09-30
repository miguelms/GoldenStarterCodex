"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { distanceMeters as calculateHaversineDistance, type Coordinate } from "@/domain/geofence";

export interface GeofenceCurrentPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface UseGeofenceOptions {
  targetLatitude: number;
  targetLongitude: number;
  thresholdMeters?: number;
  manualPosition?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
  } | null;
  watch?: boolean;
  maximumAccuracyMeters?: number;
  geolocationOptions?: PositionOptions;
}

export interface UseGeofenceResult {
  isInsideGeofence: boolean;
  distanceMeters: number | null;
  currentPosition: GeofenceCurrentPosition | null;
  error: string | null;
  isLoading: boolean;
  isAccuracyLow: boolean;
  refreshPosition: () => void;
}

export function useGeofence(options: UseGeofenceOptions): UseGeofenceResult {
  const {
    targetLatitude,
    targetLongitude,
    thresholdMeters = 50,
    manualPosition = null,
    watch = false,
    maximumAccuracyMeters = 100,
    geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    },
  } = options;

  const [geoPosition, setGeoPosition] = useState<GeofenceCurrentPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!manualPosition);
  const watchIdRef = useRef<number | null>(null);

  const isSupported =
    typeof window !== "undefined" && typeof navigator !== "undefined" && "geolocation" in navigator;

  const currentPosition: GeofenceCurrentPosition | null = useMemo(() => {
    if (manualPosition) {
      return {
        latitude: manualPosition.latitude,
        longitude: manualPosition.longitude,
        accuracy: manualPosition.accuracy ?? 10,
        timestamp: manualPosition.timestamp ?? 0,
      };
    }
    return geoPosition;
  }, [manualPosition, geoPosition]);

  const effectiveError = useMemo(() => {
    if (manualPosition) return null;
    if (!isSupported) {
      return "Geolocalización no soportada por el navegador o entorno actual.";
    }
    return error;
  }, [manualPosition, isSupported, error]);

  const effectiveLoading = manualPosition ? false : !isSupported ? false : isLoading;

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setGeoPosition({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    });
    setError(null);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let message: string;
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message =
          "Permiso de geolocalización denegado. Active el acceso a la ubicación en su navegador.";
        break;
      case err.POSITION_UNAVAILABLE:
        message = "Información de ubicación no disponible. Verifique su señal GPS o conexión.";
        break;
      case err.TIMEOUT:
        message = "Tiempo de espera de geolocalización agotado. Intente de nuevo.";
        break;
      default:
        message = err.message || "Error al obtener la posición geográfica.";
    }
    setError(message);
    setIsLoading(false);
  }, []);

  const refreshPosition = useCallback(() => {
    if (manualPosition) {
      // Manual position is static or externally controlled
      return;
    }

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setError("Geolocalización no soportada por el navegador o entorno actual.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geolocationOptions);
  }, [manualPosition, handleSuccess, handleError, geolocationOptions]);

  // Initial fetch and optional watch
  useEffect(() => {
    if (manualPosition) {
      return;
    }

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geolocationOptions,
      );
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geolocationOptions);
    }

    return () => {
      if (
        watchIdRef.current !== null &&
        typeof window !== "undefined" &&
        "geolocation" in navigator
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [manualPosition, watch, handleSuccess, handleError, geolocationOptions]);

  // Precise Haversine distance computation
  const distanceMeters = useMemo<number | null>(() => {
    if (!currentPosition) return null;

    const from: Coordinate = {
      latitude: currentPosition.latitude,
      longitude: currentPosition.longitude,
    };
    const to: Coordinate = {
      latitude: targetLatitude,
      longitude: targetLongitude,
    };

    const dist = calculateHaversineDistance(from, to);
    return Math.round(dist * 10) / 10; // 1 decimal place precision
  }, [currentPosition, targetLatitude, targetLongitude]);

  const isAccuracyLow = useMemo<boolean>(() => {
    if (!currentPosition) return false;
    return currentPosition.accuracy > maximumAccuracyMeters;
  }, [currentPosition, maximumAccuracyMeters]);

  const isInsideGeofence = useMemo<boolean>(() => {
    if (distanceMeters === null) return false;
    return distanceMeters <= thresholdMeters;
  }, [distanceMeters, thresholdMeters]);

  return {
    isInsideGeofence,
    distanceMeters,
    currentPosition,
    error: effectiveError,
    isLoading: effectiveLoading,
    isAccuracyLow,
    refreshPosition,
  };
}
