import { graphqlRequest } from "../../graphqlClient";

/* =========================
   UPDATE PROFILE
========================= */

export async function updateProfile(input: {
  fullName?: string;
  bio?: string;
  location?: string;
}) {
  const query = `
    mutation UpdateProfile($input: UpdateProfileInput!) {
      updateProfile(input: $input) {
        success
        user {
          id
          username
          fullName
          bio
          avatarUrl
          location
        }
        error { code message }
      }
    }
  `;

  const data = await graphqlRequest(query, { input });

  const res = data?.updateProfile;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Update failed");
  }

  return res.user;
}

/* =========================
   UPDATE AVATAR
========================= */

export async function updateAvatar(file: any) {
  const query = `
    mutation UpdateAvatar($file: Upload!) {
      updateAvatar(file: $file) {
        success
        avatarUrl
        error { code message }
      }
    }
  `;

  const data = await graphqlRequest(query, { file });

  const res = data?.updateAvatar;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Avatar update failed");
  }

  return res.avatarUrl;
}
