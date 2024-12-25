import * as T from './types.ts'
import { getKey, itemEffects } from './artifacts.ts'


//const ENDPOINT = "https://ctx-dot-auxbrainhome.appspot.com";
const ENDPOINT = "http://0.0.0.0:8080/?url=https://ctx-dot-auxbrainhome.appspot.com";



/**
 * Convert an ArtifactSpec proto object to an Item typescript object
 */
function getItemFromSpec(spec, proto): T.Item {

    const eiName = proto.lookupEnum('ei.ArtifactSpec.Name');
    const eiLevel = proto.lookupEnum('ei.ArtifactSpec.Level');
    const eiRarity = proto.lookupEnum('ei.ArtifactSpec.Rarity');

    const categoryMap = {
        [eiName.values.LUNAR_TOTEM]: T.ItemCategory.ARTIFACT,
        [eiName.values.NEODYMIUM_MEDALLION]: T.ItemCategory.ARTIFACT,
        [eiName.values.BEAK_OF_MIDAS]: T.ItemCategory.ARTIFACT,
        [eiName.values.LIGHT_OF_EGGENDIL]: T.ItemCategory.ARTIFACT,
        [eiName.values.DEMETERS_NECKLACE]: T.ItemCategory.ARTIFACT,
        [eiName.values.VIAL_MARTIAN_DUST]: T.ItemCategory.ARTIFACT,
        [eiName.values.ORNATE_GUSSET]: T.ItemCategory.ARTIFACT,
        [eiName.values.THE_CHALICE]: T.ItemCategory.ARTIFACT,
        [eiName.values.BOOK_OF_BASAN]: T.ItemCategory.ARTIFACT,
        [eiName.values.PHOENIX_FEATHER]: T.ItemCategory.ARTIFACT,
        [eiName.values.TUNGSTEN_ANKH]: T.ItemCategory.ARTIFACT,
        [eiName.values.AURELIAN_BROOCH]: T.ItemCategory.ARTIFACT,
        [eiName.values.CARVED_RAINSTICK]: T.ItemCategory.ARTIFACT,
        [eiName.values.PUZZLE_CUBE]: T.ItemCategory.ARTIFACT,
        [eiName.values.QUANTUM_METRONOME]: T.ItemCategory.ARTIFACT,
        [eiName.values.SHIP_IN_A_BOTTLE]: T.ItemCategory.ARTIFACT,
        [eiName.values.TACHYON_DEFLECTOR]: T.ItemCategory.ARTIFACT,
        [eiName.values.INTERSTELLAR_COMPASS]: T.ItemCategory.ARTIFACT,
        [eiName.values.DILITHIUM_MONOCLE]: T.ItemCategory.ARTIFACT,
        [eiName.values.TITANIUM_ACTUATOR]: T.ItemCategory.ARTIFACT,
        [eiName.values.MERCURYS_LENS]: T.ItemCategory.ARTIFACT,
        [eiName.values.TACHYON_STONE]: T.ItemCategory.STONE,
        [eiName.values.DILITHIUM_STONE]: T.ItemCategory.STONE,
        [eiName.values.SHELL_STONE]: T.ItemCategory.STONE,
        [eiName.values.LUNAR_STONE]: T.ItemCategory.STONE,
        [eiName.values.SOUL_STONE]: T.ItemCategory.STONE,
        [eiName.values.PROPHECY_STONE]: T.ItemCategory.STONE,
        [eiName.values.QUANTUM_STONE]: T.ItemCategory.STONE,
        [eiName.values.TERRA_STONE]: T.ItemCategory.STONE,
        [eiName.values.LIFE_STONE]: T.ItemCategory.STONE,
        [eiName.values.CLARITY_STONE]: T.ItemCategory.STONE,
        //[eiName.values.EXTRATERRESTRIAL_ALUMINUM]: T.ItemCategory.INGREDIENT,
        //[eiName.values.ANCIENT_TUNGSTEN]: T.ItemCategory.INGREDIENT,
        //[eiName.values.SPACE_ROCKS]: T.ItemCategory.INGREDIENT,
        //[eiName.values.ALIEN_WOOD]: T.ItemCategory.INGREDIENT,
        [eiName.values.GOLD_METEORITE]: T.ItemCategory.INGREDIENT,
        [eiName.values.TAU_CETI_GEODE]: T.ItemCategory.INGREDIENT,
        //[eiName.values.CENTAURIAN_STEEL]: T.ItemCategory.INGREDIENT,
        //[eiName.values.ERIDANI_FEATHER]: T.ItemCategory.INGREDIENT,
        //[eiName.values.DRONE_PARTS]: T.ItemCategory.INGREDIENT,
        //[eiName.values.CELESTIAL_BRONZE]: T.ItemCategory.INGREDIENT,
        //[eiName.values.LALANDE_HIDE]: T.ItemCategory.INGREDIENT,
        [eiName.values.SOLAR_TITANIUM]: T.ItemCategory.INGREDIENT,
        [eiName.values.TACHYON_STONE_FRAGMENT]: T.ItemCategory.STONE,
        [eiName.values.DILITHIUM_STONE_FRAGMENT]: T.ItemCategory.STONE,
        [eiName.values.SHELL_STONE_FRAGMENT]: T.ItemCategory.STONE,
        [eiName.values.LUNAR_STONE_FRAGMENT]: T.ItemCategory.STONE,
        [eiName.values.SOUL_STONE_FRAGMENT]: T.ItemCategory.STONE,
        [eiName.values.PROPHECY_STONE_FRAGMENT]: T.ItemCategory.STONE,
        [eiName.values.QUANTUM_STONE_FRAGMENT]: T.ItemCategory.STONE,
        [eiName.values.TERRA_STONE_FRAGMENT]: T.ItemCategory.STONE,
        [eiName.values.LIFE_STONE_FRAGMENT]: T.ItemCategory.STONE,
        [eiName.values.CLARITY_STONE_FRAGMENT]: T.ItemCategory.STONE,
        //[eiName.values.UNKNOWN]: ,
    };

    const fragmentMap = {
        [eiName.values.TACHYON_STONE_FRAGMENT]: true,
        [eiName.values.DILITHIUM_STONE_FRAGMENT]: true,
        [eiName.values.SHELL_STONE_FRAGMENT]: true,
        [eiName.values.LUNAR_STONE_FRAGMENT]: true,
        [eiName.values.SOUL_STONE_FRAGMENT]: true,
        [eiName.values.PROPHECY_STONE_FRAGMENT]: true,
        [eiName.values.QUANTUM_STONE_FRAGMENT]: true,
        [eiName.values.TERRA_STONE_FRAGMENT]: true,
        [eiName.values.LIFE_STONE_FRAGMENT]: true,
        [eiName.values.CLARITY_STONE_FRAGMENT]: true,
    };

    const familyMap = {
        [eiName.values.LUNAR_TOTEM]: T.ArtifactFamily.LUNAR_TOTEM,
        [eiName.values.NEODYMIUM_MEDALLION]: T.ArtifactFamily.NEODYMIUM_MEDALLION,
        [eiName.values.BEAK_OF_MIDAS]: T.ArtifactFamily.BEAK_OF_MIDAS,
        [eiName.values.LIGHT_OF_EGGENDIL]: T.ArtifactFamily.LIGHT_OF_EGGENDIL,
        [eiName.values.DEMETERS_NECKLACE]: T.ArtifactFamily.DEMETERS_NECKLACE,
        [eiName.values.VIAL_MARTIAN_DUST]: T.ArtifactFamily.VIAL_MARTIAN_DUST,
        [eiName.values.ORNATE_GUSSET]: T.ArtifactFamily.ORNATE_GUSSET,
        [eiName.values.THE_CHALICE]: T.ArtifactFamily.THE_CHALICE,
        [eiName.values.BOOK_OF_BASAN]: T.ArtifactFamily.BOOK_OF_BASAN,
        [eiName.values.PHOENIX_FEATHER]: T.ArtifactFamily.PHOENIX_FEATHER,
        [eiName.values.TUNGSTEN_ANKH]: T.ArtifactFamily.TUNGSTEN_ANKH,
        [eiName.values.AURELIAN_BROOCH]: T.ArtifactFamily.AURELIAN_BROOCH,
        [eiName.values.CARVED_RAINSTICK]: T.ArtifactFamily.CARVED_RAINSTICK,
        [eiName.values.PUZZLE_CUBE]: T.ArtifactFamily.PUZZLE_CUBE,
        [eiName.values.QUANTUM_METRONOME]: T.ArtifactFamily.QUANTUM_METRONOME,
        [eiName.values.SHIP_IN_A_BOTTLE]: T.ArtifactFamily.SHIP_IN_A_BOTTLE,
        [eiName.values.TACHYON_DEFLECTOR]: T.ArtifactFamily.TACHYON_DEFLECTOR,
        [eiName.values.INTERSTELLAR_COMPASS]: T.ArtifactFamily.INTERSTELLAR_COMPASS,
        [eiName.values.DILITHIUM_MONOCLE]: T.ArtifactFamily.DILITHIUM_MONOCLE,
        [eiName.values.TITANIUM_ACTUATOR]: T.ArtifactFamily.TITANIUM_ACTUATOR,
        [eiName.values.MERCURYS_LENS]: T.ArtifactFamily.MERCURYS_LENS,
        [eiName.values.TACHYON_STONE]: T.StoneFamily.TACHYON_STONE,
        [eiName.values.DILITHIUM_STONE]: T.StoneFamily.DILITHIUM_STONE,
        [eiName.values.SHELL_STONE]: T.StoneFamily.SHELL_STONE,
        [eiName.values.LUNAR_STONE]: T.StoneFamily.LUNAR_STONE,
        [eiName.values.SOUL_STONE]: T.StoneFamily.SOUL_STONE,
        [eiName.values.PROPHECY_STONE]: T.StoneFamily.PROPHECY_STONE,
        [eiName.values.QUANTUM_STONE]: T.StoneFamily.QUANTUM_STONE,
        [eiName.values.TERRA_STONE]: T.StoneFamily.TERRA_STONE,
        [eiName.values.LIFE_STONE]: T.StoneFamily.LIFE_STONE,
        [eiName.values.CLARITY_STONE]: T.StoneFamily.CLARITY_STONE,
        //[eiName.values.EXTRATERRESTRIAL_ALUMINUM]: T.IngredientFamily.EXTRATERRESTRIAL_ALUMINUM,
        //[eiName.values.ANCIENT_TUNGSTEN]: T.IngredientFamily.ANCIENT_TUNGSTEN,
        //[eiName.values.SPACE_ROCKS]: T.IngredientFamily.SPACE_ROCKS,
        //[eiName.values.ALIEN_WOOD]: T.IngredientFamily.ALIEN_WOOD,
        [eiName.values.GOLD_METEORITE]: T.IngredientFamily.GOLD_METEORITE,
        [eiName.values.TAU_CETI_GEODE]: T.IngredientFamily.TAU_CETI_GEODE,
        //[eiName.values.CENTAURIAN_STEEL]: T.IngredientFamily.CENTAURIAN_STEEL,
        //[eiName.values.ERIDANI_FEATHER]: T.IngredientFamily.ERIDANI_FEATHER,
        //[eiName.values.DRONE_PARTS]: T.IngredientFamily.DRONE_PARTS,
        //[eiName.values.CELESTIAL_BRONZE]: T.IngredientFamily.CELESTIAL_BRONZE,
        //[eiName.values.LALANDE_HIDE]: T.IngredientFamily.LALANDE_HIDE,
        [eiName.values.SOLAR_TITANIUM]: T.IngredientFamily.SOLAR_TITANIUM,
        [eiName.values.TACHYON_STONE_FRAGMENT]: T.StoneFamily.TACHYON_STONE,
        [eiName.values.DILITHIUM_STONE_FRAGMENT]: T.StoneFamily.DILITHIUM_STONE,
        [eiName.values.SHELL_STONE_FRAGMENT]: T.StoneFamily.SHELL_STONE,
        [eiName.values.LUNAR_STONE_FRAGMENT]: T.StoneFamily.LUNAR_STONE,
        [eiName.values.SOUL_STONE_FRAGMENT]: T.StoneFamily.SOUL_STONE,
        [eiName.values.PROPHECY_STONE_FRAGMENT]: T.StoneFamily.PROPHECY_STONE,
        [eiName.values.QUANTUM_STONE_FRAGMENT]: T.StoneFamily.QUANTUM_STONE,
        [eiName.values.TERRA_STONE_FRAGMENT]: T.StoneFamily.TERRA_STONE,
        [eiName.values.LIFE_STONE_FRAGMENT]: T.StoneFamily.LIFE_STONE,
        [eiName.values.CLARITY_STONE_FRAGMENT]: T.StoneFamily.CLARITY_STONE,
        //[eiName.values.UNKNOWN]: ,
    };

    const tierMap = {
        [eiLevel.values.INFERIOR]: 0,
        [eiLevel.values.LESSER]: 1,
        [eiLevel.values.NORMAL]: 2,
        [eiLevel.values.GREATER]: 3,
        [eiLevel.values.SUPERIOR]: 4,
    };

    const rarityMap = {
        [eiRarity.values.COMMON]: 0,
        [eiRarity.values.RARE]: 1,
        [eiRarity.values.EPIC]: 2,
        [eiRarity.values.LEGENDARY]: 3,
    };



    const category = categoryMap[spec.name];
    if (category === undefined)
        throw Error(`Unknown category for name: ${spec.name}`);

    const fragment = fragmentMap[spec.name] ?? false;

    const family = familyMap[spec.name];
    if (family === undefined)
        throw new Error(`Unknown family for name: ${spec.name}`);

    const tier = tierMap[spec.level];
    if (tier === undefined)
        throw new Error(`Unknown tier: ${spec.level}`);

    const rarity = rarityMap[spec.rarity];
    if (rarity === undefined)
        throw new Error(`Unknown rarity: ${spec.rarity}`);

    const item = { category, family };

    switch (category) {
        case T.ItemCategory.ARTIFACT:
            item.tier = tier+1;
            item.rarity = rarity;
            return item as T.Artifact;
        case T.ItemCategory.STONE:
            if (rarity !== T.Rarity.COMMON)
                console.warn("A stone with rarity has been found: ", stone);
            if (fragment && tier != 0)
                console.warn("A fragment is not tier 0");
            item.tier = fragment ? 1 : tier+2;
            return item as T.Stone;
        case T.ItemCategory.INGREDIENT:
            if (rarity !== T.Rarity.COMMON)
                console.warn("An ingredient with rarity has been found: ", stone);
            item.tier = tier+1;
            return item as T.Ingredient;
        default:
            throw Error(`Unknown item category: ${category}`);
    }
}


/**
 * Request a FirstContact to the API, and returns the Backup proto object
 */
async function queryBackup(eid: string, proto) {

    const EggIncFirstContactRequest = proto.lookupType('ei.EggIncFirstContactRequest');
    const EggIncFirstContactResponse = proto.lookupType('ei.EggIncFirstContactResponse');
    const Platform = proto.lookupEnum('ei.Platform');

    const payload = {
        rinfo: {
            eiUserId: eid,
            clientVersion: 69,
            version: '1.34',
            build: '111299',
            //platform: 'DROID',
            //country: ,
            //language: ,
            //debug: ,
        },
        eiUserId: eid,
        //user_id: ,
        //game_services_id: ,
        //device_id: ,
        //username: ,
        clientVersion: 69,
        //platform: Platform.values.DROID,
    }

    let error = EggIncFirstContactRequest.verify(payload);
    if (error)
        throw Error(error);

    const message = EggIncFirstContactRequest.create(payload);
    const buffer = EggIncFirstContactRequest.encode(message).finish();
    const base64Data = btoa(String.fromCharCode(...buffer));

    const response = await fetch(ENDPOINT+"/ei/bot_first_contact", {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'data': base64Data }),
    });

    if (!response.ok)
        throw new Error(`Network response was not ok: ${response.statusText}`);
    const responseText = await response.text();

    const binaryResponse = Uint8Array.from(atob(responseText), c => c.charCodeAt(0));
    const responseMessage = EggIncFirstContactResponse.decode(binaryResponse);

    if (responseMessage.errorCode || responseMessage.errorMessage)
        throw Error(responseMessage.errorMessage);

    return responseMessage.backup
}


/**
 * Return the inventory of a player EID.
 * Identical items are grouped and an extra property `quantity` is added.
 * If the parameter orderedStones is set to true, the stone order matters and can prevent
 * some items from being grouped together.
 */
export async function getInventory(eid: string, orderedStones: boolean = false) {

    const proto = await protobuf.load("/proto/ei.proto");
    const backup = await queryBackup(eid, proto);

    if (!backup.artifactsDb) {
        console.warn(backup);
        throw Error(`No artifact found in backup for EID: ${eid}`);
    }

    let itemIdMap = {};
    let ret = new Map();

    for (const eiItem of backup.artifactsDb.inventoryItems) {

        let stones: T.Stone[] = []
        for (const eiStone of eiItem.artifact.stones) {
            const { category, family, tier } = getItemFromSpec(eiStone, proto);

            if (category != T.ItemCategory.STONE) {
                console.warn("Item: ", eiItem, "Stone: ", eiStone);
                throw Error("An item is equipped with something strange");
            }

            const stone: T.Stone = {
                category: category,
                family: family,
                tier: tier,
            };
            stones.push(stone);
        }

        let item: T.Item = getItemFromSpec(eiItem.artifact.spec, proto);
        item.stones = stones;
        item.quantity = eiItem.quantity;
        item.id = eiItem.itemId;

        let key;
        if (orderedStones) key = [getKey(item), ...stones.map(getKey)].join('/');
        else key = [getKey(item), ...stones.map(getKey).sort()].join('/');

        if (ret.has(key)) {
            ret.get(key).quantity += item.quantity;
        } else {
            ret.set(key, item);
        }
        itemIdMap[eiItem.itemId] = ret.get(key);
    }

    let sets = [];
    for (const eiSet of backup.artifactsDb.savedArtifactSets) {
        let set = [];
        for (const eiSlot of eiSet.slots) {
            //set.push(itemIdMap[eiSlot.itemId]);
            if (eiSlot.occupied)
                set.push(itemIdMap[eiSlot.itemId].id);
            else
                set.push(null);
        }
        while (set.length < 4)
            set.push(null);
        sets.push(set);
    }
    sets.reverse();

    return {
        items: Array.from(ret.values()),
        sets: sets,
        date: new Date(backup.approxTime*1000)
    };
}

