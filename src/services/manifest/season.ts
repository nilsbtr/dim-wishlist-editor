import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";

import type { D2AIData } from "@/types/weapons";

/**
 * Get season from item using DIM's fallback logic:
 * 1. Try watermark-to-season lookup
 * 2. Try source-to-season lookup (using collectible sourceHash)
 * 3. Try seasons.json lookup (using item hash)
 * 4. Return null if no season can be determined
 */
export function getSeason(
  itemDef: DestinyInventoryItemDefinition,
  watermark: string | null,
  sourceHash: number | undefined,
  d2aiData: D2AIData
): number | null {
  // 1. Try watermark lookup first
  if (watermark) {
    const season = d2aiData.watermarkToSeason[watermark];
    if (season !== undefined) {
      return season;
    }
  }

  // 2. Try source hash lookup
  if (sourceHash) {
    const season = d2aiData.sourceToSeason[String(sourceHash)];
    if (season !== undefined) {
      return season;
    }
  }

  // 3. Try item hash lookup (seasons.json)
  const season = d2aiData.seasons[String(itemDef.hash)];
  if (season !== undefined) {
    return season;
  }

  // 4. No season found
  return null;
}

/**
 * Get event from item using DIM's fallback logic:
 * 1. Try watermark-to-event lookup
 * 2. Try events.json lookup (using item hash)
 * 3. Return null if no event can be determined
 *
 * Note: DIM also checks D2SourcesToEvent (source hash to event), but that requires
 * parsing the d2-event-info-v2.ts file which contains event definitions with sources.
 * This could be added in the future if needed.
 */
export function getEvent(
  itemDef: DestinyInventoryItemDefinition,
  watermark: string | null,
  _sourceHash: number | undefined,
  d2aiData: D2AIData
): number | null {
  // 1. Try watermark lookup first
  if (watermark) {
    const eventId = d2aiData.watermarkToEvent[watermark];
    if (eventId !== undefined) {
      return eventId;
    }
  }

  // 2. Try item hash lookup (events.json)
  const eventId = d2aiData.events[String(itemDef.hash)];
  if (eventId !== undefined) {
    return eventId;
  }

  // 3. No event found
  return null;
}
