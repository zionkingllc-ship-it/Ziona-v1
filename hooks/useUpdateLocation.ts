import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileLocation } from "@/services/graphQL/mutation/actions/updateProfile";
import * as Location from "expo-location";

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geocode = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      if (geocode.length > 0) {
        const addr = geocode[0];
        const parts = [addr.city, addr.region, addr.country].filter(Boolean);
        return updateProfileLocation(parts.join(", "));
      }

      throw new Error("Could not determine location");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
