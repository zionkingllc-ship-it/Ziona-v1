import { create } from "zustand";

export type UploadStatus =
  | "idle"
  | "uploading"
  | "completed"
  | "failed"
  | "cancelled";

interface UploadState {
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
  ...initialState,

  setStatus: (status) => set({ status }),

  setProgress: (progress) =>
    set({ progress: Math.max(0, Math.min(100, Math.round(progress))) }),

  setExited: (exited) => set({ exited }),

  requestCancel: () => set({ cancelRequested: true }),

  setError: (error) => set({ error }),

  setPostId: (postId) => set({ postId }),

  reset: () => set({ ...initialState }),
}));