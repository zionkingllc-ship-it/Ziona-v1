import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { AppError } from "@/utils/error";

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
      contact {
        id
        status
      }
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
    throw new AppError(res?.error?.message || "Failed to send message", { code: res?.error?.code });
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
    throw new AppError(res?.error?.message || "Failed to send message", { code: res?.error?.code });
  }
  return res as { success: boolean };
}

const RESOLVED_HELP_STATUSES = new Set([
  "RESOLVED",
  "CLOSED",
  "COMPLETED",
  "DONE",
  "ARCHIVED",
]);

export async function resolveHelpConversation(contactId: string) {
  const data = await graphqlRequest(RESOLVE_HELP_CONVERSATION, { contactId });
  const res = data?.resolveHelpConversation;
  if (!res?.success) {
    throw new AppError(res?.error?.message || "Failed to resolve conversation", { code: res?.error?.code });
  }

  const status = (res?.contact?.status || "").trim().toUpperCase();
  if (status && !RESOLVED_HELP_STATUSES.has(status)) {
    console.warn(`[help] resolve returned unrecognized status: ${status}`);
  }

  return res as { success: boolean; contact?: { id: string; status: string } };
}
