import type {
  Wishlist,
  WishlistExportV1,
  WishlistExportV2,
  WishlistRoll,
  WishlistRollExport,
} from "@/types/wishlist";

// =============================================================================
// Types
// =============================================================================

export interface DimExportOptions {
  includeUsage: boolean;
  semiGodrollLevel: number; // 0 = disabled, 1-2 = skip first X columns
}

export interface ParsedWishlist {
  name: string;
  description: string;
  weapons: Wishlist["weapons"];
  weaponCount: number;
  rollCount: number;
}

// =============================================================================
// File Download
// =============================================================================

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

// =============================================================================
// JSON Export (V2 Format)
// =============================================================================

export function exportAsJson(wishlist: Wishlist): void {
  const exportData = convertToJsonFormat(wishlist);
  const content = JSON.stringify(exportData, null, 2);
  const filename = `${sanitizeFilename(wishlist.name)}.json`;
  downloadFile(content, filename, "application/json;charset=utf-8");
}

export function convertToJsonFormat(wishlist: Wishlist): WishlistExportV2 {
  const exportData: WishlistExportV2 = {
    version: 2,
    name: wishlist.name,
    description: wishlist.description,
    weapons: {},
  };

  for (const [hashStr, entry] of Object.entries(wishlist.weapons)) {
    if (!entry || entry.rolls.length === 0) continue;

    exportData.weapons[hashStr] = entry.rolls.map(
      (roll): WishlistRollExport => ({
        usage: roll.usage,
        notes: roll.notes,
        perkHashes: roll.perkHashes,
      })
    );
  }

  return exportData;
}

// =============================================================================
// DIM Export
// =============================================================================

export function exportAsDim(wishlist: Wishlist, options: DimExportOptions): void {
  const content = convertToDimFormat(wishlist, options);
  const filename = `${sanitizeFilename(wishlist.name)}_dim.txt`;
  downloadFile(content, filename, "text/plain;charset=utf-8");
}

export function convertToDimFormat(wishlist: Wishlist, options: DimExportOptions): string {
  const weaponCount = Object.keys(wishlist.weapons).length;
  const lines: Array<string> = [];

  // Header
  lines.push(`title:${wishlist.name}`);
  const lastUpdated = new Date(wishlist.updatedAt).toLocaleDateString();
  const descParts = [`Last updated: ${lastUpdated}`, `Weapons: ${weaponCount}`];
  if (wishlist.description) {
    descParts.push(wishlist.description);
  }
  lines.push(`description:${descParts.join(", ")}`);
  lines.push("");

  // Process each weapon
  for (const [hashStr, entry] of Object.entries(wishlist.weapons)) {
    if (!entry || entry.rolls.length === 0) continue;

    for (const roll of entry.rolls) {
      const rollLines = generateRollLines(hashStr, roll, options);
      lines.push(...rollLines);
    }
  }

  return lines.join("\n").trim();
}

function generateRollLines(
  weaponHash: string,
  roll: WishlistRoll,
  options: DimExportOptions
): Array<string> {
  const lines: Array<string> = [];

  // Filter out empty columns for processing
  const nonEmptyColumns = roll.perkHashes.filter((col) => col.length > 0);

  // Skip if no perks
  if (nonEmptyColumns.length === 0) {
    const notes = generateNotes(roll, options);
    if (notes) lines.push(notes);
    lines.push(`dimwishlist:item=${weaponHash}`);
    lines.push("");
    return lines;
  }

  // Generate main roll combinations
  const mainCombinations = generateCombinations(nonEmptyColumns);

  if (mainCombinations.length > 0) {
    const notes = generateNotes(roll, options);
    if (notes) lines.push(notes);

    for (const combo of mainCombinations) {
      lines.push(`dimwishlist:item=${weaponHash}&perks=${combo.join(",")}`);
    }
    lines.push("");
  }

  // Generate semi-godrolls if enabled and weapon has enough columns
  if (
    options.semiGodrollLevel > 0 &&
    roll.perkHashes.length >= 4 &&
    roll.perkHashes.length > options.semiGodrollLevel
  ) {
    for (let skipCols = 1; skipCols <= options.semiGodrollLevel; skipCols++) {
      const partialColumns = roll.perkHashes.slice(skipCols).filter((col) => col.length > 0);

      if (partialColumns.length === 0) continue;

      const semiCombinations = generateCombinations(partialColumns);

      if (semiCombinations.length > 0) {
        const semiNotes = generateSemiGodrollNotes(roll, options, skipCols);
        if (semiNotes) lines.push(semiNotes);

        for (const combo of semiCombinations) {
          lines.push(`dimwishlist:item=${weaponHash}&perks=${combo.join(",")}`);
        }
        lines.push("");
      }
    }
  }

  return lines;
}

function generateCombinations(columns: Array<Array<number>>): Array<Array<number>> {
  if (columns.length === 0) return [];

  let combinations: Array<Array<number>> = [[]];

  for (const column of columns) {
    const newCombinations: Array<Array<number>> = [];

    // For each existing combination, add each perk from this column
    for (const combination of combinations) {
      for (const perk of column) {
        newCombinations.push([...combination, perk]);
      }
    }

    combinations = newCombinations;
  }

  return combinations;
}

function generateNotes(roll: WishlistRoll, options: DimExportOptions): string | null {
  const parts: Array<string> = [];

  if (options.includeUsage && roll.usage) {
    const usage = roll.usage.trim();
    if (usage) {
      parts.push(`Usage: ${usage.toUpperCase()}`);
    }
  }

  const notes = roll.notes.trim();
  if (notes) {
    parts.push(notes);
  }

  return parts.length > 0 ? `//notes:${parts.join(" | ")}` : null;
}

function generateSemiGodrollNotes(
  roll: WishlistRoll,
  options: DimExportOptions,
  skippedColumns: number
): string | null {
  const parts: Array<string> = [];

  if (options.includeUsage && roll.usage) {
    const usage = roll.usage.trim();
    if (usage) {
      parts.push(`Usage: ${usage.toUpperCase()}`);
    }
  }

  const columnNames = ["barrels", "magazines"];
  const ignoredNames = columnNames.slice(0, skippedColumns);
  parts.push(`Semi-godroll (ignored ${ignoredNames.join(" + ")})`);

  return parts.length > 0 ? `//notes:${parts.join(" | ")}` : null;
}

// =============================================================================
// Import / Parsing
// =============================================================================

export function parseWishlistFile(content: string): ParsedWishlist | null {
  try {
    const data = JSON.parse(content) as unknown;

    // Handle v2 format
    if (data && typeof data === "object" && "version" in data && data.version === 2) {
      return parseV2Format(data as WishlistExportV2);
    }

    // Handle v1 format
    if (data && typeof data === "object" && "version" in data && data.version === 1) {
      return parseV1Format(data as WishlistExportV1);
    }

    // Handle raw Wishlist format (legacy)
    if (data && typeof data === "object" && "id" in data && "name" in data && "weapons" in data) {
      return parseRawWishlist(data as Wishlist);
    }

    return null;
  } catch {
    return null;
  }
}

function parseV2Format(data: WishlistExportV2): ParsedWishlist {
  const weapons: Wishlist["weapons"] = {};
  let rollCount = 0;

  for (const [hashStr, rolls] of Object.entries(data.weapons)) {
    const weaponHash = parseInt(hashStr, 10);
    const now = Date.now();

    weapons[weaponHash] = {
      weaponHash,
      rolls: rolls.map(
        (roll, index): WishlistRoll => ({
          id: `imported-${weaponHash}-${index}-${now}`,
          usage: roll.usage,
          notes: roll.notes,
          perkHashes: roll.perkHashes,
          createdAt: now,
          updatedAt: now,
        })
      ),
    };

    rollCount += rolls.length;
  }

  return {
    name: data.name,
    description: data.description,
    weapons,
    weaponCount: Object.keys(weapons).length,
    rollCount,
  };
}

function parseV1Format(data: WishlistExportV1): ParsedWishlist {
  const wishlist = data.wishlist;
  const weaponCount = Object.keys(wishlist.weapons).length;
  const rollCount = Object.values(wishlist.weapons).reduce(
    (sum, entry) => sum + (entry?.rolls.length ?? 0),
    0
  );

  return {
    name: wishlist.name,
    description: wishlist.description,
    weapons: wishlist.weapons,
    weaponCount,
    rollCount,
  };
}

function parseRawWishlist(data: Wishlist): ParsedWishlist {
  const weaponCount = Object.keys(data.weapons).length;
  const rollCount = Object.values(data.weapons).reduce(
    (sum, entry) => sum + (entry?.rolls.length ?? 0),
    0
  );

  return {
    name: data.name,
    description: data.description,
    weapons: data.weapons,
    weaponCount,
    rollCount,
  };
}

// =============================================================================
// Convert ParsedWishlist to Wishlist
// =============================================================================

export function createWishlistFromParsed(parsed: ParsedWishlist): Wishlist {
  const now = Date.now();
  return {
    id: `temp-${now}`, // Will be replaced by importWishlist
    name: parsed.name,
    description: parsed.description,
    weapons: parsed.weapons,
    createdAt: now,
    updatedAt: now,
  };
}
