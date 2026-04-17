export function normalizeBase(p: any) {
  return {
    id: p.id,
    createdAt: p.createdAt, 
    shareUrl: p.shareUrl ?? undefined,
    category: p.category
      ? {
          slug: p.category.slug,
          textPostBg: p.category.textPostBg,
          bgColor: p.category.bgColor,
          id: p.category.id,
          label: p.category.label,
        }
      : undefined,
    author: p.author
      ? {
          id: p.author.id,
          username: p.author.username,
          avatarUrl: p.author.avatarUrl ?? undefined,
        }
      : undefined,

    stats: {
      likesCount: p.stats?.likesCount ?? 0,
      commentsCount: p.stats?.commentsCount ?? 0,
      savesCount: p.stats?.savesCount ?? 0,
      sharesCount: p.stats?.sharesCount ?? 0,
    },

    viewerState: {
      liked: p.viewerState?.liked ?? false,
      saved: p.viewerState?.saved ?? false,
      followingAuthor: p.viewerState?.followingAuthor ?? false,
      followedByAuthor: p.viewerState?.followedByAuthor ?? false,
      isOwner: p.viewerState?.isOwner ?? false,
    },
  };
}
