export const POST_FEED_FIELDS = `
  id
  type
  caption
  createdAt
  shareUrl
  category { slug textPostBg bgColor id label }
  textMessage
  bibleMessage
  author {
    id
    username
    avatarUrl
  }
  image {
    items {
      id
      url
      thumbnailUrl
      type
    }
  }
  video {
    url
    thumbnailUrl
  }
  scripture {
    verses { text number }
    verseEnd
    verseStart
    translation
    book
    chapter
    reference
  }
  stats {
    likesCount
    commentsCount
    savesCount
    sharesCount
  }
  viewerState {
    liked
    saved
    followingAuthor
    followedByAuthor
    isOwner
  }
`;
