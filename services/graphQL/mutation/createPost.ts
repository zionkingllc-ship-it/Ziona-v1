import { graphqlRequest } from "@/services/graphQL/graphqlClient";

export async function createMediaPost(variables: {
  caption?: string | null;
  mediaIds?: string[];
  mediaUrls?: string[];
  mediaType?: string;
}) {
  const mutation = `
    mutation CreateNewPost(
      $postType: PostType!
      $caption: String
      $mediaIds: [String!]
      $mediaUrls: [String!]
      $mediaType: MediaType
    ) {
      createPost(
        postType: $postType
        caption: $caption
        mediaIds: $mediaIds
        mediaUrls: $mediaUrls
        mediaType: $mediaType
      ) {
        success
        post {
          id
          type
          caption
          createdAt
          media {
            url
            type
            thumbnailUrl
            width
            height
          }
        }
        error {
          code
          message
          field
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, {
    ...variables,
    postType: "MEDIA",
  });

  const res = data?.createPost;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to create media post");
  }

  return res;
}

export async function createTextPost(variables: {
  textMessage?: string | null;
  category?: string;
  scriptureBook?: string;
  scriptureChapter?: number;
  scriptureVerseStart?: number;
  scriptureVerseEnd?: number;
  scriptureTranslation?: string;
  bibleMessage?: string;
}) {
  const mutation = `
    mutation CreateNewPost(
      $postType: PostType!
      $textMessage: String
      $category: String
      $scriptureBook: String
      $scriptureChapter: Int
      $scriptureVerseStart: Int
      $scriptureVerseEnd: Int
      $scriptureTranslation: String
      $bibleMessage: String
    ) {
      createPost(
        postType: $postType
        textMessage: $textMessage
        category: $category
        scriptureBook: $scriptureBook
        scriptureChapter: $scriptureChapter
        scriptureVerseStart: $scriptureVerseStart
        scriptureVerseEnd: $scriptureVerseEnd
        scriptureTranslation: $scriptureTranslation
        bibleMessage: $bibleMessage
      ) {
        success
        post {
          id
          type
          textMessage
          createdAt
          scripture {
            reference
            text
            translation
          }
        }
        error {
          code
          message
          field
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, {
    ...variables,
    postType: "TEXT",
  });

  console.log("📝 CREATE TEXT POST RESPONSE:", JSON.stringify(data, null, 2));

  const res = data?.createPost;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to create text post");
  }

  return res;
}

export async function createBiblePost(variables: {
  textMessage?: string | null;
  category: string;
  scriptureBook: string;
  scriptureChapter: number;
  scriptureVerseStart: number;
  scriptureVerseEnd?: number;
  scriptureTranslation: string;
  bibleMessage?: string | null;
}) {
  const mutation = `
    mutation CreateNewPost(
      $postType: PostType!
      $textMessage: String
      $category: String
      $scriptureBook: String
      $scriptureChapter: Int
      $scriptureVerseStart: Int
      $scriptureVerseEnd: Int
      $scriptureTranslation: String
      $bibleMessage: String
    ) {
      createPost(
        postType: $postType
        textMessage: $textMessage
        category: $category
        scriptureBook: $scriptureBook
        scriptureChapter: $scriptureChapter
        scriptureVerseStart: $scriptureVerseStart
        scriptureVerseEnd: $scriptureVerseEnd
        scriptureTranslation: $scriptureTranslation
        bibleMessage: $bibleMessage
      ) {
        success
        post {
          id
          type
          textMessage
          createdAt
          scripture {
            reference
            text
            translation
          }
        }
        error {
          code
          message
          field
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, {
    ...variables,
    postType: "BIBLE",
  });

  const res = data?.createPost;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to create bible post");
  }

  return res;
}