
export enum ItemCategory {
    ARTIFACT,
    STONE,
    INGREDIENT
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
    LEGENDARY = 3
};

export type Ingredient = {
    category: ItemCategory.INGREDIENT,
    family: IngredientFamily,
    tier: number
};

export type Stone = {
    category: ItemCategory.STONE,
    family: StoneFamily,
    tier: number
};

export type Artifact = {
    category: ItemCategory.ARTIFACT,
    family: ArtifactFamily,
    tier: number,
    rarity: Rarity,
    stones: Stone[]
};

export type Item = (Artifact | Stone | Ingredient) & { quantity: number };

