export interface Folder {
  id: string;
  name: string;
  cover: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  postId: string;
  folderId: string;
  createdAt: string;
}