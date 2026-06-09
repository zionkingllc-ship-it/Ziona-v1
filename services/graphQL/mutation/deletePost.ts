import { graphqlRequest } from "@/services/graphQL/graphqlClient";

const DELETE_POST_MUTATION = `
  mutation DeletePost($postId: String!) {
    deletePost(postId: $postId) {
      success
      message
      error {
        code
        message
      }
    }
  }
`;

export async function deletePost(postId: string): Promise<boolean> {
  console.log("[deletePost] Calling mutation with postId:", postId);
  const data = await graphqlRequest(DELETE_POST_MUTATION, { postId });
  console.log("[deletePost] Raw response:", JSON.stringify(data));

  const result = data?.deletePost;
  console.log("[deletePost] Result:", JSON.stringify(result));

  if (!result?.success) {
    const errMsg = result?.error?.message || result?.message || "Unknown error";
    console.error("[deletePost] Mutation failed:", errMsg);
    throw new Error(errMsg);
  }

  console.log("[deletePost] Success");
  return true;
}
