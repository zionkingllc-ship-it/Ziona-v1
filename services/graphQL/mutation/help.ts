import { graphqlRequest } from "@/services/graphQL/graphqlClient";

const SUBMIT_HELP_MESSAGE = `
  mutation SubmitHelpMessage($message: String!, $email: String, $name: String) {
    submitHelpMessage(message: $message, email: $email, name: $name) {
      success
      contact {
        id
      }
      error {
        code
        message
      }
    }
  }
`;

const RESOLVE_HELP_CONVERSATION = `
  mutation ResolveHelpConversation($contactId: String!) {
    resolveHelpConversation(contactId: $contactId) {
      success
      error {
        code
        message
      }
    }
  }
`;

export async function submitHelpMessage(params: {
  message: string;
  email?: string;
  name?: string;
}) {
  const data = await graphqlRequest(SUBMIT_HELP_MESSAGE, params);
  const res = data?.submitHelpMessage;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to send message");
  }
  return res as { success: boolean; contact?: { id: string } };
}

export async function resolveHelpConversation(contactId: string) {
  const data = await graphqlRequest(RESOLVE_HELP_CONVERSATION, { contactId });
  const res = data?.resolveHelpConversation;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to resolve conversation");
  }
  return res as { success: boolean };
}
