export const POST_FEED_FIELDS = `
  id
  type
  caption
  createdAt
  category {
    id
    label
    slug
    bgColor
    bdColor
    textPostBg
  }
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
      width
      height
    }
  }
  video {
    url
    thumbnailUrl
    duration
    width
    height
  }
  text
  scripture {
    reference
    text
    translation
    book
    chapter
    verseStart
    verseEnd
  }
  stats {
    likesCount
    commentsCount
    sharesCount
    savesCount
  }
  viewerState {
    liked
    saved
    followingAuthor
    isOwner
  }
`;
