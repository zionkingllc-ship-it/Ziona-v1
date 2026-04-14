import { graphqlRequest } from "../../graphqlClient";

/* CREATE BOOKMARK FOLDER */
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

/* DELETE BOOKMARK FOLDER */
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

/* BULK REMOVE BOOKMARKS */
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
