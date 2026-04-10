import { useQuery } from "@tanstack/react-query";
import { GraphqlBibleRepository } from "@/repository/graphql/GraphqlBibleRepository";

const repository = new GraphqlBibleRepository();

export function useScripture(
  book: string,
  chapter: number,
  version: string
) {
  return useQuery({
    queryKey: ["scripture", book, chapter, version],
    queryFn: () =>
      repository.getScripture({ book, chapter, version }),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!book && !!chapter,
  });
}