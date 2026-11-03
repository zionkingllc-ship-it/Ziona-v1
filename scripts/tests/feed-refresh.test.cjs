const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { QueryClient, InfiniteQueryObserver } = require("@tanstack/query-core");

const moduleMock = { exports: {} };
const source = ts.transpileModule(
  fs.readFileSync(path.resolve(__dirname, "../../services/feed/refreshFeed.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
vm.runInNewContext(source, { module: moduleMock, exports: moduleMock.exports });
const { refreshFeedQuery } = moduleMock.exports;

for (const [feedType, key] of [["forYou", "forYouFeed"], ["following", "followingFeed"]]) {
  test(`${feedType} refresh discards older pages and requests page one`, async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const cursors = [];
    const observer = new InfiniteQueryObserver(client, {
      queryKey: [key],
      initialPageParam: undefined,
      queryFn: async ({ pageParam }) => {
        cursors.push(pageParam);
        return { posts: [pageParam ?? "first"], nextCursor: pageParam ? undefined : "second" };
      },
      getNextPageParam: (page) => page.nextCursor,
    });
    const unsubscribe = observer.subscribe(() => {});
    await observer.refetch();
    await observer.fetchNextPage();
    assert.equal(client.getQueryData([key]).pages.length, 2);

    await refreshFeedQuery(client, feedType);
    assert.equal(cursors.at(-1), undefined);
    assert.equal(client.getQueryData([key]).pages.length, 1);
    assert.equal(client.getQueryData([key]).pages[0].posts[0], "first");
    unsubscribe();
    client.clear();
  });
}
