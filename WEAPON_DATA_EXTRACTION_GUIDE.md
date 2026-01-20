# Destiny 2 Manifest Weapon Data Extraction Guide

This guide explains how to extract weapon data from the Destiny 2 manifest to build the `WeaponItem`, `WeaponFull`, and `WeaponConcise` models. The information is derived from how Destiny Item Manager (DIM) processes the manifest.

---

## Data Models

```typescript
// WeaponItem: scalar + presentation fields
WeaponItem = {
  hash: uint32,
  name: string,
  flavorText: string,
  tierType: number, // 5=Legendary, 6=Exotic
  itemType: string, // e.g., "Auto Rifle"
  damageType: number, // DestinyDamageType enumValue
  slot: number, // 0 kinetic, 1 energy, 2 power (map from bucket hash)
  ammoType: number, // DestinyAmmunitionType
  source: number | null, // collectible.sourceHash or sourceData hash
  iconSrc: string | null, // displayProperties.icon (prefix bungie domain)
  watermarkSrc: string | null, // def.iconWatermark (prefix bungie domain)
  watermarkFeaturedSrc: string | null, // def.iconWatermarkFeatured (prefix bungie domain)
  screenshotSrc: string | null, // def.screenshot
  foundrySrc: string | null, // NOT NAME, BUT ICON: def.secondaryIcon (prefix bungie domain)
  isCraftable: boolean,
  isAdept: boolean,
  isHolofoil: boolean,
  isFeatured: boolean,
  season: number | null,
  event: number | null,
};

// WeaponFull: full sockets, stats, and plug deltas
WeaponFull = {
  item: WeaponItem,

  frame:
    {
      hash: number,
      name: string,
      description: string,
      iconSrc: string | null,
    } | null,

  intrinsics: Array<{
    hash: number;
    name: string;
    description: string;
    iconSrc: string | null;
  }>,

  perks: Array<
    Array<{
      hash: number;
      name: string;
      description: string;
      itemType: string;
      iconSrc: string | null;
      isCurated: boolean;
      curatedExclusive: boolean;
      isDeprecated: boolean;
    }>
  >,
};

// WeaponConcise: trimmed down version for lists
WeaponConcise = {
  hash: uint32,
  name: string,
  tierType: number,
  itemType: string,
  damageType: number,
  slot: number,
  ammoType: number,
  source: number | null,
  iconSrc: string | null,
  watermarkSrc: string | null,
  watermarkFeaturedSrc: string | null,
  isCraftable: boolean,
  isAdept: boolean,
  isHolofoil: boolean,
  isFeatured: boolean,
  season: number | null,
  event: number | null,

  frame: string, // intrinsic plug name
  perks: Array<Array<string>>, // perk columns as names
};
```

---

## Table of Contents

1. [Overview](#overview)
2. [Manifest Tables Required](#manifest-tables-required)
3. [Fetching the Manifest](#fetching-the-manifest)

4. [Filtering for Weapons](#filtering-for-weapons)
5. [Field Extraction: WeaponItem](#field-extraction-weaponitem)
6. [Field Extraction: WeaponFull](#field-extraction-weaponfull)
7. [Field Extraction: WeaponConcise](#field-extraction-weaponconcise)
8. [Helper Data Files](#helper-data-files)
9. [Key Enums and Constants](#key-enums-and-constants)
10. [Code Examples](#code-examples)

---

## Overview

The Destiny 2 manifest is a collection of JSON tables containing all game definitions. To extract weapon data, you primarily work with `DestinyInventoryItemDefinition` and related tables like `DestinyPlugSetDefinition`, `DestinyCollectibleDefinition`, and `DestinyDamageTypeDefinition`.

**The manifest is publicly available and requires no authentication.** No API key is needed to fetch manifest data.

The Bungie API provides manifest metadata at:

```
https://www.bungie.net/Platform/Destiny2/Manifest/
```

Individual component tables are available at paths like:

```
https://www.bungie.net{jsonWorldComponentContentPaths[language][tableName]}
```

---

## Manifest Tables Required

| Table Name                        | Purpose                                                  |
| --------------------------------- | -------------------------------------------------------- |
| `DestinyInventoryItemDefinition`  | Core item definitions (weapons, armor, perks, mods)      |
| `DestinyPlugSetDefinition`        | Perk pools for sockets (random/curated rolls)            |
| `DestinySocketTypeDefinition`     | Socket behavior and categories                           |
| `DestinySocketCategoryDefinition` | Socket grouping (perks, mods, intrinsics)                |
| `DestinyCollectibleDefinition`    | Collection entries with source information               |
| `DestinyDamageTypeDefinition`     | Damage type lookups (Solar, Arc, Void, etc.)             |
| `DestinyStatDefinition`           | Stat display names and properties                        |
| `DestinyStatGroupDefinition`      | Stat scaling and display rules                           |
| `DestinySandboxPerkDefinition`    | Perk display information                                 |
| `DestinyBreakerTypeDefinition`    | Champion mod types (Anti-Barrier, Overload, Unstoppable) |
| `DestinySeasonDefinition`         | Season metadata                                          |

---

## Fetching the Manifest

### Step 1: Get Manifest Metadata

```typescript
// No authentication required - manifest is publicly accessible
const response = await fetch("https://www.bungie.net/Platform/Destiny2/Manifest/");
const manifest = await response.json();
const paths = manifest.Response.jsonWorldComponentContentPaths["en"];
```

### Step 2: Fetch Individual Tables

```typescript
const inventoryItems = await fetch(`https://www.bungie.net${paths.DestinyInventoryItemDefinition}`);
const plugSets = await fetch(`https://www.bungie.net${paths.DestinyPlugSetDefinition}`);
// ... fetch other required tables
```

### Step 3: Build Lookup Tables

```typescript
const defs = {
  InventoryItem: await inventoryItems.json(), // { [hash: number]: DestinyInventoryItemDefinition }
  PlugSet: await plugSets.json(),
  Collectible: await collectibles.json(),
  DamageType: await damageTypes.json(),
  // ... etc
};
```

---

## Filtering for Weapons

Weapons are identified by their `itemCategoryHashes` and `inventory.bucketTypeHash`.

### Bucket Hashes for Weapons

| Slot        | Bucket Hash  | Name           |
| ----------- | ------------ | -------------- |
| 0 (Kinetic) | `1498876634` | KineticWeapons |
| 1 (Energy)  | `2465295065` | EnergyWeapons  |
| 2 (Power)   | `953998645`  | PowerWeapons   |

### Item Category Hashes

- **Weapon (general)**: `1` (`ItemCategoryHashes.Weapon`)
- **Dummies (exclude)**: `3109687656` (`ItemCategoryHashes.Dummies`)

### Filter Logic

```typescript
const WEAPON_BUCKET_HASHES = [1498876634, 2465295065, 953998645];

function isWeapon(itemDef: DestinyInventoryItemDefinition): boolean {
  const bucketHash = itemDef.inventory?.bucketTypeHash;
  const categories = itemDef.itemCategoryHashes || [];

  return (
    WEAPON_BUCKET_HASHES.includes(bucketHash) &&
    categories.includes(1) && // ItemCategoryHashes.Weapon
    !categories.includes(3109687656) && // Not a dummy
    itemDef.displayProperties?.name // Has a name
  );
}
```

---

## Field Extraction: WeaponItem

### Core Fields

| Field        | Source                           | Notes                             |
| ------------ | -------------------------------- | --------------------------------- |
| `hash`       | `itemDef.hash`                   | Unique uint32 identifier          |
| `name`       | `itemDef.displayProperties.name` | Localized name                    |
| `flavorText` | `itemDef.flavorText`             | Lore text                         |
| `tierType`   | `itemDef.inventory.tierType`     | 5=Legendary, 6=Exotic             |
| `itemType`   | `itemDef.itemTypeDisplayName`    | "Auto Rifle", "Hand Cannon", etc. |

### Damage Type

```typescript
// itemDef.defaultDamageTypeHash contains the hash
const damageTypeDef = defs.DamageType[itemDef.defaultDamageTypeHash];
const damageType = damageTypeDef?.enumValue;

// Enum values:
// 0 = None, 1 = Kinetic, 2 = Arc, 3 = Solar, 4 = Void, 5 = Raid, 6 = Stasis, 7 = Strand
```

### Slot (from Bucket Hash)

```typescript
function getSlot(bucketHash: number): number {
  switch (bucketHash) {
    case 1498876634:
      return 0; // Kinetic
    case 2465295065:
      return 1; // Energy
    case 953998645:
      return 2; // Power
    default:
      return -1;
  }
}

const slot = getSlot(itemDef.inventory.bucketTypeHash);
```

### Ammo Type

```typescript
// itemDef.equippingBlock.ammoType
// 1 = Primary, 2 = Special, 3 = Heavy
const ammoType = itemDef.equippingBlock?.ammoType ?? 0;
```

### Source

The source comes from the collectible definition:

```typescript
// Find collectible by itemHash
const collectible = Object.values(defs.Collectible).find((c) => c.itemHash === itemDef.hash);

const source = collectible?.sourceHash ?? null;
```

For items without collectibles, you may need supplementary data (see Helper Data Files).

### Icon Paths

All icon paths are relative to `https://www.bungie.net`. Prefix them with the Bungie domain.

```typescript
const BUNGIE_NET = "https://www.bungie.net";

const iconSrc = itemDef.displayProperties.icon
  ? `${BUNGIE_NET}${itemDef.displayProperties.icon}`
  : null;

const watermarkSrc = itemDef.iconWatermark ? `${BUNGIE_NET}${itemDef.iconWatermark}` : null;

const watermarkFeaturedSrc = itemDef.iconWatermarkFeatured
  ? `${BUNGIE_NET}${itemDef.iconWatermarkFeatured}`
  : null;

const screenshotSrc = itemDef.screenshot ? `${BUNGIE_NET}${itemDef.screenshot}` : null;

// Foundry icon (NOT the foundry name)
const foundrySrc = itemDef.secondaryIcon ? `${BUNGIE_NET}${itemDef.secondaryIcon}` : null;
```

### Boolean Flags

```typescript
// Craftable - check if item has a crafting template
// You need supplementary data or check: does a crafting template exist that outputs this hash?
const isCraftable = checkCraftableHashes(itemDef.hash); // See Helper Data Files

// Adept - directly from the definition
const isAdept = itemDef.isAdept ?? false;

// Holofoil (shiny) - directly from the definition
const isHolofoil = itemDef.isHolofoil ?? false;

// Featured (new gear bonus) - directly from the definition
const isFeatured = itemDef.isFeaturedItem ?? false;
```

### Season

Season is determined from the icon watermark. You need a mapping file (`watermark-to-season.json`):

```typescript
// Example watermark-to-season.json structure:
// {
//   "/common/destiny2_content/icons/abc123.png": 24,
//   ...
// }

function getSeason(
  itemDef: DestinyInventoryItemDefinition,
  watermarkToSeason: Record<string, number>
): number | null {
  const watermark = itemDef.iconWatermark || itemDef.iconWatermarkShelved;
  if (watermark && watermarkToSeason[watermark]) {
    return watermarkToSeason[watermark];
  }
  return null;
}
```

### Event

Events are determined similarly from watermarks or source hashes:

```typescript
// Example event enum:
// 1 = Dawning, 2 = Crimson Days, 3 = Solstice, 4 = Festival of the Lost, 5 = Revelry, 6 = Guardian Games

function getEvent(itemDef, watermarkToEvent, sourceToEvent): number | null {
  const watermark = itemDef.iconWatermark;
  if (watermark && watermarkToEvent[watermark]) {
    return watermarkToEvent[watermark];
  }

  // Check source hash
  const collectible = findCollectible(itemDef.hash);
  if (collectible?.sourceHash && sourceToEvent[collectible.sourceHash]) {
    return sourceToEvent[collectible.sourceHash];
  }

  return null;
}
```

---

## Field Extraction: WeaponFull

### Frame (Intrinsic Perk)

The frame is the intrinsic perk found in the intrinsic socket category.

```typescript
const INTRINSIC_SOCKET_CATEGORY = 3956125808; // SocketCategoryHashes.IntrinsicTraits

function getFrame(itemDef: DestinyInventoryItemDefinition, defs): Frame | null {
  const sockets = itemDef.sockets?.socketEntries || [];
  const categories = itemDef.sockets?.socketCategories || [];

  // Find intrinsic category
  const intrinsicCategory = categories.find(
    (c) => c.socketCategoryHash === INTRINSIC_SOCKET_CATEGORY
  );

  if (!intrinsicCategory || intrinsicCategory.socketIndexes.length === 0) {
    return null;
  }

  const socketIndex = intrinsicCategory.socketIndexes[0];
  const socket = sockets[socketIndex];
  const plugHash = socket?.singleInitialItemHash;

  if (!plugHash) return null;

  const plugDef = defs.InventoryItem[plugHash];
  if (!plugDef) return null;

  return {
    hash: plugDef.hash,
    name: plugDef.displayProperties.name,
    description: plugDef.displayProperties.description,
    iconSrc: plugDef.displayProperties.icon
      ? `https://www.bungie.net${plugDef.displayProperties.icon}`
      : null,
  };
}
```

### Intrinsics (Origin Traits)

Origin traits are typically in a separate socket category or identified by specific trait hashes.

```typescript
const WEAPON_PERKS_CATEGORY = 4241085061; // SocketCategoryHashes.WeaponPerks

function getIntrinsics(itemDef, defs): Intrinsic[] {
  // Origin traits often have specific itemCategoryHashes
  // ItemCategoryHashes.WeaponModsOriginTraits = 1052191891

  const sockets = itemDef.sockets?.socketEntries || [];
  const intrinsics: Intrinsic[] = [];

  for (const socket of sockets) {
    const plugHash = socket.singleInitialItemHash;
    if (!plugHash) continue;

    const plugDef = defs.InventoryItem[plugHash];
    if (!plugDef) continue;

    // Check if it's an origin trait
    if (plugDef.itemCategoryHashes?.includes(1052191891)) {
      intrinsics.push({
        hash: plugDef.hash,
        name: plugDef.displayProperties.name,
        description: plugDef.displayProperties.description,
        iconSrc: plugDef.displayProperties.icon
          ? `https://www.bungie.net${plugDef.displayProperties.icon}`
          : null,
      });
    }
  }

  return intrinsics;
}
```

### Perks (2D Array of Perk Columns)

Perks come from the weapon perks socket category. Each socket represents a column, and plugs come from the plug set. The result is a 2D array where each inner array represents a perk column.

```typescript
const PERK_SOCKET_TYPE_HASHES = [1215804696, 1215804697, 3993098925];

function getPerks(itemDef, defs): Perk[][] {
  const sockets = itemDef.sockets?.socketEntries || [];
  const categories = itemDef.sockets?.socketCategories || [];
  const perkColumns: Perk[][] = [];

  // Find weapon perks category
  const perksCategory = categories.find(
    (c) => c.socketCategoryHash === 4241085061 // WeaponPerks
  );

  if (!perksCategory) return perkColumns;

  for (const socketIndex of perksCategory.socketIndexes) {
    const socket = sockets[socketIndex];
    if (!socket) continue;

    // Check if this is a perk socket
    if (!PERK_SOCKET_TYPE_HASHES.includes(socket.socketTypeHash)) continue;

    const perks: Perk[] = [];

    // Get perks from randomizedPlugSetHash or reusablePlugSetHash
    const plugSetHash = socket.randomizedPlugSetHash || socket.reusablePlugSetHash;

    if (plugSetHash) {
      const plugSet = defs.PlugSet[plugSetHash];
      if (plugSet) {
        for (const plug of plugSet.reusablePlugItems) {
          const plugDef = defs.InventoryItem[plug.plugItemHash];
          if (!plugDef || !plugDef.displayProperties.name) continue;

          perks.push({
            hash: plugDef.hash,
            name: plugDef.displayProperties.name,
            description: plugDef.displayProperties.description,
            itemType: plugDef.itemTypeDisplayName || "",
            iconSrc: plugDef.displayProperties.icon
              ? `https://www.bungie.net${plugDef.displayProperties.icon}`
              : null,
            isCurated: false, // Determined by comparing with curated rolls
            curatedExclusive: false,
            isDeprecated: !plug.currentlyCanRoll,
          });
        }
      }
    }

    if (perks.length > 0) {
      perkColumns.push(perks);
    }
  }

  return perkColumns;
}
```

### Curated Rolls

Curated rolls come from `reusablePlugItems` on the socket definition itself (not the plug set):

```typescript
function getCuratedPlugHashes(socket): Set<number> {
  const curated = new Set<number>();

  if (socket.reusablePlugItems?.length > 0) {
    for (const plug of socket.reusablePlugItems) {
      curated.add(plug.plugItemHash);
    }
  }

  return curated;
}
```

---

## Field Extraction: WeaponConcise

`WeaponConcise` is a trimmed version for lists. It contains:

- All scalar fields from `WeaponItem`
- `frame`: Just the intrinsic plug **name** (string)
- `perks`: Array of arrays of perk **names** (string[][])

```typescript
function toWeaponConcise(weaponFull: WeaponFull): WeaponConcise {
  return {
    ...weaponFull.item,
    frame: weaponFull.frame?.name ?? "",
    perks: weaponFull.perks.map((column) => column.data.map((perk) => perk.name)),
  };
}
```

---

## Helper Data Files

These supplementary data files from DIM can be downloaded to assist with extraction. They are generated from additional analysis and not directly in the manifest.

| File                       | Purpose                                                     |
| -------------------------- | ----------------------------------------------------------- |
| `craftable-hashes.json`    | Array of item hashes that are craftable                     |
| `watermark-to-season.json` | Maps icon watermark paths to season numbers                 |
| `watermark-to-event.json`  | Maps icon watermark paths to event enums                    |
| `source-to-season-v2.json` | Maps source hashes to season numbers                        |
| `d2-event-info-v2.ts`      | Event definitions with source hashes                        |
| `d2-season-info.ts`        | Season metadata (names, dates, power caps)                  |
| `extended-foundry.json`    | Item hash to foundry name mapping                           |
| `extended-breaker.json`    | Item hash to breaker type hash mapping                      |
| `empty-plug-hashes.ts`     | Known empty/default plug hashes                             |
| `generated-enums.ts`       | All hash constants (BucketHashes, ItemCategoryHashes, etc.) |

---

## Key Enums and Constants

### Tier Types

```typescript
enum TierType {
  Unknown = 0,
  Currency = 1,
  Basic = 2, // Common
  Common = 3, // Uncommon
  Rare = 4,
  Superior = 5, // Legendary
  Exotic = 6,
}
```

### Damage Types

```typescript
enum DestinyDamageType {
  None = 0,
  Kinetic = 1,
  Arc = 2,
  Solar = 3,
  Void = 4,
  Raid = 5,
  Stasis = 6,
  Strand = 7,
}
```

### Ammo Types

```typescript
enum DestinyAmmunitionType {
  None = 0,
  Primary = 1,
  Special = 2,
  Heavy = 3,
  Unknown = 4,
}
```

### Bucket Hashes

```typescript
enum BucketHashes {
  KineticWeapons = 1498876634,
  EnergyWeapons = 2465295065,
  PowerWeapons = 953998645,
  // ... other buckets
}
```

### Socket Category Hashes

```typescript
enum SocketCategoryHashes {
  IntrinsicTraits = 3956125808,
  WeaponPerks = 4241085061,
  WeaponMods = 2685412949,
  // ... others
}
```

### Item Category Hashes (Weapons)

```typescript
enum ItemCategoryHashes {
  Weapon = 1,
  Dummies = 3109687656,
  AutoRifle = 5,
  HandCannon = 6,
  PulseRifle = 7,
  ScoutRifle = 8,
  FusionRifle = 9,
  SniperRifle = 10,
  Shotgun = 11,
  MachineGun = 12,
  RocketLauncher = 13,
  Sidearm = 14,
  Sword = 54,
  GrenadeLaunchers = 153950757,
  LinearFusionRifles = 1504945536,
  SubmachineGun = 3954685534,
  TraceRifles = 2489664120,
  Bows = 3317538576,
  Glaives = 3871742104,
}
```

---

## Code Examples

### Complete WeaponItem Extraction

```typescript
function extractWeaponItem(itemDef, defs, helperData): WeaponItem {
  const collectible = Object.values(defs.Collectible).find((c) => c.itemHash === itemDef.hash);

  const bucketHash = itemDef.inventory?.bucketTypeHash;
  const watermark = itemDef.iconWatermark || itemDef.iconWatermarkShelved;

  return {
    hash: itemDef.hash,
    name: itemDef.displayProperties.name,
    flavorText: itemDef.flavorText || "",
    tierType: itemDef.inventory?.tierType ?? 0,
    itemType: itemDef.itemTypeDisplayName || "",
    damageType: defs.DamageType[itemDef.defaultDamageTypeHash]?.enumValue ?? 0,
    slot: getSlot(bucketHash),
    ammoType: itemDef.equippingBlock?.ammoType ?? 0,
    source: collectible?.sourceHash ?? null,
    iconSrc: prefixBungie(itemDef.displayProperties.icon),
    watermarkSrc: prefixBungie(itemDef.iconWatermark),
    watermarkFeaturedSrc: prefixBungie(itemDef.iconWatermarkFeatured),
    screenshotSrc: prefixBungie(itemDef.screenshot),
    foundrySrc: prefixBungie(itemDef.secondaryIcon),
    isCraftable: helperData.craftableHashes.includes(itemDef.hash),
    isAdept: itemDef.isAdept ?? false,
    isHolofoil: itemDef.isHolofoil ?? false,
    isFeatured: itemDef.isFeaturedItem ?? false,
    season: watermark ? (helperData.watermarkToSeason[watermark] ?? null) : null,
    event: getEvent(itemDef, helperData),
  };
}

function prefixBungie(path: string | undefined): string | null {
  return path ? `https://www.bungie.net${path}` : null;
}

function getSlot(bucketHash: number): number {
  switch (bucketHash) {
    case 1498876634:
      return 0;
    case 2465295065:
      return 1;
    case 953998645:
      return 2;
    default:
      return -1;
  }
}
```

### Full Pipeline

```typescript
async function extractAllWeapons() {
  // 1. Fetch manifest metadata
  const manifest = await fetchManifest();

  // 2. Fetch required tables
  const defs = await fetchDefinitionTables(manifest);

  // 3. Load helper data
  const helperData = await loadHelperData();

  // 4. Filter for weapons
  const weapons = Object.values(defs.InventoryItem).filter(isWeapon);

  // 5. Extract weapon data
  const weaponItems = weapons.map((w) => extractWeaponItem(w, defs, helperData));
  const weaponFulls = weapons.map((w) => extractWeaponFull(w, defs, helperData));
  const weaponConcises = weaponFulls.map(toWeaponConcise);

  return { weaponItems, weaponFulls, weaponConcises };
}
```

---

## Notes

1. **No Authentication Required**: The manifest endpoints are publicly accessible and require no API key or authentication.

2. **Caching**: The manifest changes with each game update. Cache based on the manifest version or path.

3. **Localization**: Use the appropriate language path from `jsonWorldComponentContentPaths` for localized strings.

4. **Rate Limiting**: Bungie APIs have rate limits. Batch your requests appropriately.

5. **Edge Cases**:
   - Some weapons may be classified/redacted and lack complete data
   - Exotic class items can have weapon-like sockets
   - Linear Fusion Rifles also have the Fusion Rifle category (filter it out)

6. **Enhanced Perks**: Enhanced versions of perks have different hashes. You can identify them by their plug category or the `trait-to-enhanced-trait.json` mapping.

7. **Deprecated Perks**: Check `currentlyCanRoll` in `PlugSet.reusablePlugItems` to know if a perk can still roll on new drops.
