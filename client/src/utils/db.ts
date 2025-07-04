import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Comic, FavoriteSeries } from "../types";
import { isValidComic } from "./validation";

interface MyDB extends DBSchema {
  comics: {
    key: string;
    value: Comic;
    indexes: { "by-publisher-series-issue": [string, string, string] };
  };
  favoriteSeries: {
    key: string;
    value: FavoriteSeries;
    indexes: { "by-publisher-series": [string, string] };
  };
}

const DB_NAME = "comic-wantlist";
const DB_VERSION = 2; // Increment version for schema changes
const COMICS_STORE = "comics";
const FAVORITE_SERIES_STORE = "favoriteSeries";

let dbPromise: Promise<IDBPDatabase<MyDB>>;

const initDB = async (): Promise<IDBPDatabase<MyDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<MyDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Comics store
        if (!db.objectStoreNames.contains(COMICS_STORE)) {
          const comicsStore = db.createObjectStore(COMICS_STORE, {
            keyPath: "id",
          });
          comicsStore.createIndex("by-publisher-series-issue", [
            "publisher",
            "series",
            "issue",
          ]);
        }

        // Favorite series store
        if (!db.objectStoreNames.contains(FAVORITE_SERIES_STORE)) {
          const favoritesStore = db.createObjectStore(FAVORITE_SERIES_STORE, {
            keyPath: "id",
          });
          favoritesStore.createIndex("by-publisher-series", [
            "publisher",
            "series",
          ]);
        }

        // Migration: Add isGrail field to existing comics if upgrading from v1
        if (oldVersion < 2) {
          // This will be handled by the validation function
        }
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

// Comic operations (existing + updated)
export const getComics = async (): Promise<Comic[]> => {
  try {
    const db = await initDB();
    const allComics = await retryOperation(() => db.getAll(COMICS_STORE));

    return allComics.filter(isValidComic).map((comic) => ({
      ...comic,
      isGrail: comic.isGrail ?? false, // Ensure isGrail is always defined
    }));
  } catch (error) {
    console.error("Error fetching comics:", error);
    throw new Error("Failed to fetch comics. Please try again later.");
  }
};

export const addComics = async (comics: Comic[]): Promise<Comic[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(COMICS_STORE, "readwrite");
    const store = tx.objectStore(COMICS_STORE);
    const addedOrUpdatedComics: Comic[] = [];

    for (const comic of comics) {
      const existingComic = await store.get(comic.id);

      if (existingComic) {
        // If the comic already exists, update it but preserve the collected and grail state
        const updatedComic = {
          ...existingComic,
          ...comic,
          collected: existingComic.collected,
          isGrail: existingComic.isGrail ?? false,
        };
        await store.put(updatedComic);
        addedOrUpdatedComics.push(updatedComic);
      } else {
        // If it's a new comic, add it with default grail status
        const newComic = { ...comic, isGrail: false };
        await store.add(newComic);
        addedOrUpdatedComics.push(newComic);
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
    await retryOperation(() => db.put(COMICS_STORE, comic));
  } catch (error) {
    console.error("Error updating comic:", error);
    throw new Error("Failed to update comic. Please try again later.");
  }
};

export const deleteComic = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    await retryOperation(() => db.delete(COMICS_STORE, id));
  } catch (error) {
    console.error("Error deleting comic:", error);
    throw new Error("Failed to delete comic. Please try again later.");
  }
};

// Favorite Series operations (new)
export const getFavoriteSeries = async (): Promise<FavoriteSeries[]> => {
  try {
    const db = await initDB();
    return await retryOperation(() => db.getAll(FAVORITE_SERIES_STORE));
  } catch (error) {
    console.error("Error fetching favorite series:", error);
    throw new Error("Failed to fetch favorite series. Please try again later.");
  }
};

export const addFavoriteSeries = async (
  series: Omit<FavoriteSeries, "id" | "dateAdded">
): Promise<FavoriteSeries> => {
  try {
    const db = await initDB();
    const favoriteSeries: FavoriteSeries = {
      ...series,
      id: `${series.publisher}-${series.series}-${series.volume}`,
      dateAdded: Date.now(),
    };

    await retryOperation(() => db.put(FAVORITE_SERIES_STORE, favoriteSeries));
    return favoriteSeries;
  } catch (error) {
    console.error("Error adding favorite series:", error);
    throw new Error("Failed to add favorite series. Please try again later.");
  }
};

export const removeFavoriteSeries = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    await retryOperation(() => db.delete(FAVORITE_SERIES_STORE, id));
  } catch (error) {
    console.error("Error removing favorite series:", error);
    throw new Error(
      "Failed to remove favorite series. Please try again later."
    );
  }
};

export const isFavoriteSeries = async (
  publisher: string,
  series: string,
  volume: string
): Promise<boolean> => {
  try {
    const db = await initDB();
    const id = `${publisher}-${series}-${volume}`;
    const favorite = await retryOperation(() =>
      db.get(FAVORITE_SERIES_STORE, id)
    );
    return !!favorite;
  } catch (error) {
    console.error("Error checking favorite series:", error);
    return false;
  }
};

// Enhanced search and filtering
export const searchComics = async (query: string): Promise<Comic[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(COMICS_STORE, "readonly");
    const store = tx.objectStore(COMICS_STORE);
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
    const tx = db.transaction(COMICS_STORE, "readwrite");
    const store = tx.objectStore(COMICS_STORE);

    for (const comic of comics) {
      const existingComic = await store.get(comic.id);
      if (
        !existingComic ||
        comic.collected !== existingComic.collected ||
        comic.isGrail !== existingComic.isGrail
      ) {
        await store.put(comic);
      }
    }

    await tx.done;
  } catch (error) {
    console.error("Error syncing comics:", error);
    throw new Error("Failed to sync comics. Please try again later.");
  }
};
