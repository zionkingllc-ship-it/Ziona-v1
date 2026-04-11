import { graphqlRequest } from "../../graphqlClient";
import { getToken } from "../../mutation/actions/token";

/* GET SAVED POSTS */
export async function getSavedPosts() {
  const token = getToken();

  const query = `
    query GetSavedPosts {
      savedPosts {
        id
        postId
        folderId
      }
    }
  `;

  const data = await graphqlRequest(query, {}, token);

  const savedPosts = data?.savedPosts;
  if (!savedPosts) {
    throw new Error("Failed to fetch saved posts");
  }

  return savedPosts;
}
