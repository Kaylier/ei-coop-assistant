/*
 * This file handle everything related to external API
 * This concerns Auxbrain API and carpet wasmegg tool suite
 */
import protobuf from 'protobufjs';
import * as T from '@/scripts/types.ts';
import { getSortId, getSlotCount } from '@/scripts/artifacts.ts';
import { checkSID, formatNumber } from '@/scripts/utils.ts';
import { Effects } from '@/scripts/effects.ts';

import eiProto from '@/assets/proto/ei.proto?raw';
import sandboxProto from '@/assets/proto/wasmegg-sandbox.proto?raw';



// The endpoint is blocked by CORS, so we need a proxy to bypass it
//const ENDPOINT = "https://ctx-dot-auxbrainhome.appspot.com";

// A CORS proxy is deployed at this url
const ENDPOINT = "/auxbrain_api";

const CLIENT_VERSION = 68;
const APP_VERSION = '1.34.1';
const APP_BUILD = '111300';
const DEVICE_ID = 'ei-coop-assistant';


/**
 * Convert an ArtifactSpec proto object to an Item typescript object
 */
function getItemFromSpec(spec: any, proto: any): T.Item {

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
        [eiName.values.VIAL_MARTIAN_DUST]: T.ArtifactFamily.VIAL_OF_MARTIAN_DUST,
        [eiName.values.ORNATE_GUSSET]: T.ArtifactFamily.GUSSET,
        [eiName.values.THE_CHALICE]: T.ArtifactFamily.CHALICE,
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
            (item as T.Artifact).tier = tier+1;
            (item as T.Artifact).rarity = rarity;
            return item as T.Artifact;
        case T.ItemCategory.STONE:
            if (rarity !== T.Rarity.COMMON)
                console.warn("A stone with rarity has been found: ", item);
            if (fragment && tier != 0)
                console.warn("A fragment is not tier 0");
            (item as T.Stone).tier = fragment ? 1 : tier+2;
            return item as T.Stone;
        case T.ItemCategory.INGREDIENT:
            if (rarity !== T.Rarity.COMMON)
                console.warn("An ingredient with rarity has been found: ", item);
            (item as T.Ingredient).tier = tier+1;
            return item as T.Ingredient;
        default:
            throw Error(`Unknown item category: ${category}`);
    }
}


/**
 * Request a FirstContact to the API, and returns the Backup proto object
 */
async function queryBackup(eid: string, proto: any) {

    const EggIncFirstContactRequest = proto.lookupType('ei.EggIncFirstContactRequest');
    const EggIncFirstContactResponse = proto.lookupType('ei.EggIncFirstContactResponse');
    //const Platform = proto.lookupEnum('ei.Platform');

    const payload = {
        rinfo: {
            eiUserId: eid,
            clientVersion: CLIENT_VERSION,
            version: APP_VERSION,
            build: APP_BUILD,
            //platform: 'DROID',
            //country: ,
            //language: ,
            //debug: ,
        },
        eiUserId: eid,
        //user_id: ,
        //game_services_id: ,
        device_id: DEVICE_ID,
        //username: ,
        clientVersion: CLIENT_VERSION,
        //platform: Platform.values.DROID,
    }

    const error = EggIncFirstContactRequest.verify(payload);
    if (error)
        throw Error(error);

    const message = EggIncFirstContactRequest.create(payload);
    const buffer = EggIncFirstContactRequest.encode(message).finish();
    const base64Data = btoa(String.fromCharCode(...buffer));

    const response = await fetch(ENDPOINT+"/ei/bot_first_contact", {
        signal: AbortSignal.timeout(10000),
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
 * Load a special inventory.
 * They are stored in /examples/SI*.json, and follow the structure of backup data from proto files
 * (unused fields can be omited).
 */
async function getSpecialBackup(sid: string) {
    const filePath = `/examples/${sid}.json`;
    const response = await fetch(filePath, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
        throw new Error(`Failed to load file: ${filePath}, Status: ${response.status}`);
    }

    return await response.json();
}


/**
 * Return the inventory of a player EID.
 * Identical items are grouped and an extra property `quantity` is added.
 */
export async function getUserData(eid: string): Promise<T.UserData> {
    const proto = await protobuf.parse(eiProto).root;
    const backup = checkSID(eid) ? await getSpecialBackup(eid) : await queryBackup(eid, proto);

    if (!backup) {
        throw Error(`Failed to load backup for EID: ${eid}`);
    }

    if (!backup.artifactsDb) {
        console.warn(backup);
        throw Error(`No artifact found in backup for EID: ${eid}`);
    }

    const [items, sets] = getInventory(proto, backup);

    const proPermit = (backup.game?.permitLevel === 1);

    const epicResearches: Map<string, number> = new Map(backup.game?.epicResearch?.map((er: any) => [er.id, er.level]));

    const protoBuffDimension = proto.lookupEnum('GameModifier.GameDimension');
    const colleggtibleBuffs = getColleggtibleBuffs(proto, backup);


    /*
     * User permanent effects, includes:
     * - permit
     * - mystical eggs
     * - epic research
     * - colleggtibles
     */
    const userEffects = new Effects();

    /*
     * Permit
     */
    userEffects.set('earning_mult', (proPermit ? 1 : 0.5));
    //userEffects.set(''             , (proPermit ? 10 : 2)); // silo amount

    /*
     * Mystical Eggs
     */
    userEffects.set('prophecy_eggs', backup.game?.eggsOfProphecy ?? 0);
    userEffects.set('soul_eggs', backup.game?.soulEggsD ?? 0);

    /*
     * Epic researches
     */
    userEffects.apply('hatching_rate'     ,     2   *(epicResearches.get('hold_to_hatch'           ) ?? 0));
    //userEffects.apply(''                , 1 + 0.10*(epicResearches.get('epic_hatchery'           ) ?? 0));
    userEffects.apply('ihr_mult'          , 1 + 0.05*(epicResearches.get('epic_internal_incubators') ?? 0));
    //userEffects.apply(''                ,    30   *(epicResearches.get('video_doubler_time'      ) ?? 0));
    //userEffects.apply(''                ,    0.001*(epicResearches.get('epic_clucking'           ) ?? 0));
    userEffects.apply('earning_mrcb_mult' ,     2   *(epicResearches.get('epic_multiplier'         ) ?? 0));
    userEffects.apply('hab_cost_mult'     , 1 - 0.05*(epicResearches.get('cheaper_contractors'     ) ?? 0));
    userEffects.apply('vehicle_cost_mult' , 1 - 0.05*(epicResearches.get('bust_unions'             ) ?? 0));
    userEffects.apply('research_cost_mult', 1 - 0.05*(epicResearches.get('cheaper_research'        ) ?? 0));
    //userEffects.apply(''                ,     6   *(epicResearches.get('silo_capacity'           ) ?? 0));
    //userEffects.apply(''                ,     0.10*(epicResearches.get('int_hatch_sharing'       ) ?? 0));
    userEffects.apply('ihr_away_mult'     , 1 + 0.10*(epicResearches.get('int_hatch_calm'          ) ?? 0));
    userEffects.apply('farm_value_mult'   , 1 + 0.05*(epicResearches.get('accounting_tricks'       ) ?? 0));
    userEffects.apply('soul_egg_bonus'    ,     0.01*(epicResearches.get('soul_eggs'               ) ?? 0));
    userEffects.apply('prestige_mult'     , 1 + 0.10*(epicResearches.get('prestige_bonus'          ) ?? 0));
    //userEffects.apply(''                , 2 + 0.10*(epicResearches.get('drone_rewards'           ) ?? 0));
    userEffects.apply('laying_rate'       , 1 + 0.05*(epicResearches.get('epic_egg_laying'         ) ?? 0));
    userEffects.apply('shipping_mult'     , 1 + 0.05*(epicResearches.get('transportation_lobbyist' ) ?? 0));
    userEffects.apply('prophecy_egg_bonus',     0.01*(epicResearches.get('prophecy_bonus'          ) ?? 0));
    //userEffects.apply(''                ,     0.00*(epicResearches.get('hold_to_research'        ) ?? 0));
    //userEffects.apply(''                ,     0.00*(epicResearches.get('afx_mission_time'        ) ?? 0));
    //userEffects.apply(''                ,     0.00*(epicResearches.get('afx_mission_capacity'    ) ?? 0));

    /*
     * Colleggtibles
     */
    userEffects.apply('earning_mult'      , colleggtibleBuffs.get(protoBuffDimension.values.EARNINGS              ) ?? 1);
    userEffects.apply('earning_away_mult' , colleggtibleBuffs.get(protoBuffDimension.values.AWAY_EARNINGS         ) ?? 1);
    userEffects.apply('ihr_mult'          , colleggtibleBuffs.get(protoBuffDimension.values.INTERNAL_HATCHERY_RATE) ?? 1);
    userEffects.apply('laying_rate'       , colleggtibleBuffs.get(protoBuffDimension.values.EGG_LAYING_RATE       ) ?? 1);
    userEffects.apply('shipping_mult'     , colleggtibleBuffs.get(protoBuffDimension.values.SHIPPING_CAPACITY     ) ?? 1);
    userEffects.apply('hab_capacity_mult' , colleggtibleBuffs.get(protoBuffDimension.values.HAB_CAPACITY          ) ?? 1);
    userEffects.apply('vehicle_cost_mult' , colleggtibleBuffs.get(protoBuffDimension.values.VEHICLE_COST          ) ?? 1);
    userEffects.apply('hab_cost_mult'     , colleggtibleBuffs.get(protoBuffDimension.values.HAB_COST              ) ?? 1);
    userEffects.apply('research_cost_mult', colleggtibleBuffs.get(protoBuffDimension.values.RESEARCH_COST         ) ?? 1);



    /*
     * Maxed Farm effects, includes:
     * - habs
     * - vehicles
     * - silos
     * - common researches
     */
    const farmEffects: Effects = new Effects();

    /*
     * farmEffects Habs, vehicles, silos
     */
    farmEffects.set('hab_capacity_base', 600_000_000*4);
    farmEffects.set('shipping_base', 50_000_000/60*17*(backup.game?.hyperloopStation ? 10 : 1));
    //userEffects.set('', 3600); // silo capacity

    /*
     * farmEffects Common researches
     */
    farmEffects.apply('laying_rate'            , 1 + 0.1  *50 ); // Comfortable Nests
    farmEffects.apply('egg_value_mult'         , 1 + 0.25 *40 ); // Nutritional Supplements
  //farmEffects.apply('hatchery_refill_mult'   , 1 + 0.1  *15 ); // Better Incubators
  //farmEffects.apply('running_chicken_mult'   ,     0.001*25 ); // Excitable Chickens
    farmEffects.apply('hab_capacity_mult'      , 1 + 0.05 *8  ); // Hen House Remodel
    farmEffects.apply('ihr_base'               ,     2/60 *10 ); // Internal Hatcheries
    farmEffects.apply('egg_value_mult'         , 1 + 0.25 *30 ); // Padded Packaging
  //farmEffects.apply('hatchery_capacity'      ,       10 *10 ); // Hatchery Expansion
    farmEffects.apply('egg_value_mult'         ,     2   **1  ); // Bigger Eggs
    farmEffects.apply('ihr_base'               ,     5/60 *10 ); // Internal Hatchery Upgrades
    farmEffects.apply('shipping_mult'          , 1 + 0.05 *30 ); // Improved Leafsprings
  //farmEffects.apply('vehicle_count_max'      ,     1    *2  ); // Vehicle Reliability
  //farmEffects.apply('hatchery_refill_mult'   , 1 + 0.05 *25 ); // Rooster Booster
    farmEffects.apply('earning_mrcb_mult'      ,     0.2  *50 ); // Coordinated Clucking
  //farmEffects.apply('hatchery_capacity'      ,    50    *1  ); // Hatchery Rebuild
    farmEffects.apply('egg_value_mult'         ,     3   **1  ); // USDE Prime Certification
    farmEffects.apply('laying_rate'            , 1 + 0.05 *50 ); // Hen House A/C
    farmEffects.apply('egg_value_mult'         , 1 + 0.25 *35 ); // Super-Feed™ Diet
    farmEffects.apply('hab_capacity_mult'      , 1 + 0.05 *10 ); // Microlux™ Chicken Suites
  //farmEffects.apply('hatchery_capacity'      ,    10    *10 ); // Compact Incubators
    farmEffects.apply('shipping_mult'          , 1 + 0.1  *40 ); // Lightweight Boxes
  //farmEffects.apply('vehicle_count_max'      ,     1    *2  ); // Depot Worker Exoskeletons
    farmEffects.apply('ihr_base'               ,    10/60 *15 ); // Internal Hatchery Expansion
    farmEffects.apply('laying_rate'            , 1 + 0.15 *30 ); // Improved Genetics
    farmEffects.apply('egg_value_mult'         , 1 + 0.15 *30 ); // Improved Genetics
  //farmEffects.apply('vehicle_count_max'      ,     1    *2  ); // Traffic Management
    farmEffects.apply('earning_mrcb_mult'      ,     0.5  *50 ); // Motivational Clucking
    farmEffects.apply('shipping_mult'          , 1 + 0.05 *30 ); // Driver Training
    farmEffects.apply('egg_value_mult'         , 1 + 0.15 *60 ); // Shell Fortification
  //farmEffects.apply('vehicle_count_max'      ,     1    *2  ); // Egg Loading Bots
    farmEffects.apply('shipping_mult'          , 1 + 0.05 *50 ); // Super Alloy Frames
    farmEffects.apply('egg_value_mult'         ,     2   **5  ); // Even Bigger Eggs
    farmEffects.apply('ihr_base'               ,    25/60 *30 ); // Internal Hatchery Expansion
    farmEffects.apply('shipping_mult'          , 1 + 0.05 *20 ); // Quantum Egg Storage
    farmEffects.apply('egg_value_mult'         , 1 + 0.1  *100); // Genetic Purification
    farmEffects.apply('ihr_base'               ,     5/60 *250); // Machine Learning Incubators
    farmEffects.apply('laying_rate'            , 1 + 0.1  *20 ); // Time Compression
    farmEffects.apply('shipping_mult'          , 1 + 0.05 *25 ); // Hover Upgrades
    farmEffects.apply('egg_value_mult'         ,     2   **7  ); // Graviton Coating
    farmEffects.apply('hab_capacity_mult'      , 1 + 0.02 *25 ); // Grav Plating
    farmEffects.apply('egg_value_mult'         , 1 + 0.25 *100); // Crystalline Shelling
  //farmEffects.apply('vehicle_count_max'      ,     1    *5  ); // Autonomous Vehicles
    farmEffects.apply('ihr_base'               ,    50/60 *30 ); // Neural Linking
    farmEffects.apply('egg_value_mult'         , 1 + 0.25 *50 ); // Telepathic Will
    farmEffects.apply('earning_mrcb_mult'      ,     2    *150); // Enlightened Chickens
    farmEffects.apply('shipping_mult'          , 1 + 0.05 *25 ); // Dark Containment
    farmEffects.apply('egg_value_mult'         , 1 + 0.1  *50 ); // Atomic Purification
    farmEffects.apply('egg_value_mult'         ,    10   **3  ); // Multiversal Layering
    farmEffects.apply('laying_rate'            , 1 + 0.02 *50 ); // Timeline Diversion
    farmEffects.apply('hab_capacity_mult'      , 1 + 0.02 *25 ); // Wormhole Dampening
    farmEffects.apply('egg_value_mult'         , 1 + 0.05 *100); // Eggsistor Miniaturization
  //farmEffects.apply('hyperloop_size_max'     ,     1    *5  ); // Graviton Coupling
    farmEffects.apply('shipping_mult'          , 1 + 0.05 *25 ); // Neural Net Refinement
    farmEffects.apply('egg_value_mult'         , 1 + 0.01 *500); // Matter Reconfiguration
    farmEffects.apply('egg_value_mult'         ,    10   **1  ); // Timeline Splicing
    farmEffects.apply('shipping_mult'          , 1 + 0.05 *25 ); // Hyper Portalling
    farmEffects.apply('laying_rate'            , 1 + 0.1  *10 ); // Relativity Optimization


    const baseEffects = new Effects(Effects.initial, userEffects);
    const maxedEffects = new Effects(baseEffects, farmEffects);

    return {
        items, sets,
        proPermit,
        baseEffects, maxedEffects,
        date: new Date(backup.approxTime*1000),
        ephemeral: checkSID(eid),
    };
}

function getInventory(proto: any, backup: any): [T.Item[], (T.Artifact | null)[][]] {
    const itemIdMap: Map<number, T.Item> = new Map();
    const items: Map<string, T.Item> = new Map();

    for (const eiItem of backup.artifactsDb.inventoryItems) {

        const item: T.Item = getItemFromSpec(eiItem.artifact.spec, proto);
        let key: string;
        item.quantity = eiItem.quantity as number;
        item.id = eiItem.itemId as number;

        if (item.category === T.ItemCategory.ARTIFACT) {
            const stones: (T.Stone | null)[] = []
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

            const maxStoneCount = getSlotCount(item as T.Artifact);
            while (stones.length < maxStoneCount) {
                stones.push(null);
            }

            (item as T.Artifact).stones = stones;
            key = [getSortId(item), ...stones.map(getSortId).sort()].join('/');
        } else {
            key = getSortId(item);
        }

        if (items.has(key)) {
            items.get(key)!.quantity! += item.quantity;
        } else {
            items.set(key, item);
        }
        itemIdMap.set(eiItem.itemId, items.get(key)!);
    }

    const sets: (T.Artifact | null)[][] = [];
    for (const eiSet of backup.artifactsDb.savedArtifactSets) {
        const set: (T.Artifact | null)[] = [];
        for (const eiSlot of eiSet.slots) {
            if (eiSlot.occupied) {
                const artifact = itemIdMap.get(eiSlot.itemId) ?? null;
                if (artifact && artifact.category !== T.ItemCategory.ARTIFACT)
                    throw new Error("Invalid item found in a set");
                set.push(artifact as T.Artifact);
            } else {
                set.push(null);
            }
        }
        while (set.length < 4)
            set.push(null);
        sets.push(set);
    }
    sets.reverse();

    return [ [...items.values()], sets ];
}

function getColleggtibleBuffs(proto: any, backup: any): Map<any, number> {
    /*
     * Iterate through contracts to find colleggtibles. This is the only way to know as far as I know...
     * For ongoing contracts, assumes the population is maxed
     */
    const protoEgg = proto.lookupEnum('Egg');
    const farmSizeThresholds = [10000000, 100000000, 1000000000, 10000000000];
    const maxFarmSizeReached = new Map<string, number>();

    if (backup.contracts?.contracts) {
        for (const contract of backup.contracts?.contracts) {
            if (contract.contract.egg === protoEgg.values.CUSTOM_EGG) {
                maxFarmSizeReached.set(contract.contract.customEggId, 11340000000);
            }
        }
    }

    if (backup.contracts?.archive) {
        for (const contract of backup.contracts?.archive) {
            if (contract.contract.egg === protoEgg.values.CUSTOM_EGG &&
                (maxFarmSizeReached.get(contract.contract.customEggId) ?? 0) < contract.maxFarmSizeReached) {
                maxFarmSizeReached.set(contract.contract.customEggId, contract.maxFarmSizeReached);
            }
        }
    }

    const colleggtibleBuffs = new Map<any, number>();

    if (backup.contracts?.customEggInfo) {
        for (const customEgg of backup.contracts?.customEggInfo) {
            // Handle colleggtible with multiple dimensions, just in case. Maybe overkill, let's call it future-proof.
            const finalBuffs = new Map();
            for (let i = 0; i < customEgg.buffs.length; i++) {
                if (farmSizeThresholds[i] <= (maxFarmSizeReached.get(customEgg.identifier) ?? 0)) {
                    const buff = customEgg.buffs[i];
                    finalBuffs.set(buff.dimension, buff.value);
                }
            }
            finalBuffs.forEach((value, key) => colleggtibleBuffs.set(key, (colleggtibleBuffs.get(key) ?? 1)*value));
        }
    }

    return colleggtibleBuffs;
}


/**
 * Generates a link to wasmegg sandbox tool https://wasmegg-carpet.netlify.app/artifact-sandbox
 */
export async function getSandboxLink(artifacts: T.Artifact[],
                                     userData?: T.UserData,
                                     options?: {
                                         deflectorBonus?: number,
                                         enlightenment?: boolean,
                                         boosts?: T.BoostCategory[],
                                     }) {
    const { deflectorBonus, enlightenment, boosts } = options ?? {};

    const proto = await protobuf.parse(sandboxProto).root;
    const protoBuilds = proto.lookupType('Builds')
    const protoArtifactName = proto.lookupEnum('ArtifactSpec.Name');

    const userEffects = userData?.maxedEffects ?? Effects.initial;

    const stoneMap = {
        [T.StoneFamily.PROPHECY_STONE]: protoArtifactName.values.PROPHECY_STONE,
        [T.StoneFamily.CLARITY_STONE]: protoArtifactName.values.CLARITY_STONE,
        [T.StoneFamily.DILITHIUM_STONE]: protoArtifactName.values.DILITHIUM_STONE,
        [T.StoneFamily.LIFE_STONE]: protoArtifactName.values.LIFE_STONE,
        [T.StoneFamily.QUANTUM_STONE]: protoArtifactName.values.QUANTUM_STONE,
        [T.StoneFamily.SOUL_STONE]: protoArtifactName.values.SOUL_STONE,
        [T.StoneFamily.TERRA_STONE]: protoArtifactName.values.TERRA_STONE,
        [T.StoneFamily.TACHYON_STONE]: protoArtifactName.values.TACHYON_STONE,
        [T.StoneFamily.SHELL_STONE]: protoArtifactName.values.SHELL_STONE,
        [T.StoneFamily.LUNAR_STONE]: protoArtifactName.values.LUNAR_STONE,
    };
    const artifactMap = {
        [T.ArtifactFamily.LIGHT_OF_EGGENDIL]: protoArtifactName.values.LIGHT_OF_EGGENDIL,
        [T.ArtifactFamily.BOOK_OF_BASAN]: protoArtifactName.values.BOOK_OF_BASAN,
        [T.ArtifactFamily.TACHYON_DEFLECTOR]: protoArtifactName.values.TACHYON_DEFLECTOR,
        [T.ArtifactFamily.SHIP_IN_A_BOTTLE]: protoArtifactName.values.SHIP_IN_A_BOTTLE,
        [T.ArtifactFamily.TITANIUM_ACTUATOR]: protoArtifactName.values.TITANIUM_ACTUATOR,
        [T.ArtifactFamily.DILITHIUM_MONOCLE]: protoArtifactName.values.DILITHIUM_MONOCLE,
        [T.ArtifactFamily.QUANTUM_METRONOME]: protoArtifactName.values.QUANTUM_METRONOME,
        [T.ArtifactFamily.PHOENIX_FEATHER]: protoArtifactName.values.PHOENIX_FEATHER,
        [T.ArtifactFamily.CHALICE]: protoArtifactName.values.THE_CHALICE,
        [T.ArtifactFamily.INTERSTELLAR_COMPASS]: protoArtifactName.values.INTERSTELLAR_COMPASS,
        [T.ArtifactFamily.CARVED_RAINSTICK]: protoArtifactName.values.CARVED_RAINSTICK,
        [T.ArtifactFamily.BEAK_OF_MIDAS]: protoArtifactName.values.BEAK_OF_MIDAS,
        [T.ArtifactFamily.MERCURYS_LENS]: protoArtifactName.values.MERCURYS_LENS,
        [T.ArtifactFamily.NEODYMIUM_MEDALLION]: protoArtifactName.values.NEODYMIUM_MEDALLION,
        [T.ArtifactFamily.GUSSET]: protoArtifactName.values.ORNATE_GUSSET,
        [T.ArtifactFamily.TUNGSTEN_ANKH]: protoArtifactName.values.TUNGSTEN_ANKH,
        [T.ArtifactFamily.AURELIAN_BROOCH]: protoArtifactName.values.AURELIAN_BROOCH,
        [T.ArtifactFamily.VIAL_OF_MARTIAN_DUST]: protoArtifactName.values.VIAL_MARTIAN_DUST,
        [T.ArtifactFamily.DEMETERS_NECKLACE]: protoArtifactName.values.DEMETERS_NECKLACE,
        [T.ArtifactFamily.LUNAR_TOTEM]: protoArtifactName.values.LUNAR_TOTEM,
        [T.ArtifactFamily.PUZZLE_CUBE]: protoArtifactName.values.PUZZLE_CUBE,
    };

    const payload = {
        builds: [{ artifacts: [] as any[] }],
        config: {
            prophecyEggs: userEffects.prophecy_eggs,
            soulEggs: userEffects.soul_eggs,
            soulEggsInput: formatNumber(userEffects.soul_eggs, 'en-us'),
            isEnlightenment: enlightenment ?? false,
            missingSoulFood: Math.round(150 - userEffects.soul_egg_bonus*100),
            missingProphecyBonus: Math.round(110 - userEffects.prophecy_egg_bonus*100),
            missingEpicMultiplier: Math.round(270 - userEffects.earning_mrcb_mult/2),
            birdFeedActive: boosts?.includes(T.BoostCategory.BIRD_FEED) ?? false,
            tachyonPrismActive: boosts?.includes(T.BoostCategory.TACHYON_PRISM) ?? false,
            soulBeaconActive: boosts?.includes(T.BoostCategory.SOUL_BEACON) ?? false,
            boostBeaconActive: boosts?.includes(T.BoostCategory.BOOST_BEACON) ?? false,
            proPermit: userData?.proPermit ?? true,
            tachyonDeflectorBonus: deflectorBonus ?? 0,
        }
    }

    for (const artifact of artifacts) {
        if (artifact) {
            const stones = [];

            for (const stone of artifact.stones) {
                if (stone) {
                    stones.unshift({
                        isEmpty: false,
                        afxId: stoneMap[stone.family],
                        afxLevel: stone.tier - 2
                    });
                } else {
                    stones.unshift({
                        isEmpty: true,
                    });
                }
            }

            payload.builds[0].artifacts.push({
                isEmpty: false,
                afxId: artifactMap[artifact.family],
                afxLevel: artifact.tier - 1,
                afxRarity: artifact.rarity,
                stones: stones
            });
        } else {
            payload.builds[0].artifacts.push({
                isEmpty: true,
            });
        }
    }

    const error = protoBuilds.verify(payload);
    if (error)
        throw Error(error);
    const message = protoBuilds.create(payload);
    const buffer = protoBuilds.encode(message).finish();
    const base64Data = btoa(String.fromCharCode(...buffer));

    return `https://wasmegg-carpet.netlify.app/artifact-sandbox/#/b/${encodeURIComponent(base64Data)}`;
}


