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

const SEND_HELP_MESSAGE = `
  mutation SendHelpMessage($contactId: String!, $message: String!, $clientMessageId: String!) {
    sendHelpMessage(contactId: $contactId, message: $message, clientMessageId: $clientMessageId) {
      success
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

export function createClientMessageId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function sendHelpMessage(params: {
  contactId: string;
  message: string;
  clientMessageId: string;
}) {
  const data = await graphqlRequest(SEND_HELP_MESSAGE, {
    contactId: params.contactId,
    message: params.message,
    clientMessageId: params.clientMessageId,
  });
  const res = data?.sendHelpMessage;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to send message");
  }
  return res as { success: boolean };
}

export async function resolveHelpConversation(contactId: string) {
  const data = await graphqlRequest(RESOLVE_HELP_CONVERSATION, { contactId });
  const res = data?.resolveHelpConversation;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to resolve conversation");
  }
  return res as { success: boolean };
}
