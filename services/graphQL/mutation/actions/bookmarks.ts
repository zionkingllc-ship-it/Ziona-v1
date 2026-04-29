import { graphqlRequest } from "../../graphqlClient";

/* CREATE BOOKMARK FOLDER */
export async function createBookmarkFolder(name: string, cover?: string) {
  const query = `
    mutation CreateBookmarkFolder($name: String!, $cover: String) {
      createBookmarkFolder(name: $name, cover: $cover) {
        success
        folder {
          id
          name
          savedCount
        }
        error {
          code
          message
          field
          details
        }
        message
        errorCode
      }
    }
  `;

  const data = await graphqlRequest(query, { name, cover });
  return data?.createBookmarkFolder;
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
