import { useMutation } from "@tanstack/react-query";
import { usePostActionsStore } from "@/store/usePostActionStore";
import {
  savePost,
  unsavePost,
} from "@/services/graphQL/actions/actionService";

export function useToggleSave() {
  const toggleSaveStore = usePostActionsStore((s) => s.toggleSave);

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

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
 
      toggleSaveStore(ctx.postId, ctx.previous);
    },
  });
}