import * as T from "./types.ts"



// Only revelant effects have been entered!
export const itemEffects = {

    "stone-prophecy_stone-1-common": {},
    "stone-prophecy_stone-2-common": {},
    "stone-prophecy_stone-3-common": {},
    "stone-prophecy_stone-4-common": {},

    "stone-clarity_stone-1-common": {},
    "stone-clarity_stone-2-common": {},
    "stone-clarity_stone-3-common": {},
    "stone-clarity_stone-4-common": {},

    "stone-dilithium_stone-1-common": {},
    "stone-dilithium_stone-2-common": {},
    "stone-dilithium_stone-3-common": {},
    "stone-dilithium_stone-4-common": {},

    "stone-life_stone-1-common": {},
    "stone-life_stone-2-common": {},
    "stone-life_stone-3-common": {},
    "stone-life_stone-4-common": {},

    "stone-quantum_stone-1-common": {},
    "stone-quantum_stone-2-common": { shippingBonus: 1.02 },
    "stone-quantum_stone-3-common": { shippingBonus: 1.04 },
    "stone-quantum_stone-4-common": { shippingBonus: 1.05 },

    "stone-soul_stone-1-common": {},
    "stone-soul_stone-2-common": {},
    "stone-soul_stone-3-common": {},
    "stone-soul_stone-4-common": {},

    "stone-terra_stone-1-common": {},
    "stone-terra_stone-2-common": {},
    "stone-terra_stone-3-common": {},
    "stone-terra_stone-4-common": {},

    "stone-tachyon_stone-1-common": {},
    "stone-tachyon_stone-2-common": { layingBonus: 1.02 },
    "stone-tachyon_stone-3-common": { layingBonus: 1.04 },
    "stone-tachyon_stone-4-common": { layingBonus: 1.05 },

    "stone-shell_stone-1-common": {},
    "stone-shell_stone-2-common": {},
    "stone-shell_stone-3-common": {},
    "stone-shell_stone-4-common": {},

    "stone-lunar_stone-1-common": {},
    "stone-lunar_stone-2-common": {},
    "stone-lunar_stone-3-common": {},
    "stone-lunar_stone-4-common": {},


    "artifact-light_of_eggendil-1-common": {},
    "artifact-light_of_eggendil-2-common": {},
    "artifact-light_of_eggendil-2-rare": {},
    "artifact-light_of_eggendil-3-common": {},
    "artifact-light_of_eggendil-3-rare": {},
    "artifact-light_of_eggendil-4-common": {},
    "artifact-light_of_eggendil-4-epic": {},
    "artifact-light_of_eggendil-4-legendary": {},

    "artifact-book_of_basan-1-common": {},
    "artifact-book_of_basan-2-common": {},
    "artifact-book_of_basan-3-common": {},
    "artifact-book_of_basan-3-epic": {},
    "artifact-book_of_basan-4-common": {},
    "artifact-book_of_basan-4-epic": {},
    "artifact-book_of_basan-4-legendary": {},

    "artifact-tachyon_deflector-1-common": { deflectorBonus: 0.05 },
    "artifact-tachyon_deflector-2-common": { deflectorBonus: 0.08 },
    "artifact-tachyon_deflector-3-common": { deflectorBonus: 0.12 },
    "artifact-tachyon_deflector-3-rare": { deflectorBonus: 0.13 },
    "artifact-tachyon_deflector-4-common": { deflectorBonus: 0.15 },
    "artifact-tachyon_deflector-4-rare": { deflectorBonus: 0.17 },
    "artifact-tachyon_deflector-4-epic": { deflectorBonus: 0.19 },
    "artifact-tachyon_deflector-4-legendary": { deflectorBonus: 0.20 },

    "artifact-ship_in_a_bottle-1-common": {},
    "artifact-ship_in_a_bottle-2-common": {},
    "artifact-ship_in_a_bottle-3-common": {},
    "artifact-ship_in_a_bottle-3-rare": {},
    "artifact-ship_in_a_bottle-4-common": {},
    "artifact-ship_in_a_bottle-4-rare": {},
    "artifact-ship_in_a_bottle-4-epic": {},
    "artifact-ship_in_a_bottle-4-legendary": {},

    "artifact-titanium_actuator-1-common": {},
    "artifact-titanium_actuator-2-common": {},
    "artifact-titanium_actuator-3-common": {},
    "artifact-titanium_actuator-3-rare": {},
    "artifact-titanium_actuator-4-common": {},
    "artifact-titanium_actuator-4-epic": {},
    "artifact-titanium_actuator-4-legendary": {},

    "artifact-dilithium_monocle-1-common": {},
    "artifact-dilithium_monocle-2-common": {},
    "artifact-dilithium_monocle-3-common": {},
    "artifact-dilithium_monocle-4-common": {},
    "artifact-dilithium_monocle-4-epic": {},
    "artifact-dilithium_monocle-4-legendary": {},

    "artifact-quantum_metronome-1-common"   : { layingBonus: 1.05 },
    "artifact-quantum_metronome-2-common"   : { layingBonus: 1.10 },
    "artifact-quantum_metronome-2-rare"     : { layingBonus: 1.12 },
    "artifact-quantum_metronome-3-common"   : { layingBonus: 1.15 },
    "artifact-quantum_metronome-3-rare"     : { layingBonus: 1.17 },
    "artifact-quantum_metronome-3-epic"     : { layingBonus: 1.20 },
    "artifact-quantum_metronome-4-common"   : { layingBonus: 1.25 },
    "artifact-quantum_metronome-4-rare"     : { layingBonus: 1.27 },
    "artifact-quantum_metronome-4-epic"     : { layingBonus: 1.30 },
    "artifact-quantum_metronome-4-legendary": { layingBonus: 1.35 },

    "artifact-phoenix_feather-1-common": {},
    "artifact-phoenix_feather-2-common": {},
    "artifact-phoenix_feather-3-common": {},
    "artifact-phoenix_feather-3-rare": {},
    "artifact-phoenix_feather-4-common": {},
    "artifact-phoenix_feather-4-rare": {},
    "artifact-phoenix_feather-4-legendary": {},

    "artifact-the_chalice-1-common": {},
    "artifact-the_chalice-2-common": {},
    "artifact-the_chalice-2-epic": {},
    "artifact-the_chalice-3-common": {},
    "artifact-the_chalice-3-rare": {},
    "artifact-the_chalice-3-epic": {},
    "artifact-the_chalice-4-common": {},
    "artifact-the_chalice-4-epic": {},
    "artifact-the_chalice-4-legendary": {},

    "artifact-interstellar_compass-1-common"   : { shippingBonus: 1.05 },
    "artifact-interstellar_compass-2-common"   : { shippingBonus: 1.10 },
    "artifact-interstellar_compass-3-common"   : { shippingBonus: 1.20 },
    "artifact-interstellar_compass-3-rare"     : { shippingBonus: 1.22 },
    "artifact-interstellar_compass-4-common"   : { shippingBonus: 1.30 },
    "artifact-interstellar_compass-4-rare"     : { shippingBonus: 1.35 },
    "artifact-interstellar_compass-4-epic"     : { shippingBonus: 1.40 },
    "artifact-interstellar_compass-4-legendary": { shippingBonus: 1.50 },

    "artifact-carved_rainstick-1-common": {},
    "artifact-carved_rainstick-2-common": {},
    "artifact-carved_rainstick-3-common": {},
    "artifact-carved_rainstick-4-common": {},
    "artifact-carved_rainstick-4-epic": {},
    "artifact-carved_rainstick-4-legendary": {},

    "artifact-beak_of_midas-1-common": {},
    "artifact-beak_of_midas-2-common": {},
    "artifact-beak_of_midas-3-common": {},
    "artifact-beak_of_midas-3-rare": {},
    "artifact-beak_of_midas-4-common": {},
    "artifact-beak_of_midas-4-rare": {},
    "artifact-beak_of_midas-4-legendary": {},

    "artifact-mercurys_lens-1-common": {},
    "artifact-mercurys_lens-2-common": {},
    "artifact-mercurys_lens-2-rare": {},
    "artifact-mercurys_lens-3-common": {},
    "artifact-mercurys_lens-3-rare": {},
    "artifact-mercurys_lens-4-common": {},
    "artifact-mercurys_lens-4-rare": {},
    "artifact-mercurys_lens-4-epic": {},
    "artifact-mercurys_lens-4-legendary": {},

    "artifact-neodymium_medallion-1-common": {},
    "artifact-neodymium_medallion-2-common": {},
    "artifact-neodymium_medallion-2-rare": {},
    "artifact-neodymium_medallion-3-common": {},
    "artifact-neodymium_medallion-3-epic": {},
    "artifact-neodymium_medallion-4-common": {},
    "artifact-neodymium_medallion-4-rare": {},
    "artifact-neodymium_medallion-4-epic": {},
    "artifact-neodymium_medallion-4-legendary": {},

    "artifact-ornate_gusset-1-common"   : { habCapacityBonus: 1.05 },
    "artifact-ornate_gusset-2-common"   : { habCapacityBonus: 1.10 },
    "artifact-ornate_gusset-2-epic"     : { habCapacityBonus: 1.12 },
    "artifact-ornate_gusset-3-common"   : { habCapacityBonus: 1.15 },
    "artifact-ornate_gusset-3-rare"     : { habCapacityBonus: 1.16 },
    "artifact-ornate_gusset-4-common"   : { habCapacityBonus: 1.20 },
    "artifact-ornate_gusset-4-epic"     : { habCapacityBonus: 1.22 },
    "artifact-ornate_gusset-4-legendary": { habCapacityBonus: 1.25 },

    "artifact-tungsten_ankh-1-common": {},
    "artifact-tungsten_ankh-2-common": {},
    "artifact-tungsten_ankh-2-rare": {},
    "artifact-tungsten_ankh-3-common": {},
    "artifact-tungsten_ankh-3-rare": {},
    "artifact-tungsten_ankh-3-legendary": {},
    "artifact-tungsten_ankh-4-common": {},
    "artifact-tungsten_ankh-4-rare": {},
    "artifact-tungsten_ankh-4-legendary": {},

    "artifact-aurelian_brooch-1-common": {},
    "artifact-aurelian_brooch-2-common": {},
    "artifact-aurelian_brooch-3-common": {},
    "artifact-aurelian_brooch-3-rare": {},
    "artifact-aurelian_brooch-3-epic": {},
    "artifact-aurelian_brooch-4-common": {},
    "artifact-aurelian_brooch-4-rare": {},
    "artifact-aurelian_brooch-4-epic": {},
    "artifact-aurelian_brooch-4-legendary": {},

    "artifact-vial_martian_dust-1-common": {},
    "artifact-vial_martian_dust-2-common": {},
    "artifact-vial_martian_dust-2-rare": {},
    "artifact-vial_martian_dust-3-common": {},
    "artifact-vial_martian_dust-3-epic": {},
    "artifact-vial_martian_dust-4-common": {},
    "artifact-vial_martian_dust-4-rare": {},
    "artifact-vial_martian_dust-4-legendary": {},

    "artifact-demeters_necklace-1-common": {},
    "artifact-demeters_necklace-2-common": {},
    "artifact-demeters_necklace-2-rare": {},
    "artifact-demeters_necklace-3-common": {},
    "artifact-demeters_necklace-3-rare": {},
    "artifact-demeters_necklace-3-epic": {},
    "artifact-demeters_necklace-4-common": {},
    "artifact-demeters_necklace-4-rare": {},
    "artifact-demeters_necklace-4-epic": {},
    "artifact-demeters_necklace-4-legendary": {},

    "artifact-lunar_totem-1-common": {},
    "artifact-lunar_totem-2-common": {},
    "artifact-lunar_totem-2-rare": {},
    "artifact-lunar_totem-3-common": {},
    "artifact-lunar_totem-3-rare": {},
    "artifact-lunar_totem-4-common": {},
    "artifact-lunar_totem-4-rare": {},
    "artifact-lunar_totem-4-epic": {},
    "artifact-lunar_totem-4-legendary": {},

    "artifact-puzzle_cube-1-common": {},
    "artifact-puzzle_cube-2-common": {},
    "artifact-puzzle_cube-2-epic": {},
    "artifact-puzzle_cube-3-common": {},
    "artifact-puzzle_cube-3-rare": {},
    "artifact-puzzle_cube-4-common": {},
    "artifact-puzzle_cube-4-rare": {},
    "artifact-puzzle_cube-4-epic": {},
    "artifact-puzzle_cube-4-legendary": {},
};


/**
 * Retrieve a standard key of an item.
 * This key is used in various places such as mappings (see above) or image filenames.
 */
export function getKey(item: T.Item): string {
    const categoryLabel = T.ItemCategory[item.category];
    const familyLabel = {
        [T.ItemCategory.ARTIFACT]: T.ArtifactFamily[item.family],
        [T.ItemCategory.STONE]: T.StoneFamily[item.family],
        [T.ItemCategory.INGREDIENT]: T.IngredientFamily[item.family],
    }[item.category];
    if (!familyLabel) {
        console.error("Unknown item:", item);
        throw new Error(`Unknown item`);
    }

    const rarityLabel = T.Rarity[item.rarity] ?? T.Rarity[T.Rarity.COMMON];

    return `${categoryLabel}-${familyLabel}-${item.tier}-${rarityLabel}`.toLowerCase();
}

/**
 * Retrieves the bonus values for the given item.
 * If the item contains stones, recursively compound their effects.
 * If a certain bonus does not appear, the caller must handle the default value.
 * @returns An object with every bonus values
 */
export function getBonus(item: T.Item) {
    const key = getKey(item);
    let bonus = Object.assign({}, itemEffects[key]);

    // Handle stones
    if (item.stones) {
        for (const stone of item.stones) {
            const stoneBonus = getBonus(stone);
            for (const key in stoneBonus) {
                bonus[key] = (bonus[key] ?? 1)*stoneBonus[key]
            }
        }
    }

    // The order of the multiplication may lead to slightly different result.
    // It matters (marginally) for some future applications like sorting in minmax.
    for (const key in bonus)
        bonus[key] = Math.round(bonus[key]*1e10)/1e10;

    return bonus;
}


/**
 * Returns a readable name of the item.
 */
export function getName(item: T.Item) {
    const categoryLabel = T.ItemCategory[item.category];

    const familyLabel = {
        [T.ItemCategory.ARTIFACT]: T.ArtifactFamily[item.family],
        [T.ItemCategory.STONE]: T.StoneFamily[item.family],
        [T.ItemCategory.INGREDIENT]: T.IngredientFamily[item.family],
    }[item.category];

    if (!familyLabel) throw new Error("Unknown item category");

    const rarityLabel = T.Rarity[item.rarity] ?? T.Rarity[T.Rarity.COMMON];

    return familyLabel.toLowerCase().replace(/_/, ' ')+` T${item.tier}${rarityLabel[0]}`;
}


/**
 * Mapping between my keys and filenames used in image name
 */
const itemImgMap = {
    "ingredient-solar_titanium-1": "afx_solar_titanium_1.png",
    "ingredient-solar_titanium-2": "afx_solar_titanium_2.png",
    "ingredient-solar_titanium-3": "afx_solar_titanium_3.png",
    "ingredient-tau_ceti_geode-1": "afx_tau_ceti_geode_1.png",
    "ingredient-tau_ceti_geode-2": "afx_tau_ceti_geode_2.png",
    "ingredient-tau_ceti_geode-3": "afx_tau_ceti_geode_3.png",
    "ingredient-gold_meteorite-1": "afx_gold_meteorite_1.png",
    "ingredient-gold_meteorite-2": "afx_gold_meteorite_2.png",
    "ingredient-gold_meteorite-3": "afx_gold_meteorite_3.png",
    "stone-prophecy_stone-1": "afx_prophecy_stone_1.png",
    "stone-prophecy_stone-2": "afx_prophecy_stone_2.png",
    "stone-prophecy_stone-3": "afx_prophecy_stone_3.png",
    "stone-prophecy_stone-4": "afx_prophecy_stone_4.png",
    "stone-clarity_stone-1": "afx_clarity_stone_1.png",
    "stone-clarity_stone-2": "afx_clarity_stone_2.png",
    "stone-clarity_stone-3": "afx_clarity_stone_3.png",
    "stone-clarity_stone-4": "afx_clarity_stone_4.png",
    "stone-dilithium_stone-1": "afx_dilithium_stone_1.png",
    "stone-dilithium_stone-2": "afx_dilithium_stone_2.png",
    "stone-dilithium_stone-3": "afx_dilithium_stone_3.png",
    "stone-dilithium_stone-4": "afx_dilithium_stone_4.png",
    "stone-life_stone-1": "afx_life_stone_1.png",
    "stone-life_stone-2": "afx_life_stone_2.png",
    "stone-life_stone-3": "afx_life_stone_3.png",
    "stone-life_stone-4": "afx_life_stone_4.png",
    "stone-quantum_stone-1": "afx_quantum_stone_1.png",
    "stone-quantum_stone-2": "afx_quantum_stone_2.png",
    "stone-quantum_stone-3": "afx_quantum_stone_3.png",
    "stone-quantum_stone-4": "afx_quantum_stone_4.png",
    "stone-soul_stone-1": "afx_soul_stone_1.png",
    "stone-soul_stone-2": "afx_soul_stone_2.png",
    "stone-soul_stone-3": "afx_soul_stone_3.png",
    "stone-soul_stone-4": "afx_soul_stone_4.png",
    "stone-terra_stone-1": "afx_terra_stone_1.png",
    "stone-terra_stone-2": "afx_terra_stone_2.png",
    "stone-terra_stone-3": "afx_terra_stone_3.png",
    "stone-terra_stone-4": "afx_terra_stone_4.png",
    "stone-tachyon_stone-1": "afx_tachyon_stone_1.png",
    "stone-tachyon_stone-2": "afx_tachyon_stone_2.png",
    "stone-tachyon_stone-3": "afx_tachyon_stone_3.png",
    "stone-tachyon_stone-4": "afx_tachyon_stone_4.png",
    "stone-shell_stone-1": "afx_shell_stone_1.png",
    "stone-shell_stone-2": "afx_shell_stone_2.png",
    "stone-shell_stone-3": "afx_shell_stone_3.png",
    "stone-shell_stone-4": "afx_shell_stone_4.png",
    "stone-lunar_stone-1": "afx_lunar_stone_1.png",
    "stone-lunar_stone-2": "afx_lunar_stone_2.png",
    "stone-lunar_stone-3": "afx_lunar_stone_3.png",
    "stone-lunar_stone-4": "afx_lunar_stone_4.png",
    "artifact-light_of_eggendil-1": "afx_light_eggendil_1.png",
    "artifact-light_of_eggendil-2": "afx_light_eggendil_2.png",
    "artifact-light_of_eggendil-3": "afx_light_eggendil_3.png",
    "artifact-light_of_eggendil-4": "afx_light_eggendil_4.png",
    "artifact-book_of_basan-1": "afx_book_of_basan_1.png",
    "artifact-book_of_basan-2": "afx_book_of_basan_2.png",
    "artifact-book_of_basan-3": "afx_book_of_basan_3.png",
    "artifact-book_of_basan-4": "afx_book_of_basan_4.png",
    "artifact-tachyon_deflector-1": "afx_tachyon_deflector_1.png",
    "artifact-tachyon_deflector-2": "afx_tachyon_deflector_2.png",
    "artifact-tachyon_deflector-3": "afx_tachyon_deflector_3.png",
    "artifact-tachyon_deflector-4": "afx_tachyon_deflector_4.png",
    "artifact-ship_in_a_bottle-1": "afx_ship_in_a_bottle_1.png",
    "artifact-ship_in_a_bottle-2": "afx_ship_in_a_bottle_2.png",
    "artifact-ship_in_a_bottle-3": "afx_ship_in_a_bottle_3.png",
    "artifact-ship_in_a_bottle-4": "afx_ship_in_a_bottle_4.png",
    "artifact-titanium_actuator-1": "afx_titanium_actuator_1.png",
    "artifact-titanium_actuator-2": "afx_titanium_actuator_2.png",
    "artifact-titanium_actuator-3": "afx_titanium_actuator_3.png",
    "artifact-titanium_actuator-4": "afx_titanium_actuator_4.png",
    "artifact-dilithium_monocle-1": "afx_dilithium_monocle_1.png",
    "artifact-dilithium_monocle-2": "afx_dilithium_monocle_2.png",
    "artifact-dilithium_monocle-3": "afx_dilithium_monocle_3.png",
    "artifact-dilithium_monocle-4": "afx_dilithium_monocle_4.png",
    "artifact-quantum_metronome-1": "afx_quantum_metronome_1.png",
    "artifact-quantum_metronome-2": "afx_quantum_metronome_2.png",
    "artifact-quantum_metronome-3": "afx_quantum_metronome_3.png",
    "artifact-quantum_metronome-4": "afx_quantum_metronome_4.png",
    "artifact-phoenix_feather-1": "afx_phoenix_feather_1.png",
    "artifact-phoenix_feather-2": "afx_phoenix_feather_2.png",
    "artifact-phoenix_feather-3": "afx_phoenix_feather_3.png",
    "artifact-phoenix_feather-4": "afx_phoenix_feather_4.png",
    "artifact-the_chalice-1": "afx_the_chalice_1.png",
    "artifact-the_chalice-2": "afx_the_chalice_2.png",
    "artifact-the_chalice-3": "afx_the_chalice_3.png",
    "artifact-the_chalice-4": "afx_the_chalice_4.png",
    "artifact-interstellar_compass-1": "afx_interstellar_compass_1.png",
    "artifact-interstellar_compass-2": "afx_interstellar_compass_2.png",
    "artifact-interstellar_compass-3": "afx_interstellar_compass_3.png",
    "artifact-interstellar_compass-4": "afx_interstellar_compass_4.png",
    "artifact-carved_rainstick-1": "afx_carved_rainstick_1.png",
    "artifact-carved_rainstick-2": "afx_carved_rainstick_2.png",
    "artifact-carved_rainstick-3": "afx_carved_rainstick_3.png",
    "artifact-carved_rainstick-4": "afx_carved_rainstick_4.png",
    "artifact-beak_of_midas-1": "afx_beak_of_midas_1.png",
    "artifact-beak_of_midas-2": "afx_beak_of_midas_2.png",
    "artifact-beak_of_midas-3": "afx_beak_of_midas_3.png",
    "artifact-beak_of_midas-4": "afx_beak_of_midas_4.png",
    "artifact-mercurys_lens-1": "afx_mercurys_lens_1.png",
    "artifact-mercurys_lens-2": "afx_mercurys_lens_2.png",
    "artifact-mercurys_lens-3": "afx_mercurys_lens_3.png",
    "artifact-mercurys_lens-4": "afx_mercurys_lens_4.png",
    "artifact-neodymium_medallion-1": "afx_neo_medallion_1.png",
    "artifact-neodymium_medallion-2": "afx_neo_medallion_2.png",
    "artifact-neodymium_medallion-3": "afx_neo_medallion_3.png",
    "artifact-neodymium_medallion-4": "afx_neo_medallion_4.png",
    "artifact-ornate_gusset-1": "afx_ornate_gusset_1.png",
    "artifact-ornate_gusset-2": "afx_ornate_gusset_2.png",
    "artifact-ornate_gusset-3": "afx_ornate_gusset_3.png",
    "artifact-ornate_gusset-4": "afx_ornate_gusset_4.png",
    "artifact-tungsten_ankh-1": "afx_tungsten_ankh_1.png",
    "artifact-tungsten_ankh-2": "afx_tungsten_ankh_2.png",
    "artifact-tungsten_ankh-3": "afx_tungsten_ankh_3.png",
    "artifact-tungsten_ankh-4": "afx_tungsten_ankh_4.png",
    "artifact-aurelian_brooch-1": "afx_aurelian_brooch_1.png",
    "artifact-aurelian_brooch-2": "afx_aurelian_brooch_2.png",
    "artifact-aurelian_brooch-3": "afx_aurelian_brooch_3.png",
    "artifact-aurelian_brooch-4": "afx_aurelian_brooch_4.png",
    "artifact-vial_martian_dust-1": "afx_vial_martian_dust_1.png",
    "artifact-vial_martian_dust-2": "afx_vial_martian_dust_2.png",
    "artifact-vial_martian_dust-3": "afx_vial_martian_dust_3.png",
    "artifact-vial_martian_dust-4": "afx_vial_martian_dust_4.png",
    "artifact-demeters_necklace-1": "afx_demeters_necklace_1.png",
    "artifact-demeters_necklace-2": "afx_demeters_necklace_2.png",
    "artifact-demeters_necklace-3": "afx_demeters_necklace_3.png",
    "artifact-demeters_necklace-4": "afx_demeters_necklace_4.png",
    "artifact-lunar_totem-1": "afx_lunar_totem_1.png",
    "artifact-lunar_totem-2": "afx_lunar_totem_2.png",
    "artifact-lunar_totem-3": "afx_lunar_totem_3.png",
    "artifact-lunar_totem-4": "afx_lunar_totem_4.png",
    "artifact-puzzle_cube-1": "afx_puzzle_cube_1.png",
    "artifact-puzzle_cube-2": "afx_puzzle_cube_2.png",
    "artifact-puzzle_cube-3": "afx_puzzle_cube_3.png",
    "artifact-puzzle_cube-4": "afx_puzzle_cube_4.png",
}

/**
 * Retrieves the image source path for the given item.
 */
export function getImgSrc(item: T.Item) {
    let key = getKey(item);
    key = key.substring(0, key.lastIndexOf('-'));
    //return `https://www.auxbrain.com/dlc/artifacts/1/${itemImgMap[key]}`;
    return `/img/items/${key}.png`;
}



