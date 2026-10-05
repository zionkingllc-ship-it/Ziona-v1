import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { AppError } from "@/utils/error";

const SUBMIT_CONTACT = `
  mutation SubmitContact($brand: ContactBrand!, $email: String!, $message: String!, $name: String!) {
    submitContact(brand: $brand, email: $email, message: $message, name: $name) {
      success
      ticketId
      error {
        code
        message
      }
    }
  }
`;

export async function submitContact(params: {
  brand: "ZIONA" | "ZIONKING";
  email: string;
  message: string;
  name: string;
}) {
  const data = await graphqlRequest(SUBMIT_CONTACT, params);
  const res = data?.submitContact;
  if (!res?.success) {
    throw new AppError(res?.error?.message || "Failed to send message", { code: res?.error?.code });
  }
  return res as { success: boolean; ticketId?: string };
}
