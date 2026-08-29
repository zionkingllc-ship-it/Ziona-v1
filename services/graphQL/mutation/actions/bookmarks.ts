import { graphqlRequest } from "../../graphqlClient";
import { AppError } from "@/utils/error";

/* CREATE BOOKMARK FOLDER */
export async function createBookmarkFolder(name: string) {
  const query = `
    mutation CreateBookmarkFolder($name: String!) {
      createBookmarkFolder(name: $name) {
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

  const data = await graphqlRequest(query, { name });
  return data?.createBookmarkFolder;
}

/* DELETE BOOKMARK FOLDER */
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
    throw new AppError(res?.error?.message || res?.message || "Failed to delete folder", { code: res?.error?.code });
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
