import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { AppError } from "@/utils/error";

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
  const data = await graphqlRequest(DELETE_POST_MUTATION, { postId });

  const result = data?.deletePost;

  if (!result?.success) {
    const errMsg = result?.error?.message || result?.message || "Unknown error";
    console.error("[deletePost] Mutation failed:", errMsg);
    throw new AppError(errMsg, { code: result?.error?.code });
  }

  return true;
}
