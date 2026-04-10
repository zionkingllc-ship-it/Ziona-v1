import { graphqlRequest } from "@/services/graphQL/graphqlClient";
import { useAuthStore } from "@/store/useAuthStore";

const CREATE_MEDIA_POST_MUTATION = `
mutation CreateMediaPost(
  $postType: PostType!
  $mediaType: MediaType!
  $caption: String
  $category: String!
  $mediaUrls: [String!]!
) {
  createPost(
    postType: $postType
    mediaType: $mediaType
    caption: $caption
    category: $category
    mediaUrls: $mediaUrls
  ) {
    success
    post {
      id
      type
      media {
        url
        type
      }
    }
    error {
      code
      message
    }
  }
}
`;

export async function createMediaPost(variables: {
  postType: "MEDIA";
  mediaType: "IMAGE" | "VIDEO";
  caption?: string | null;
  category: string;
  mediaUrls: string[];
}) {
  console.log("━━━━━━━━ CREATE MEDIA POST START ━━━━━━━━");
  console.log("Variables:", variables);

  const token = useAuthStore.getState().tokens?.accessToken;

  const data = await graphqlRequest(
    CREATE_MEDIA_POST_MUTATION,
    variables,
    token
  );

  console.log("CreateMediaPost response:", data);

  if (!data?.createPost?.success) {
    console.error("Backend rejection:", data);
    throw new Error("Media post creation failed");
  }

  const post = data.createPost.post;
 
  return {
    ...data.createPost,
    post: {
      ...post,
      caption: variables.caption ?? "", // unify with feed
    },
  };
}