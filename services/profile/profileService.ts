import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import {
  requestMediaUpload,
  uploadFileToStorage,
  extractPublicUrl,
} from "@/services/graphQL/mutation/media/mediaUpload";
import { cleanAvatarUrl } from "@/services/utils/cleanAvatarUrl";
import * as FileSystem from "expo-file-system/legacy";

/* =========================
   UPDATE PROFILE
========================= */

export async function updateProfile(input: {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
}) {
  const cleanedAvatarUrl = cleanAvatarUrl(input.avatarUrl);

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

  const data = await graphqlRequest(query, { ...input, avatarUrl: cleanedAvatarUrl });

  const res = data?.updateProfile;

  if (!res?.success) {
    const error = res?.error;
    if (error?.code === "VALIDATION_ERROR" || error?.code === "RATE_LIMIT_EXCEEDED") {
      const dateMatch = error?.message?.match(/Next change on ([\w\s\d,]+)\./);
      throw Object.assign(new Error(error?.message || "Failed to update profile"), {
        rateLimitDate: dateMatch ? dateMatch[1] : null,
      });
    }
    throw new Error(res?.error?.message || "Failed to update profile");
  }

  return res.profile;
}

/* =========================
   UPDATE USERNAME
========================= */

export type UpdateUsernameResponse = {
  success: boolean;
  username?: string;
  message?: string;
  errorCode?: string;
};

export async function updateUsername(username: string): Promise<UpdateUsernameResponse> {
  const mutation = `
    mutation ChangeMyUsername($username: String!) {
      updateUsername(username: $username) {
        success
        username
        message
        errorCode
      }
    }
  `;

  console.log("Updating username:", username);
  const data = await graphqlRequest(mutation, { username });
  console.log("Update username response:", data);

  const res = data?.updateUsername;
  
  console.log("Result:", res);

  if (!res?.success) {
    throw new Error(res?.message || "Failed to update username");
  }

  return res;
}

/* =========================
   UPDATE AVATAR
========================= */

export async function updateAvatar(file: { uri: string }) {
  const fileName = file.uri?.split("/").pop() || `avatar-${Date.now()}`;
  const fileType = "image/jpeg";
  const fileInfo = await FileSystem.getInfoAsync(file.uri);

  if (!fileInfo.exists) throw new Error("Avatar file does not exist");

  const upload = await requestMediaUpload(fileName, fileType, fileInfo.size || 0);
  console.log("Upload URL from backend:", upload.uploadUrl);
  await uploadFileToStorage(upload.uploadUrl, file.uri, fileType);
  const avatarUrl = cleanAvatarUrl(extractPublicUrl(upload.uploadUrl));
  console.log("Public avatar URL:", avatarUrl);

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

  const data = await graphqlRequest(query, { avatarUrl });

  const res = data?.updateProfile; 

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to update avatar");
  }

  return cleanAvatarUrl(res.profile?.avatarUrl) ?? null; 
}