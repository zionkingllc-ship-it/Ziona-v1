import { graphqlRequest } from "@/services/graphQL/graphqlClient";

const CREATE_POST_MUTATION = `
mutation CreatePost(
  $postType: PostType!
  $category: String

  $scriptureBook: String
  $scriptureChapter: Int
  $scriptureVerseStart: Int
  $scriptureVerseEnd: Int
  $scriptureTranslation: String
) {
  createPost(
    postType: $postType
    category: $category

    scriptureBook: $scriptureBook
    scriptureChapter: $scriptureChapter
    scriptureVerseStart: $scriptureVerseStart
    scriptureVerseEnd: $scriptureVerseEnd
    scriptureTranslation: $scriptureTranslation
  ) {
    success
    post {
      id
      type
      text
    }
    error {
      code
      message
    }
  }
}
`;

export async function createTextPost(variables: {
  postType: "TEXT" | "BIBLE";
  message?: string;
  category: string;

  scriptureBook?: string;
  scriptureChapter?: number;
  scriptureVerseStart?: number;
  scriptureVerseEnd?: number;
  scriptureTranslation?: string;
}) {
  console.log("━━━━━━━ CREATE POST START ━━━━━━━━");

  const payload = {
    postType: variables.postType,
    category: variables.category,

    scriptureBook: variables.scriptureBook,
    scriptureChapter: variables.scriptureChapter,
    scriptureVerseStart: variables.scriptureVerseStart,
    scriptureVerseEnd: variables.scriptureVerseEnd,
    scriptureTranslation: variables.scriptureTranslation,
  };

  console.log("Final payload:", payload);

  const data = await graphqlRequest(CREATE_POST_MUTATION, payload);

  console.log("CreatePost response:", data);

  if (!data?.createPost?.success) {
    console.error("Backend rejection:", data);
    throw new Error("Post creation failed");
  }

  const post = data.createPost.post;

  return {
    ...data.createPost,
    post: {
      ...post,
      text: post.text ?? "",
    },
  };
}