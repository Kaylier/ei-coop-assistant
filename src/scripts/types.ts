/*
 * This file defines types and enums used in items, artifacts, stones and ingredients
 */
import type { EffectMap } from '@/scripts/artifacts.ts';

export enum ItemCategory {
    ARTIFACT,
    STONE,
    INGREDIENT,
};

export enum IngredientFamily {
    SOLAR_TITANIUM,
    TAU_CETI_GEODE,
    GOLD_METEORITE,
    //EXTRATERRESTRIAL_ALUMINUM,
    //ANCIENT_TUNGSTEN,
    //SPACE_ROCKS,
    //ALIEN_WOOD,
    //CENTAURIAN_STEEL,
    //ERIDANI_FEATHER,
    //DRONE_PARTS,
    //CELESTIAL_BRONZE,
    //LALANDE_HIDE,
};

export enum StoneFamily {
    PROPHECY_STONE,
    CLARITY_STONE,
    DILITHIUM_STONE,
    LIFE_STONE,
    QUANTUM_STONE,
    SOUL_STONE,
    TERRA_STONE,
    TACHYON_STONE,
    SHELL_STONE,
    LUNAR_STONE,
};

export enum ArtifactFamily {
    LIGHT_OF_EGGENDIL,
    BOOK_OF_BASAN,
    TACHYON_DEFLECTOR,
    SHIP_IN_A_BOTTLE,
    TITANIUM_ACTUATOR,
    DILITHIUM_MONOCLE,
    QUANTUM_METRONOME,
    PHOENIX_FEATHER,
    CHALICE,
    INTERSTELLAR_COMPASS,
    CARVED_RAINSTICK,
    BEAK_OF_MIDAS,
    MERCURYS_LENS,
    NEODYMIUM_MEDALLION,
    GUSSET,
    TUNGSTEN_ANKH,
    AURELIAN_BROOCH,
    VIAL_OF_MARTIAN_DUST,
    DEMETERS_NECKLACE,
    LUNAR_TOTEM,
    PUZZLE_CUBE,
};

export enum Rarity {
    COMMON = 0,
    RARE = 1,
    EPIC = 2,
    LEGENDARY = 3,
};

interface BaseItem {
    category: ItemCategory,
    quantity?: number,
    id?: number,
}

export type Ingredient = BaseItem & {
    category: ItemCategory.INGREDIENT,
    family: IngredientFamily,
    tier: number,
};

export type Stone = BaseItem & {
    category: ItemCategory.STONE,
    family: StoneFamily,
    tier: number,
    reslotted?: boolean,
};

export type Artifact = BaseItem & {
    category: ItemCategory.ARTIFACT,
    family: ArtifactFamily,
    tier: number,
    rarity: Rarity,
    stones: (Stone | null)[],
    reslotted?: number,
};

export type Item = Artifact | Stone | Ingredient;

export type ArtifactSet = {
    set: (Artifact | null)[],
    effects: EffectMap,
};


export type UserData = null | {
    items: Item[],
    sets: (Artifact | null)[][],
    proPermit: boolean,
    prophecyEggs: number,
    soulEggs: number,
    baseLayingRate: number,
    baseShippingRate: number,
    baseIHRate: number,
    awayIHBonus: number,
    baseEarningRate: number,
    awayEarningBonus: number,
    mrcbEarningBonus: number,
    prophecyEggBonus: number,
    soulEggBonus: number,
    date: Date,
};


export type ToggleSetting<T> = {
    parser: (arg0: string) => T,
    formatter?: (arg0: T) => string, // default to JSON.stringify if not specified
    localStorageKey?: string,
    value: T,
}


export enum DeflectorMode {
    NONE = "none",
    CONTRIBUTION = "contribution",
    TEAMWORK = "teamwork"
};


export enum AllowedGusset {
    ANY = "artifact-gusset-*-*",
    NONE= "artifact-gusset-0-0",
    T1C = "artifact-gusset-1-0",
    T2C = "artifact-gusset-2-0",
    T2E = "artifact-gusset-2-2",
    T3C = "artifact-gusset-3-0",
    T3R = "artifact-gusset-3-1",
    T4C = "artifact-gusset-4-0",
    T4E = "artifact-gusset-4-2",
    T4L = "artifact-gusset-4-3",
};

