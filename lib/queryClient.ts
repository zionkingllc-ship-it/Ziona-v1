import { QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

/* =========================
   QUERY CLIENT
========================= */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attempt =>
        Math.min(1000 * 2 ** attempt, 30000),
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,

      staleTime: 1000 * 60 * 60 * 24, // 24h
      gcTime: 1000 * 60 * 60 * 24, 
    },
  },
});

/* =========================
   PERSISTENCE
========================= */

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

/* =========================
   ENABLE PERSISTENCE
========================= */

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24,
});