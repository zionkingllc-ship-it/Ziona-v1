import { graphqlRequest } from "../../graphqlClient";

export interface BookmarkFolder {
  id: string;
  name: string;
  createdAt?: string;
  savedCount: number;
  cover?: string;
  thumbnailUrl?: string;
  posts?: BookmarkPost[];
}

export interface BookmarkPost {
  id: string;
  type: string;
  media?: {
    items: Array<{
      url: string;
      thumbnailUrl: string;
    }>;
  };
  text?: string;
  scripture?: {
    text: string;
  };
}

export async function getBookmarkFolders(): Promise<BookmarkFolder[]> {
  const query = `
    query GetBookmarkFolders {
      bookmarkFolders {
        id
        name
        savedCount
        createdAt
        thumbnailUrl
      }
    }
  `;

  console.log("🔍 [bookmarkFolders] Fetching bookmark folders...");
  const data = await graphqlRequest(query, {});
  console.log("🔍 [bookmarkFolders] Raw API response:", JSON.stringify(data, null, 2));

  const folders = data?.bookmarkFolders;
  console.log("🔍 [bookmarkFolders] Extracted folders:", JSON.stringify(folders, null, 2));

  if (!folders) {
    console.error("🔍 [bookmarkFolders] No folders in response, throwing error");
    throw new Error("Failed to fetch bookmark folders");
  }

  console.log(`🔍 [bookmarkFolders] Found ${folders.length} folders`);
  return folders;
}

export async function createBookmarkFolder(name: string) {
  const query = `
    mutation CreateFolder($name: String!) {
      createBookmarkFolder(name: $name) {
        success
        message
        errorCode
        folder {
          id
          name
          savedCount
          createdAt
          thumbnailUrl
        }
        error {
          code
          message
          details
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { name });
  return data?.createBookmarkFolder;
}

export async function deleteBookmarkFolder(folderId: string) {
  const query = `
    mutation DeleteBookmarkFolder($folderId: String!) {
      deleteBookmarkFolder(folderId: $folderId) {
        success
        errorCode
        message
        error {
          code
          message
          details
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { folderId });

  const res = data?.deleteBookmarkFolder;
  if (!res?.success) {
    console.error("🔍 [deleteBookmarkFolder] Backend error:", res?.errorCode, res?.message, res?.error);
    throw new Error(res?.message || res?.error?.message || "Failed to delete folder");
  }

  return res;
}

export async function bulkRemoveBookmarks(postIds: string[]) {
  const query = `
    mutation BulkRemoveBookmarks($postIds: [String!]!) {
      bulkRemoveBookmarks(postIds: $postIds) {
        success
      }
    }
  `;

  const data = await graphqlRequest(query, { postIds });

  const res = data?.bulkRemoveBookmarks;
  if (!res?.success) {
    throw new Error("Failed to remove bookmarks");
  }

  return res;
}
