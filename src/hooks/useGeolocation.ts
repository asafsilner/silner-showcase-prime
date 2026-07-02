import { useCallback, useEffect, useRef, useState } from "react";

export type GeolocationStatus = "idle" | "requesting" | "active" | "denied" | "unsupported" | "error";

interface GeolocationState {
  status: GeolocationStatus;
  position: [number, number] | null;
  accuracy: number | null;
  error: string | null;
}

/**
 * Wraps navigator.geolocation.watchPosition. Tracking only starts once
 * `start()` is called from a user gesture, which keeps the permission
 * prompt (and, on iOS, the speech synthesis unlock) tied to a tap.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    position: null,
    accuracy: null,
    error: null,
  });
  const watchId = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState((s) => ({ ...s, status: "unsupported" }));
      return;
    }
    if (watchId.current !== null) return;

    setState((s) => ({ ...s, status: "requesting" }));

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          status: "active",
          position: [pos.coords.latitude, pos.coords.longitude],
          accuracy: pos.coords.accuracy,
          error: null,
        });
      },
      (err) => {
        setState((s) => ({
          ...s,
          status: err.code === err.PERMISSION_DENIED ? "denied" : "error",
          error: err.message,
        }));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }, []);

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setState((s) => ({ ...s, status: "idle" }));
  }, []);

  useEffect(() => stop, [stop]);

  return { ...state, start, stop };
}
