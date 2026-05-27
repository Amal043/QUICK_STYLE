/**
 * Precise Geolocation Utility using Geolocation API.
 * Uses navigator.geolocation.watchPosition with enableHighAccuracy: true.
 * Allows GPS to warm up for a few seconds, tracking accuracy coordinates.
 * Resolves immediately if accuracy reaches target threshold (<= 20 meters),
 * or falls back to the most accurate coordinates collected after the warmup period.
 */
export const getPreciseLocation = (
  onSuccess: (coords: { lat: number; lng: number }) => void,
  onError: (error: GeolocationPositionError) => void,
  onProgress?: (accuracy: number) => void
) => {
  if (!navigator.geolocation) {
    const err = new Error("Geolocation is not supported by this browser.") as any;
    err.code = 0;
    onError(err);
    return () => {};
  }

  let bestPosition: GeolocationPosition | null = null;
  let watchId: number | null = null;

  // Let the GPS warm up for 6 seconds, then resolve with the best position found
  const timeoutId = setTimeout(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    if (bestPosition) {
      console.log(`[GEOLOCATION] GPS Warmed up. Best position accuracy: ${bestPosition.coords.accuracy}m`);
      onSuccess({
        lat: bestPosition.coords.latitude,
        lng: bestPosition.coords.longitude
      });
    } else {
      const err = new Error("Location detection timed out.") as any;
      err.code = 3; // GeolocationPositionError.TIMEOUT
      onError(err);
    }
  }, 6500);

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      console.log(`[GEOLOCATION] Watch position accuracy: ${position.coords.accuracy}m`);
      if (onProgress) {
        onProgress(position.coords.accuracy);
      }

      // Track the best position (lowest accuracy value is more accurate)
      if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
        bestPosition = position;
      }

      // If accuracy is within 20 meters, clear watch and resolve immediately
      if (position.coords.accuracy <= 20) {
        clearTimeout(timeoutId);
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        console.log(`[GEOLOCATION] Target accuracy reached: ${position.coords.accuracy}m`);
        onSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }
    },
    (error) => {
      // If user denied access, fail immediately
      if (error.code === error.PERMISSION_DENIED) {
        clearTimeout(timeoutId);
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        onError(error);
      } else {
        console.warn("[GEOLOCATION] Warmup position update failed:", error.message);
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );

  return () => {
    clearTimeout(timeoutId);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  };
};
