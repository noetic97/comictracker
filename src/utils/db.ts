// src/utils/db.ts
import { openDB, DBSchema } from "idb";
import { Comic } from "../types";

interface MyDB extends DBSchema {
  comics: {
    key: string;
    value: Comic;
    indexes: { "by-publisher-series-issue": [string, string, string] };
  };
}

const dbPromise = openDB<MyDB>("comic-wantlist", 1, {
  upgrade(db) {
    const store = db.createObjectStore("comics", { keyPath: "id" });
    store.createIndex("by-publisher-series-issue", [
      "Publisher",
      "Series",
      "Issue",
    ]);
  },
});

export async function getComics(): Promise<Comic[]> {
  return (await dbPromise).getAll("comics");
}

export async function addComics(comics: Comic[]): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction("comics", "readwrite");
  await Promise.all(comics.map((comic) => tx.store.put(comic)));
  await tx.done;
}

export async function updateComic(comic: Comic): Promise<any> {
  return (await dbPromise).put("comics", comic);
}
