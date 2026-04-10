import { graphqlRequest } from "../graphqlClient";

/* =========================
   UPDATE PROFILE
========================= */

export async function updateProfile(input: {
  fullName?: string;
  bio?: string;
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
      avatarUrl
      location
    }
    error { code message }
  }
}`;

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
  const query =  `
mutation UpdateProfile(  
  $avatarUrl: String
  $location: String
) {
  updateProfile( 
    avatarUrl: $avatarUrl
    location: $location
  ) {
    success
    profile { 
      avatarUrl 
    }
    error { code message }
  }
}`;

  const data = await graphqlRequest(query, { file });

  const res = data?.updateAvatar;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Avatar update failed");
  }

  return res.avatarUrl;
}