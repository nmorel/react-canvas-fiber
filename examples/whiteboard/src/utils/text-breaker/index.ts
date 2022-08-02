import lineBreakClassesTrieUrl from "./line-break/classes.trie?url";
export type { TextBreaker } from "./text-breaker";

export async function newTextBreaker() {
  const [trieBuffer, { TextBreaker }] = await Promise.all([
    fetch(lineBreakClassesTrieUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer)),
    import("./text-breaker"),
  ]);
  return new TextBreaker(trieBuffer);
}
