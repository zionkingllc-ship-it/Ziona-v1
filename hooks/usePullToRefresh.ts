import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function usePullToRefresh(queryKeys?: any[]) {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      if (queryKeys && queryKeys.length > 0) {
        await Promise.all(
          queryKeys.map((key) =>
            queryClient.invalidateQueries({ queryKey: key })
          )
        );
      } else {
        // fallback: refresh everything
        await queryClient.invalidateQueries();
      }
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, queryKeys]);

  return { refreshing, onRefresh };
}