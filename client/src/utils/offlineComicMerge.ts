import { Comic } from "../types";

export type PendingComicPatch = Partial<Pick<Comic, "collected" | "isGrail">>;

export function mergePendingPatchIntoComic(
  comic: Comic,
  patch: PendingComicPatch | undefined
): Comic {
  if (!patch) return comic;
  return {
    ...comic,
    ...(patch.collected !== undefined ? { collected: patch.collected } : {}),
    ...(patch.isGrail !== undefined ? { isGrail: patch.isGrail } : {}),
  };
}

export function mergePendingPatchesIntoComics(
  comics: Comic[],
  patches: Record<string, PendingComicPatch>
): Comic[] {
  return comics.map((c) => mergePendingPatchIntoComic(c, patches[c.id]));
}
