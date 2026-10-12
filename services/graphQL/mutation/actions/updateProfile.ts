import { graphqlRequest } from "../../graphqlClient";
import { AppError } from "@/utils/error";

export async function updateProfileLocation(location: string) {
  const query = `
    mutation UpdateProfile($location: String) {
      updateProfile(location: $location) {
        success
        error { code message }
      }
    }
  `;

  const data = await graphqlRequest(query, { location });

  const res = data?.updateProfile;

  if (!res?.success) {
    throw new AppError(res?.error?.message || "Update failed", { code: res?.error?.code });
  }

  return res;
}
