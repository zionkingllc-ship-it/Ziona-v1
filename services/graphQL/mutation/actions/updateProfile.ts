import { graphqlRequest } from "../../graphqlClient";

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
    throw new Error(res?.error?.message || "Update failed");
  }

  return res;
}
