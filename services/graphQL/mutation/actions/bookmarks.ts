import { graphqlRequest } from "../../graphqlClient";
import { getToken } from "./token";

/* GET BOOKMARK FOLDERS */
export async function getBookmarkFolders() {
  const token = getToken();

  const query = `
    query GetBookmarkFolders {
      bookmarkFolders {
        id
        name
        savedCount
      }
    }
  `;

  const data = await graphqlRequest(query, {}, token);

  const folders = data?.bookmarkFolders;
  if (!folders) {
    throw new Error("Failed to fetch bookmark folders");
  }

  return folders;
}

/* CREATE BOOKMARK FOLDER */
export async function createBookmarkFolder(name: string) {
  const token = getToken();

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
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { name }, token);

  const res = data?.createBookmarkFolder;
  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to create folder");
  }

  return res.folder;
}

/* DELETE BOOKMARK FOLDER */
export async function deleteBookmarkFolder(folderId: string) {
  const token = getToken();

  const query = `
    mutation DeleteBookmarkFolder($folderId: String!) {
      deleteBookmarkFolder(folderId: $folderId) {
        success
      }
    }
  `;

  const data = await graphqlRequest(query, { folderId }, token);

  const res = data?.deleteBookmarkFolder;
  if (!res?.success) {
    throw new Error("Failed to delete folder");
  }

  return res;
}
