import { graphqlRequest } from "../../graphqlClient";

/* GET SAVED POSTS */
export async function getSavedPosts() {
  const query = `
    query GetSavedPosts {
      savedPosts {
        id
        postId
        folderId
      }
    }
  `;

  const data = await graphqlRequest(query, {});

  const savedPosts = data?.savedPosts;
  if (!savedPosts) {
    throw new Error("Failed to fetch saved posts");
  }

  return savedPosts;
}
