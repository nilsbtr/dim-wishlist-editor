import { D2AI_MODULE_URL } from "@/lib/constants";
import { db } from "@/services/db/dexie";
import type { D2AIData } from "@/types/weapons";

/**
 * Load data from DIM's d2ai-module repository.
 * This includes watermark-to-season, watermark-to-event, source-to-season,
 * seasons, events, and craftable-hashes mappings.
 *
 * Data is cached in IndexedDB and reused on subsequent calls.
 */
export async function loadD2AIData(): Promise<D2AIData> {
  // Check for cached data first
  const cached = await db.helperData.get("d2ai");
  if (cached) {
    console.log("[D2AI] Using cached d2ai data");
    return cached.data as D2AIData;
  }

  console.log("[D2AI] Fetching data from d2ai-module...");

  try {
    const [watermarkToSeason, watermarkToEvent, sourceToSeason, seasons, events, craftableHashes] =
      await Promise.all([
        fetchD2AIFile<Record<string, number>>("watermark-to-season.json"),
        fetchD2AIFile<Record<string, number>>("watermark-to-event.json"),
        fetchD2AIFile<Record<string, number>>("source-to-season-v2.json"),
        fetchD2AIFile<Record<string, number>>("seasons.json"),
        fetchD2AIFile<Record<string, number>>("events.json"),
        fetchD2AIFile<Array<number>>("craftable-hashes.json"),
      ]);

    const data: D2AIData = {
      watermarkToSeason,
      watermarkToEvent,
      sourceToSeason,
      seasons,
      events,
      craftableHashes,
    };

    // Cache the data in IndexedDB
    await db.helperData.put({ key: "d2ai", data });

    console.log("[D2AI] Data cached successfully");
    return data;
  } catch (error) {
    console.error("[D2AI] Failed to fetch data:", error);

    // Return empty defaults if fetch fails
    return {
      watermarkToSeason: {},
      watermarkToEvent: {},
      sourceToSeason: {},
      seasons: {},
      events: {},
      craftableHashes: [],
    };
  }
}

/**
 * Fetch a single file from the d2ai-module repository
 */
async function fetchD2AIFile<T>(filename: string): Promise<T> {
  const url = `${D2AI_MODULE_URL}/${filename}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Clear cached d2ai data (forces re-fetch on next load)
 */
export async function clearD2AIDataCache(): Promise<void> {
  await db.helperData.delete("d2ai");
  console.log("[D2AI] Cache cleared");
}

/**
 * Check if d2ai data is cached
 */
export async function isD2AIDataCached(): Promise<boolean> {
  const cached = await db.helperData.get("d2ai");
  return cached !== undefined;
}
