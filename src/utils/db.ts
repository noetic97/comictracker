import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Comic } from "../types";

interface MyDB extends DBSchema {
  comics: {
    key: string;
    value: Comic;
    indexes: { "by-publisher-series-issue": [string, string, string] };
  };
}

const DB_NAME = "comic-wantlist";
const DB_VERSION = 1;
const STORE_NAME = "comics";

let dbPromise: Promise<IDBPDatabase<MyDB>>;

const initDB = async (): Promise<IDBPDatabase<MyDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<MyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by-publisher-series-issue", [
          "publisher",
          "series",
          "issue",
        ]);
      },
    });
  }
  return dbPromise;
};

const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

export const getComics = async (): Promise<Comic[]> => {
  try {
    const db = await initDB();
    return await retryOperation(() => db.getAll(STORE_NAME));
  } catch (error) {
    console.error("Error fetching comics:", error);
    throw new Error("Failed to fetch comics. Please try again later.");
  }
};

export const addComics = async (comics: Comic[]): Promise<Comic[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const addedOrUpdatedComics: Comic[] = [];

    for (const comic of comics) {
      const existingComic = await store.get(comic.id);

      if (existingComic) {
        // If the comic already exists, update it but preserve the collected state
        const updatedComic = {
          ...existingComic,
          ...comic,
          collected: existingComic.collected, // Preserve the existing collected state
        };
        await store.put(updatedComic);
        addedOrUpdatedComics.push(updatedComic);
      } else {
        // If it's a new comic, add it
        await store.add(comic);
        addedOrUpdatedComics.push(comic);
      }
    }

    await tx.done;
    return addedOrUpdatedComics;
  } catch (error) {
    console.error("Error adding/updating comics:", error);
    throw new Error("Failed to import comics. Please try again later.");
  }
};

export const updateComic = async (comic: Comic): Promise<void> => {
  try {
    const db = await initDB();
    await retryOperation(() => db.put(STORE_NAME, comic));
  } catch (error) {
    console.error("Error updating comic:", error);
    throw new Error("Failed to update comic. Please try again later.");
  }
};

export const deleteComic = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    await retryOperation(() => db.delete(STORE_NAME, id));
  } catch (error) {
    console.error("Error deleting comic:", error);
    throw new Error("Failed to delete comic. Please try again later.");
  }
};

export const searchComics = async (query: string): Promise<Comic[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("by-publisher-series-issue");
    const allComics = await index.getAll();

    return allComics.filter(
      (comic) =>
        comic.publisher.toLowerCase().includes(query.toLowerCase()) ||
        comic.series.toLowerCase().includes(query.toLowerCase()) ||
        comic.issue.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching comics:", error);
    throw new Error("Failed to search comics. Please try again later.");
  }
};

export const syncComics = async (comics: Comic[]): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const comic of comics) {
      const existingComic = await store.get(comic.id);
      if (!existingComic || comic.collected !== existingComic.collected) {
        await store.put(comic);
      }
    }

    await tx.done;
  } catch (error) {
    console.error("Error syncing comics:", error);
    throw new Error("Failed to sync comics. Please try again later.");
  }
};
