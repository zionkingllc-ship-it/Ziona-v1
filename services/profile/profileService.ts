import { graphqlRequest } from "@/services/graphQL/graphqlClient";

/* =========================
   UPDATE PROFILE
========================= */

export async function updateProfile(input: {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
}) {
  const query = `
mutation UpdateProfile(
  $bio: String
  $fullName: String
  $avatarUrl: String
  $location: String
  
) {
  updateProfile(
    bio: $bio
    fullName: $fullName
    avatarUrl: $avatarUrl
    location: $location
  ) {
    success
    profile {
      id
      bio
      fullName
      username
      avatarUrl
      location
    }
    error { code message }
  }
}
  `;

  const data = await graphqlRequest(query, input); // ✅ FIXED

  const res = data?.updateProfile;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to update profile");
  }

  return res.profile; // ✅ FIXED
}

/* =========================
   UPDATE AVATAR
========================= */

export async function updateAvatar(file: { uri: string }) {
  const query = `
mutation UpdateProfile( 
  $avatarUrl: String 
) {
  updateProfile( 
    avatarUrl: $avatarUrl 
  ) {
    success
    profile { 
      avatarUrl 
    }
    error { code message }
  }
}
  `;

  const data = await graphqlRequest(query, {
    avatarUrl: file.uri, 
  });

  const res = data?.updateProfile; 

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to update avatar");
  }

  return res.profile?.avatarUrl ?? null; 
}