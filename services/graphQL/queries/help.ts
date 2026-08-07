import { graphqlRequest } from "@/services/graphQL/graphqlClient";

export type HelpMessage = {
  id: string;
  message: string;
  senderName: string;
  senderType: string;
  sentAt: string;
};

export type HelpConversation = {
  id: string;
  status: string;
  messages: HelpMessage[];
  repliedAt: string | null;
  updatedAt?: string | null;
  lastMessageAt?: string | null;
};

export async function getHelpConversation(
  contactId: string
): Promise<HelpConversation | null> {
  const query = `
    query GetHelpConversation($contactId: String!) {
      helpConversation(contactId: $contactId) {
        id
        status
        repliedAt
        messages {
          id
          message
          senderName
          senderType
          sentAt
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { contactId });
  return data?.helpConversation ?? null;
}

export async function fetchMyHelpConversations(
  status = ""
): Promise<HelpConversation[]> {
  const query = `
    query MyHelpConversations($status: String!) {
      myHelpConversations(status: $status) {
        id
        status
        repliedAt
        updatedAt
        lastMessageAt
        messages {
          id
          message
          senderName
          senderType
          sentAt
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { status });
  return data?.myHelpConversations ?? [];
}
