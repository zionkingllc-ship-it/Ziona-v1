import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostActionsStore } from "@/store/usePostActionStore";
import { savePost, unsavePost } from "@/services/graphQL/mutation/actions";

export function useToggleSave() {
  const toggleSaveStore = usePostActionsStore((s) => s.toggleSave);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      currentSaved,
      folderId,
    }: {
      postId: string;
      currentSaved: boolean;
      folderId?: string;
    }) => {
      if (currentSaved) {
        return unsavePost(postId);
      }

      return savePost(postId, folderId ?? undefined);
    },

    onMutate: ({ postId, currentSaved }) => {
      // optimistic → next state
      toggleSaveStore(postId, !currentSaved);

      return { postId, previous: currentSaved };
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarkFolders"] });
      queryClient.invalidateQueries({
        queryKey: ["userSavedPosts", variables.folderId],
      });
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;

      toggleSaveStore(ctx.postId, ctx.previous);
    },
  });
}
