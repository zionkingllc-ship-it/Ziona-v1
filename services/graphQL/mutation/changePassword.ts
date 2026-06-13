import { graphqlRequest } from "@/services/graphQL/graphqlClient";

const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($currentPassword: String!, $newPassword: String!, $signOutOtherDevices: Boolean) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword, signOutOtherDevices: $signOutOtherDevices) {
      success
      message
      errorCode
      signedOutDevices
      error {
        code
        message
      }
    }
  }
`;

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  signOutOtherDevices?: boolean,
): Promise<void> {
  const data = await graphqlRequest(CHANGE_PASSWORD_MUTATION, {
    currentPassword,
    newPassword,
    signOutOtherDevices: signOutOtherDevices ?? true,
  });

  const result = data?.changePassword;

  if (!result?.success) {
    const errMsg = result?.error?.message || result?.message || "Failed to change password";
    const errorCode = result?.errorCode;
    throw new Error(errorCode ? `${errorCode}: ${errMsg}` : errMsg);
  }
}
