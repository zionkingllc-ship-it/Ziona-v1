import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileLocation } from "@/services/graphQL/mutation/actions/updateProfile";
import { storage } from "@/utils/storage";

export function useLocationFirstTime() {
  const queryClient = useQueryClient();
  const [isLocationSetup, setIsLocationSetup] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const updateLocationMutation = useMutation({
    mutationFn: async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
      const geocode = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      if (geocode.length > 0) {
        const addr = geocode[0];
        const parts = [addr.region, addr.country].filter(Boolean);
        const locationString = parts.join(", ");
        await storage.set("locationSetupDone", true);
        const result = await updateProfileLocation(locationString);
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        return result;
      }

      throw new Error("Could not determine location");
    },
    onSuccess: () => {
      setIsLocationSetup(true);
      setPermissionDenied(false);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error) => {
      if (error.message === "Location permission denied") {
        setPermissionDenied(true);
      }
    },
  });

  const checkAndRequest = useCallback(async () => {
    const alreadySetup = await storage.get("locationSetupDone");
    if (alreadySetup) {
      setIsLocationSetup(true);
      setIsChecking(false);
      return;
    }

    const { status } = await Location.getForegroundPermissionsAsync();

    if (status === "granted") {
      setIsChecking(false);
      updateLocationMutation.mutate();
      return;
    }

    if (status === "denied") {
      setPermissionDenied(true);
      setIsChecking(false);
      return;
    }

    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
    if (newStatus === "granted") {
      updateLocationMutation.mutate();
    } else {
      setPermissionDenied(true);
    }
    setIsChecking(false);
  }, [updateLocationMutation]);

  const requestLocation = useCallback(() => {
    setPermissionDenied(false);
    setIsChecking(true);
    checkAndRequest();
  }, [checkAndRequest]);

  useEffect(() => {
    checkAndRequest();
  }, [checkAndRequest]);

  return {
    isLocationSetup,
    isChecking,
    permissionDenied,
    requestLocation,
    isUpdatingLocation: updateLocationMutation.isPending,
  };
}