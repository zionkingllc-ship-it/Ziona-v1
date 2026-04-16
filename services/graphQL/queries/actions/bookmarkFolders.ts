import { graphqlRequest } from "../../graphqlClient";

export interface BookmarkFolder {
  id: string;
  name: string;
  createdAt?: string;
  postCount?: number;
  savedCount: number;
  cover?: string;
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
      }
    }
  `;

  const data = await graphqlRequest(query, {});

  const folders = data?.bookmarkFolders;
  if (!folders) {
    throw new Error("Failed to fetch bookmark folders");
  }

  return folders;
}

export async function createBookmarkFolder(name: string) {
  const query = `
    mutation CreateBookmarkFolder($name: String!) {
      createBookmarkFolder(name: $name) {
        id
        name
        createdAt
        postCount
      }
    }
  `;

  const data = await graphqlRequest(query, { name });

  const folder = data?.createBookmarkFolder;
  if (!folder) {
    throw new Error("Failed to create folder");
  }

  return folder;
}

export async function deleteBookmarkFolder(folderId: string) {
  const query = `
    mutation DeleteBookmarkFolder($folderId: String!) {
      deleteBookmarkFolder(folderId: $folderId) {
        success
      }
    }
  `;

  const data = await graphqlRequest(query, { folderId });

  const res = data?.deleteBookmarkFolder;
  if (!res?.success) {
    throw new Error("Failed to delete folder");
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
