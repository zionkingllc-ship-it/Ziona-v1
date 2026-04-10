export function normalizeBase(p: any) {
  return {
    id: p.id,
    createdAt: p.createdAt, 
    author: p.author
      ? {
          id: p.author.id,
          username: p.author.username,
          avatarUrl: p.author.avatarUrl ?? undefined,
        }
      : undefined,

    category: p.category
      ? {
          id: p.category.id,
          label: p.category.label,
          slug: p.category.slug,
          bgColor: p.category.bgColor ?? "#e9d0d0",
          bdColor: p.category.bdColor ?? "#f59797",
          textPostBg: p.category.textPostBg ?? "#000000",
        }
      : undefined,

    stats: {
      likesCount: p.stats?.likesCount ?? 0,
      commentsCount: p.stats?.commentsCount ?? 0,
      sharesCount: p.stats?.sharesCount ?? 0,
      savesCount: p.stats?.savesCount ?? 0,
    },

    viewerState: {
      liked: p.viewerState?.liked ?? false,
      saved: p.viewerState?.saved ?? false,
      followingAuthor: p.viewerState?.followingAuthor ?? false,
      isOwner: p.viewerState?.isOwner ?? false,
    },
  };
}
