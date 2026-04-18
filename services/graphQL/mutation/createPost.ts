import { graphqlRequest } from "@/services/graphQL/graphqlClient";

export async function createMediaPost(variables: {
  caption?: string | null;
  mediaIds?: string[];
  mediaUrls?: string[];
  mediaType?: string;
}) {
  const mutation = `
    mutation CreateMediaPost(
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
}) {
  const mutation = `
    mutation CreateTextPost(
      $postType: PostType!
      $textMessage: String
    ) {
      createPost(
        postType: $postType
        textMessage: $textMessage
      ) {
        success
        post {
          id
          type
          textMessage
          createdAt
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

  const res = data?.createPost;

  if (!res?.success) {
    throw new Error(res?.error?.message || "Failed to create text post");
  }

  return res;
}

export async function createBiblePost(variables: {
  caption?: string | null;
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
      $caption: String
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
        caption: $caption
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
          bibleMessage
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
