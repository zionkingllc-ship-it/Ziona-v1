import { create } from "zustand";

export type UploadStatus =
  | "idle"
  | "uploading"
  | "publishing"
  | "completed"
  | "failed"
  | "cancelled";

interface UploadState {
  uploadId: number;
  status: UploadStatus;
  progress: number;
  exited: boolean;
  cancelRequested: boolean;
  error: { title: string; message: string } | null;
  postId: string | null;

  setStatus: (status: UploadStatus) => void;
  setProgress: (progress: number) => void;
  setExited: (exited: boolean) => void;
  requestCancel: () => void;
  setError: (error: { title: string; message: string } | null) => void;
  setPostId: (postId: string | null) => void;
  reset: () => void;
  startUpload: () => number;
}

const initialState = {
  status: "idle" as UploadStatus,
  progress: 0,
  exited: false,
  cancelRequested: false,
  error: null,
  postId: null as string | null,
};

export const useUploadStore = create<UploadState>((set) => ({
  uploadId: 0,
  ...initialState,

  setStatus: (status) => set({ status }),

  setProgress: (progress) =>
    set({ progress: Math.max(0, Math.min(100, Math.round(progress))) }),

  setExited: (exited) => set({ exited }),

  requestCancel: () => set((state) => state.status === "uploading"
    ? { cancelRequested: true, status: "cancelled" }
    : {}),

  setError: (error) => set({ error }),

  setPostId: (postId) => set({ postId }),

  reset: () => set((state) => ({ ...initialState, uploadId: state.uploadId + 1 })),
  startUpload: () => {
    let uploadId = 0;
    set((state) => {
      uploadId = state.uploadId + 1;
      return { ...initialState, status: "uploading", uploadId };
    });
    return uploadId;
  },
}));
