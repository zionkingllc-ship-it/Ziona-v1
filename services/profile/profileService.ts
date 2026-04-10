import { graphqlRequest } from "@/services/graphQL/graphqlClient";

/* =========================
   UPDATE PROFILE
========================= */

export async function updateProfile(input: {
  fullName?: string;
  bio?: string;
  username?: string;
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
        }
        error { message }
      }
    }
  `;

  const data = await graphqlRequest(query, { input });

  const res = data?.updateProfile;
  console.log("AVATAR URL", res.avatar)
   console.log("USER", res.user)
    console.log("USER ID", res.userId)
    

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to update profile");
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
        error { message }
      }
    }
  `;

  const data = await graphqlRequest(query, { file });

  const res = data?.updateAvatar;
  console.log("AVATAR URL", res)
  console.log("UPDATE AVATAR RESPONSE:", data);

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to update avatar");
  }


  return res.avatarUrl;
}