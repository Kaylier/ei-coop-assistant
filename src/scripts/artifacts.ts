/*
 * This file contains helpers for getting information related to items,
 * such as image, effects, readable name...
 *
 * Credit to Forzpace for populating artifactMetadata
 */
import * as T from "@/scripts/types.ts";


type Effect = {
    target: string;
    value: number;
    text: string;
};

type ArtifactRarity = {
    id: string;
    slot_count: number;
    value: number;
    odds_multiplier: number;
    effects: Effect[];
};

type ArtifactTier = {
    tier: number;
    qualifier: string;
    quality: number;
    image: string;
    name: string;
    rarities: {
      [rarity in T.Rarity]?: {
      };
    };
};

type StoneTier = {
    tier: number;
    qualifier: string;
    quality: number;
    image: string;
    name: string;
    id: string;
    value: number;
    odds_multiplier: number;
    effects?: Effect[];
};

type IngredientTier = {
    tier: number;
    qualifier: string;
    quality: number;
    image: string;
    name: string;
    id: string;
    value: number;
    odds_multiplier: number;
};

type ArtifactMetadata = {
    [T.ItemCategory.ARTIFACT]: {
        [family in T.ArtifactFamily]: {
            family_name: string;
            tiers: ArtifactTier[];
        };
    };
    [T.ItemCategory.STONE]: {
        [family in T.StoneFamily]: {
            family_name: string;
            tiers: StoneTier[];
        };
    };
    [T.ItemCategory.INGREDIENT]: {
        [family in T.IngredientFamily]: {
            family_name: string;
            tiers: IngredientTier[];
        };
    };
};

const artifactMetadata: ArtifactMetadata = {
    [T.ItemCategory.ARTIFACT]: {
        [T.ArtifactFamily.LIGHT_OF_EGGENDIL]: {
            "family_name": "Light of Eggendil",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Dim",
                    "quality": 8.2,
                    "image": "artifact-light_of_eggendil-1",
                    "name": "Dim Light of Eggendil",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_light_t1c", "slot_count": 0, "value": 88553.49331, "odds_multiplier": 0.9, "effects": [{"target": "enlightenment_earning_bonus", "value": 1.5, "text": "+50%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "Shimmering",
                    "quality": 10.2,
                    "image": "artifact-light_of_eggendil-2",
                    "name": "Shimmering Light of Eggendil",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_light_t2c", "slot_count": 0, "value": 178016.513068, "odds_multiplier": 0.9, "effects": [{"target": "enlightenment_earning_bonus", "value": 2, "text": "+100%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_light_t2r", "slot_count": 1, "value": 689383.16588, "odds_multiplier": 0.06, "effects": [{"target": "enlightenment_earning_bonus", "value": 2.2, "text": "+120%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Glowing",
                    "quality": 13.2,
                    "image": "artifact-light_of_eggendil-3",
                    "name": "Glowing Light of Eggendil",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_light_t3c", "slot_count": 0, "value": 406201.997701, "odds_multiplier": 0.9, "effects": [{"target": "enlightenment_earning_bonus", "value": 10, "text": "10x"}]},
                        [T.Rarity.RARE]: {"id": "artifact_light_t3r", "slot_count": 1, "value": 1284469.445905, "odds_multiplier": 0.09, "effects": [{"target": "enlightenment_earning_bonus", "value": 15, "text": "15x"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Brilliant",
                    "quality": 16.1,
                    "image": "artifact-light_of_eggendil-4",
                    "name": "Brilliant Light of Eggendil",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_light_t4c", "slot_count": 0, "value": 766894.647031, "odds_multiplier": 0.9, "effects": [{"target": "enlightenment_earning_bonus", "value": 100, "text": "100x"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_light_t4e", "slot_count": 2, "value": 7668721.47031, "odds_multiplier": 0.009, "effects": [{"target": "enlightenment_earning_bonus", "value": 150, "text": "150x"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_light_t4l", "slot_count": 3, "value": 24250572.530675, "odds_multiplier": 0.0009, "effects": [{"target": "enlightenment_earning_bonus", "value": 250, "text": "250x"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.BOOK_OF_BASAN]: {
            "family_name": "Book of Basan",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "",
                    "quality": 8,
                    "image": "artifact-book_of_basan-1",
                    "name": "Book of Basan",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_book_t1c", "slot_count": 0, "value": 81827.523945, "odds_multiplier": 0.9, "effects": [{"target": "prophecy_egg_bonus", "value": 1.0025, "text": "+0.25%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "Collectors",
                    "quality": 10.3,
                    "image": "artifact-book_of_basan-2",
                    "name": "Collectors Book of Basan",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_book_t2c", "slot_count": 0, "value": 259725.545682, "odds_multiplier": 0.45, "effects": [{"target": "prophecy_egg_bonus", "value": 1.005, "text": "+0.5%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Fortified",
                    "quality": 13.3,
                    "image": "artifact-book_of_basan-3",
                    "name": "Fortified Book of Basan",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_book_t3c", "slot_count": 0, "value": 759727.17367, "odds_multiplier": 0.27, "effects": [{"target": "prophecy_egg_bonus", "value": 1.0075, "text": "+0.75%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_book_t3e", "slot_count": 1, "value": 7597046.736699, "odds_multiplier": 0.0027, "effects": [{"target": "prophecy_egg_bonus", "value": 1.008, "text": "+0.8%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Gilded",
                    "quality": 16.8,
                    "image": "artifact-book_of_basan-4",
                    "name": "Gilded Book of Basan",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_book_t4c", "slot_count": 0, "value": 1964983.800784, "odds_multiplier": 0.18, "effects": [{"target": "prophecy_egg_bonus", "value": 1.01, "text": "+1%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_book_t4e", "slot_count": 1, "value": 24065757.137559, "odds_multiplier": 0.0012, "effects": [{"target": "prophecy_egg_bonus", "value": 1.011, "text": "+1.1%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_book_t4l", "slot_count": 2, "value": 62137478.188703, "odds_multiplier": 0.00018, "effects": [{"target": "prophecy_egg_bonus", "value": 1.012, "text": "+1.2%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.TACHYON_DEFLECTOR]: {
            "family_name": "Tachyon Deflector",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Weak",
                    "quality": 7.25,
                    "image": "artifact-tachyon_deflector-1",
                    "name": "Weak Tachyon Deflector",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_deflector_t1c", "slot_count": 0, "value": 71377.853576, "odds_multiplier": 0.63, "effects": [{"target": "team_laying_bonus", "value": 0.05, "text": "+5%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 9.25,
                    "image": "artifact-tachyon_deflector-2",
                    "name": "Tachyon Deflector",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_deflector_t2c", "slot_count": 0, "value": 184122.244366, "odds_multiplier": 0.45, "effects": [{"target": "team_laying_bonus", "value": 0.08, "text": "+8%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Robust",
                    "quality": 13,
                    "image": "artifact-tachyon_deflector-3",
                    "name": "Robust Tachyon Deflector",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_deflector_t3c", "slot_count": 0, "value": 547056.67034, "odds_multiplier": 0.45, "effects": [{"target": "team_laying_bonus", "value": 0.12, "text": "+12%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_deflector_t3r", "slot_count": 1, "value": 1729891.030522, "odds_multiplier": 0.045, "effects": [{"target": "team_laying_bonus", "value": 0.13, "text": "+13%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Eggceptional",
                    "quality": 17,
                    "image": "artifact-tachyon_deflector-4",
                    "name": "Eggceptional Tachyon Deflector",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_deflector_t4c", "slot_count": 0, "value": 2886151.042967, "odds_multiplier": 0.09, "effects": [{"target": "team_laying_bonus", "value": 0.15, "text": "+15%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_deflector_t4r", "slot_count": 1, "value": 31615951.75072, "odds_multiplier": 0.00075, "effects": [{"target": "team_laying_bonus", "value": 0.17, "text": "+17%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_deflector_t4e", "slot_count": 2, "value": 64535765.237061, "odds_multiplier": 0.00018, "effects": [{"target": "team_laying_bonus", "value": 0.19, "text": "+19%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_deflector_t4l", "slot_count": 2, "value": 99978363.869322, "odds_multiplier": 7.5E-05, "effects": [{"target": "team_laying_bonus", "value": 0.2, "text": "+20%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.SHIP_IN_A_BOTTLE]: {
            "family_name": "Ship in a Bottle",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "",
                    "quality": 6.2,
                    "image": "artifact-ship_in_a_bottle-1",
                    "name": "Ship in a Bottle",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_siab_t1c", "slot_count": 0, "value": 36210.297843, "odds_multiplier": 0.9, "effects": [{"target": "team_earning_bonus", "value": 1.2, "text": "+20%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "Detailed",
                    "quality": 8.6,
                    "image": "artifact-ship_in_a_bottle-2",
                    "name": "Detailed Ship in a Bottle",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_siab_t2c", "slot_count": 0, "value": 103128.590442, "odds_multiplier": 0.9, "effects": [{"target": "team_earning_bonus", "value": 1.3, "text": "+30%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Complex",
                    "quality": 11.8,
                    "image": "artifact-ship_in_a_bottle-3",
                    "name": "Complex Ship in a Bottle",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_siab_t3c", "slot_count": 0, "value": 283752.328358, "odds_multiplier": 0.9, "effects": [{"target": "team_earning_bonus", "value": 1.5, "text": "+50%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_siab_t3r", "slot_count": 1, "value": 897249.592046, "odds_multiplier": 0.09, "effects": [{"target": "team_earning_bonus", "value": 1.6, "text": "+60%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Eggquisite",
                    "quality": 15.2,
                    "image": "artifact-ship_in_a_bottle-4",
                    "name": "Eggquisite Ship in a Bottle",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_siab_t4c", "slot_count": 0, "value": 902205.06094, "odds_multiplier": 0.45, "effects": [{"target": "team_earning_bonus", "value": 1.7, "text": "+70%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_siab_t4r", "slot_count": 1, "value": 9021825.609396, "odds_multiplier": 0.0045, "effects": [{"target": "team_earning_bonus", "value": 1.8, "text": "+80%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_siab_t4e", "slot_count": 2, "value": 18043626.218793, "odds_multiplier": 0.001125, "effects": [{"target": "team_earning_bonus", "value": 1.9, "text": "+90%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_siab_t4l", "slot_count": 2, "value": 31252459.062461, "odds_multiplier": 0.000375, "effects": [{"target": "team_earning_bonus", "value": 2, "text": "+100%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.TITANIUM_ACTUATOR]: {
            "family_name": "Titanium Actuator",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Inconsistent",
                    "quality": 5.5,
                    "image": "artifact-titanium_actuator-1",
                    "name": "Inconsistent Titanium Actuator",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_actuator_t1c", "slot_count": 0, "value": 24687.627965, "odds_multiplier": 0.9, "effects": [{"target": "hold_to_hatch_bonus", "value": 1, "text": "+1"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 7.9,
                    "image": "artifact-titanium_actuator-2",
                    "name": "Titanium Actuator",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_actuator_t2c", "slot_count": 0, "value": 78600.18956, "odds_multiplier": 0.9, "effects": [{"target": "hold_to_hatch_bonus", "value": 4, "text": "+4"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Precise",
                    "quality": 11,
                    "image": "artifact-titanium_actuator-3",
                    "name": "Precise Titanium Actuator",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_actuator_t3c", "slot_count": 0, "value": 226664.36139, "odds_multiplier": 0.9, "effects": [{"target": "hold_to_hatch_bonus", "value": 6, "text": "+6"}]},
                        [T.Rarity.RARE]: {"id": "artifact_actuator_t3r", "slot_count": 1, "value": 716721.589438, "odds_multiplier": 0.09, "effects": [{"target": "hold_to_hatch_bonus", "value": 7, "text": "+7"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Reggference",
                    "quality": 14.2,
                    "image": "artifact-titanium_actuator-4",
                    "name": "Reggference Titanium Actuator",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_actuator_t4c", "slot_count": 0, "value": 513124.329702, "odds_multiplier": 0.9, "effects": [{"target": "hold_to_hatch_bonus", "value": 10, "text": "+10"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_actuator_t4e", "slot_count": 1, "value": 7256345.309091, "odds_multiplier": 0.0045, "effects": [{"target": "hold_to_hatch_bonus", "value": 12, "text": "+12"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_actuator_t4l", "slot_count": 2, "value": 16225650.47764, "odds_multiplier": 0.0009, "effects": [{"target": "hold_to_hatch_bonus", "value": 15, "text": "+15"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.DILITHIUM_MONOCLE]: {
            "family_name": "Dilithium Monocle",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "",
                    "quality": 5.45,
                    "image": "artifact-dilithium_monocle-1",
                    "name": "Dilithium Monocle",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_monocle_t1c", "slot_count": 0, "value": 23977.318202, "odds_multiplier": 0.9, "effects": [{"target": "boost_bonus", "value": 1.05, "text": "+5%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "Precise",
                    "quality": 7.75,
                    "image": "artifact-dilithium_monocle-2",
                    "name": "Precise Dilithium Monocle",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_monocle_t2c", "slot_count": 0, "value": 73924.958295, "odds_multiplier": 0.9, "effects": [{"target": "boost_bonus", "value": 1.1, "text": "+10%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Eggsacting",
                    "quality": 10.7,
                    "image": "artifact-dilithium_monocle-3",
                    "name": "Eggsacting Dilithium Monocle",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_monocle_t3c", "slot_count": 0, "value": 207471.844866, "odds_multiplier": 0.9, "effects": [{"target": "boost_bonus", "value": 1.15, "text": "+15%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Flawless",
                    "quality": 15.2,
                    "image": "artifact-dilithium_monocle-4",
                    "name": "Flawless Dilithium Monocle",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_monocle_t4c", "slot_count": 0, "value": 637962.638942, "odds_multiplier": 0.9, "effects": [{"target": "boost_bonus", "value": 1.2, "text": "+20%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_monocle_t4e", "slot_count": 2, "value": 7813133.515615, "odds_multiplier": 0.006, "effects": [{"target": "boost_bonus", "value": 1.25, "text": "+25%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_monocle_t4l", "slot_count": 3, "value": 20173384.442059, "odds_multiplier": 0.0009, "effects": [{"target": "boost_bonus", "value": 1.3, "text": "+30%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.QUANTUM_METRONOME]: {
            "family_name": "Quantum Metronome",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Misaligned",
                    "quality": 5.3,
                    "image": "artifact-quantum_metronome-1",
                    "name": "Misaligned Quantum Metronome",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_metronome_t1c", "slot_count": 0, "value": 21930.921549, "odds_multiplier": 0.9, "effects": [{"target": "laying_bonus", "value": 1.05, "text": "+5%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "Adequate",
                    "quality": 7.2,
                    "image": "artifact-quantum_metronome-2",
                    "name": "Adequate Quantum Metronome",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_metronome_t2c", "slot_count": 0, "value": 58415.572564, "odds_multiplier": 0.9, "effects": [{"target": "laying_bonus", "value": 1.1, "text": "+10%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_metronome_t2r", "slot_count": 1, "value": 226170.715116, "odds_multiplier": 0.06, "effects": [{"target": "laying_bonus", "value": 1.12, "text": "+12%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Perfect",
                    "quality": 10.2,
                    "image": "artifact-quantum_metronome-3",
                    "name": "Perfect Quantum Metronome",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_metronome_t3c", "slot_count": 0, "value": 178016.513068, "odds_multiplier": 0.9, "effects": [{"target": "laying_bonus", "value": 1.15, "text": "+15%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_metronome_t3r", "slot_count": 1, "value": 562883.585475, "odds_multiplier": 0.09, "effects": [{"target": "laying_bonus", "value": 1.17, "text": "+17%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_metronome_t3e", "slot_count": 2, "value": 1592029.490555, "odds_multiplier": 0.01125, "effects": [{"target": "laying_bonus", "value": 1.2, "text": "+20%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Reggference",
                    "quality": 14.5,
                    "image": "artifact-quantum_metronome-4",
                    "name": "Reggference Quantum Metronome",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_metronome_t4c", "slot_count": 0, "value": 655728.244215, "odds_multiplier": 0.63, "effects": [{"target": "laying_bonus", "value": 1.25, "text": "+25%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_metronome_t4r", "slot_count": 1, "value": 3766753.363929, "odds_multiplier": 0.019091, "effects": [{"target": "laying_bonus", "value": 1.27, "text": "+27%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_metronome_t4e", "slot_count": 2, "value": 8294087.883519, "odds_multiplier": 0.003938, "effects": [{"target": "laying_bonus", "value": 1.3, "text": "+30%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_metronome_t4l", "slot_count": 3, "value": 20735182.208798, "odds_multiplier": 0.00063, "effects": [{"target": "laying_bonus", "value": 1.35, "text": "+35%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.PHOENIX_FEATHER]: {
            "family_name": "Phoenix Feather",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Tattered",
                    "quality": 5,
                    "image": "artifact-phoenix_feather-1",
                    "name": "Tattered Phoenix Feather",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_feather_t1c", "slot_count": 0, "value": 18204.534523, "odds_multiplier": 0.9, "effects": [{"target": "soul_egg_collection_bonus", "value": 1.25, "text": "+25%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 7,
                    "image": "artifact-phoenix_feather-2",
                    "name": "Phoenix Feather",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_feather_t2c", "slot_count": 0, "value": 53382.131454, "odds_multiplier": 0.9, "effects": [{"target": "soul_egg_collection_bonus", "value": 2, "text": "+100%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Brilliant",
                    "quality": 9.4,
                    "image": "artifact-phoenix_feather-3",
                    "name": "Brilliant Phoenix Feather",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_feather_t3c", "slot_count": 0, "value": 137077.78869, "odds_multiplier": 0.9, "effects": [{"target": "soul_egg_collection_bonus", "value": 5, "text": "5x"}]},
                        [T.Rarity.RARE]: {"id": "artifact_feather_t3r", "slot_count": 1, "value": 433423.971939, "odds_multiplier": 0.09, "effects": [{"target": "soul_egg_collection_bonus", "value": 6, "text": "6x"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Blazing",
                    "quality": 14.6,
                    "image": "artifact-phoenix_feather-4",
                    "name": "Blazing Phoenix Feather",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_feather_t4c", "slot_count": 0, "value": 560824.843537, "odds_multiplier": 0.9, "effects": [{"target": "soul_egg_collection_bonus", "value": 10, "text": "10x"}]},
                        [T.Rarity.RARE]: {"id": "artifact_feather_t4r", "slot_count": 1, "value": 3546834.634086, "odds_multiplier": 0.0225, "effects": [{"target": "soul_egg_collection_bonus", "value": 12, "text": "12x"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_feather_t4l", "slot_count": 2, "value": 17734073.170428, "odds_multiplier": 0.0009, "effects": [{"target": "soul_egg_collection_bonus", "value": 15, "text": "15x"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.CHALICE]: {
            "family_name": "Chalice",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Plain",
                    "quality": 4.5,
                    "image": "artifact-chalice-1",
                    "name": "Plain Chalice",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_chalice_t1c", "slot_count": 0, "value": 13001.536402, "odds_multiplier": 0.9, "effects": [{"target": "internal_hatchery_bonus", "value": 1.05, "text": "+5%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "Polished",
                    "quality": 6,
                    "image": "artifact-chalice-2",
                    "name": "Polished Chalice",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_chalice_t2c", "slot_count": 0, "value": 32605.875215, "odds_multiplier": 0.9, "effects": [{"target": "internal_hatchery_bonus", "value": 1.1, "text": "+10%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_chalice_t2e", "slot_count": 2, "value": 291437.206984, "odds_multiplier": 0.01125, "effects": [{"target": "internal_hatchery_bonus", "value": 1.15, "text": "+15%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Jeweled",
                    "quality": 8.2,
                    "image": "artifact-chalice-3",
                    "name": "Jeweled Chalice",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_chalice_t3c", "slot_count": 0, "value": 88553.49331, "odds_multiplier": 0.9, "effects": [{"target": "internal_hatchery_bonus", "value": 1.2, "text": "+20%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_chalice_t3r", "slot_count": 1, "value": 279976.676682, "odds_multiplier": 0.09, "effects": [{"target": "internal_hatchery_bonus", "value": 1.23, "text": "+23%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_chalice_t3e", "slot_count": 2, "value": 885309.933098, "odds_multiplier": 0.009, "effects": [{"target": "internal_hatchery_bonus", "value": 1.25, "text": "+25%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Eggceptional",
                    "quality": 12.5,
                    "image": "artifact-chalice-4",
                    "name": "Eggceptional Chalice",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_chalice_t4c", "slot_count": 0, "value": 341210.673655, "odds_multiplier": 0.9, "effects": [{"target": "internal_hatchery_bonus", "value": 1.3, "text": "+30%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_chalice_t4e", "slot_count": 2, "value": 4178679.040016, "odds_multiplier": 0.006, "effects": [{"target": "internal_hatchery_bonus", "value": 1.35, "text": "+35%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_chalice_t4l", "slot_count": 3, "value": 10789263.337695, "odds_multiplier": 0.0009, "effects": [{"target": "internal_hatchery_bonus", "value": 1.4, "text": "+40%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.INTERSTELLAR_COMPASS]: {
            "family_name": "Interstellar Compass",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Miscalibrated",
                    "quality": 4.32,
                    "image": "artifact-interstellar_compass-1",
                    "name": "Miscalibrated Interstellar Compass",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_compass_t1c", "slot_count": 0, "value": 11412.456608, "odds_multiplier": 0.9, "effects": [{"target": "shipping_bonus", "value": 1.05, "text": "+5%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 6.1,
                    "image": "artifact-interstellar_compass-2",
                    "name": "Interstellar Compass",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_compass_t2c", "slot_count": 0, "value": 34375.591304, "odds_multiplier": 0.9, "effects": [{"target": "shipping_bonus", "value": 1.1, "text": "+10%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Precise",
                    "quality": 8.7,
                    "image": "artifact-interstellar_compass-3",
                    "name": "Precise Interstellar Compass",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_compass_t3c", "slot_count": 0, "value": 107014.301871, "odds_multiplier": 0.9, "effects": [{"target": "shipping_bonus", "value": 1.2, "text": "+20%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_compass_t3r", "slot_count": 1, "value": 338354.879183, "odds_multiplier": 0.09, "effects": [{"target": "shipping_bonus", "value": 1.22, "text": "+22%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Clairvoyant",
                    "quality": 12.5,
                    "image": "artifact-interstellar_compass-4",
                    "name": "Clairvoyant Interstellar Compass",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_compass_t4c", "slot_count": 0, "value": 482534.406971, "odds_multiplier": 0.45, "effects": [{"target": "shipping_bonus", "value": 1.3, "text": "+30%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_compass_t4r", "slot_count": 1, "value": 3051682.436969, "odds_multiplier": 0.01125, "effects": [{"target": "shipping_bonus", "value": 1.35, "text": "+35%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_compass_t4e", "slot_count": 2, "value": 6823738.473105, "odds_multiplier": 0.00225, "effects": [{"target": "shipping_bonus", "value": 1.4, "text": "+40%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_compass_t4l", "slot_count": 2, "value": 15258312.184844, "odds_multiplier": 0.00045, "effects": [{"target": "shipping_bonus", "value": 1.5, "text": "+50%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.CARVED_RAINSTICK]: {
            "family_name": "Carved Rainstick",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Simple",
                    "quality": 4.2,
                    "image": "artifact-carved_rainstick-1",
                    "name": "Simple Carved Rainstick",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_rainstick_t1c", "slot_count": 0, "value": 10430.823962, "odds_multiplier": 0.9, "effects": [{"target": "drone_cash_bonus", "value": 1.2, "text": "+20%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 6.2,
                    "image": "artifact-carved_rainstick-2",
                    "name": "Carved Rainstick",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_rainstick_t2c", "slot_count": 0, "value": 36210.297843, "odds_multiplier": 0.9, "effects": [{"target": "drone_cash_bonus", "value": 1.5, "text": "+50%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Ornate",
                    "quality": 8.8,
                    "image": "artifact-carved_rainstick-3",
                    "name": "Ornate Carved Rainstick",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_rainstick_t3c", "slot_count": 0, "value": 110999.525346, "odds_multiplier": 0.9, "effects": [{"target": "drone_cash_bonus", "value": 2, "text": "+100%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Meggnificent",
                    "quality": 13.2,
                    "image": "artifact-carved_rainstick-4",
                    "name": "Meggnificent Carved Rainstick",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_rainstick_t4c", "slot_count": 0, "value": 406201.997701, "odds_multiplier": 0.9, "effects": [{"target": "drone_cash_bonus", "value": 5, "text": "5x"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_rainstick_t4e", "slot_count": 1, "value": 5295925.120705, "odds_multiplier": 0.005294, "effects": [{"target": "drone_cash_bonus", "value": 10, "text": "10x"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_rainstick_t4l", "slot_count": 2, "value": 12844469.459051, "odds_multiplier": 0.0009, "effects": [{"target": "drone_cash_bonus", "value": 25, "text": "Guaranteed"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.BEAK_OF_MIDAS]: {
            "family_name": "Beak of Midas",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Dull",
                    "quality": 3.5,
                    "image": "artifact-beak_of_midas-1",
                    "name": "Dull Beak of Midas",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_beak_t1c", "slot_count": 0, "value": 5831.260105, "odds_multiplier": 0.9, "effects": [{"target": "drone_gold_bonus", "value": 1.2, "text": "+20%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 5.5,
                    "image": "artifact-beak_of_midas-2",
                    "name": "Beak of Midas",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_beak_t2c", "slot_count": 0, "value": 24687.627965, "odds_multiplier": 0.9, "effects": [{"target": "drone_gold_bonus", "value": 1.5, "text": "+50%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Jeweled",
                    "quality": 7.7,
                    "image": "artifact-beak_of_midas-3",
                    "name": "Jeweled Beak of Midas",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_beak_t3c", "slot_count": 0, "value": 72410.081186, "odds_multiplier": 0.9, "effects": [{"target": "drone_gold_bonus", "value": 2, "text": "+100%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_beak_t3r", "slot_count": 1, "value": 240099.154712, "odds_multiplier": 0.081818, "effects": [{"target": "drone_gold_bonus", "value": 3, "text": "+200%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Glistening",
                    "quality": 10.9,
                    "image": "artifact-beak_of_midas-4",
                    "name": "Glistening Beak of Midas",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_beak_t4c", "slot_count": 0, "value": 220136.90814, "odds_multiplier": 0.9, "effects": [{"target": "drone_gold_bonus", "value": 6, "text": "6x"}]},
                        [T.Rarity.RARE]: {"id": "artifact_beak_t4r", "slot_count": 1, "value": 1556451.22866, "odds_multiplier": 0.018, "effects": [{"target": "drone_gold_bonus", "value": 11, "text": "11x"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_beak_t4l", "slot_count": 2, "value": 8524922.545295, "odds_multiplier": 0.0006, "effects": [{"target": "drone_gold_bonus", "value": 25, "text": "Guaranteed"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.MERCURYS_LENS]: {
            "family_name": "Mercury's Lens",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Misaligned",
                    "quality": 3.3,
                    "image": "artifact-mercurys_lens-1",
                    "name": "Misaligned Mercury's Lens",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_lens_t1c", "slot_count": 0, "value": 4834.759409, "odds_multiplier": 0.9, "effects": [{"target": "farm_value_bonus", "value": 1.1, "text": "+10%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 5.7,
                    "image": "artifact-mercurys_lens-2",
                    "name": "Mercury's Lens",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_lens_t2c", "slot_count": 0, "value": 27673.9271, "odds_multiplier": 0.9, "effects": [{"target": "farm_value_bonus", "value": 1.2, "text": "+20%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_lens_t2r", "slot_count": 1, "value": 87458.584496, "odds_multiplier": 0.09, "effects": [{"target": "farm_value_bonus", "value": 1.22, "text": "+22%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Precise",
                    "quality": 8.2,
                    "image": "artifact-mercurys_lens-3",
                    "name": "Precise Mercury's Lens",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_lens_t3c", "slot_count": 0, "value": 88553.49331, "odds_multiplier": 0.9, "effects": [{"target": "farm_value_bonus", "value": 1.5, "text": "+50%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_lens_t3r", "slot_count": 1, "value": 279976.676682, "odds_multiplier": 0.09, "effects": [{"target": "farm_value_bonus", "value": 1.55, "text": "+55%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Meggnificent",
                    "quality": 13.5,
                    "image": "artifact-mercurys_lens-4",
                    "name": "Meggnificent Mercury's Lens",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_lens_t4c", "slot_count": 0, "value": 617276.000138, "odds_multiplier": 0.45, "effects": [{"target": "farm_value_bonus", "value": 2, "text": "+100%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_lens_t4r", "slot_count": 1, "value": 3903863.096907, "odds_multiplier": 0.01125, "effects": [{"target": "farm_value_bonus", "value": 2.25, "text": "+125%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_lens_t4e", "slot_count": 2, "value": 9759620.242267, "odds_multiplier": 0.0018, "effects": [{"target": "farm_value_bonus", "value": 2.5, "text": "+150%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_lens_t4l", "slot_count": 2, "value": 19519215.484534, "odds_multiplier": 0.00045, "effects": [{"target": "farm_value_bonus", "value": 3, "text": "+200%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.NEODYMIUM_MEDALLION]: {
            "family_name": "Neodymium Medallion",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Weak",
                    "quality": 3,
                    "image": "artifact-neodymium_medallion-1",
                    "name": "Weak Neodymium Medallion",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_medallion_t1c", "slot_count": 0, "value": 3570.412409, "odds_multiplier": 0.9, "effects": [{"target": "drone_frequency_bonus", "value": 1.1, "text": "+10%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 5,
                    "image": "artifact-neodymium_medallion-2",
                    "name": "Neodymium Medallion",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_medallion_t2c", "slot_count": 0, "value": 18204.534523, "odds_multiplier": 0.9, "effects": [{"target": "drone_frequency_bonus", "value": 1.25, "text": "+25%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_medallion_t2r", "slot_count": 1, "value": 63000.754903, "odds_multiplier": 0.075, "effects": [{"target": "drone_frequency_bonus", "value": 1.3, "text": "+30%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Precise",
                    "quality": 7,
                    "image": "artifact-neodymium_medallion-3",
                    "name": "Precise Neodymium Medallion",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_medallion_t3c", "slot_count": 0, "value": 53382.131454, "odds_multiplier": 0.9, "effects": [{"target": "drone_frequency_bonus", "value": 1.5, "text": "+50%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_medallion_t3e", "slot_count": 2, "value": 653513.73101, "odds_multiplier": 0.006, "effects": [{"target": "drone_frequency_bonus", "value": 1.6, "text": "+60%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Eggceptional",
                    "quality": 9.8,
                    "image": "artifact-neodymium_medallion-4",
                    "name": "Eggceptional Neodymium Medallion",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_medallion_t4c", "slot_count": 0, "value": 156628.760864, "odds_multiplier": 0.9, "effects": [{"target": "drone_frequency_bonus", "value": 2, "text": "+100%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_medallion_t4r", "slot_count": 1, "value": 990474.148954, "odds_multiplier": 0.0225, "effects": [{"target": "drone_frequency_bonus", "value": 2.1, "text": "+110%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_medallion_t4e", "slot_count": 2, "value": 2214736.625319, "odds_multiplier": 0.0045, "effects": [{"target": "drone_frequency_bonus", "value": 2.2, "text": "+120%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_medallion_t4l", "slot_count": 3, "value": 4952270.744771, "odds_multiplier": 0.0009, "effects": [{"target": "drone_frequency_bonus", "value": 2.3, "text": "+130%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.GUSSET]: {
            "family_name": "Gusset",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Plain",
                    "quality": 2.5,
                    "image": "artifact-gusset-1",
                    "name": "Plain Gusset",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_gusset_t1c", "slot_count": 0, "value": 2003.275502, "odds_multiplier": 0.9, "effects": [{"target": "hab_capacity_bonus", "value": 1.05, "text": "+5%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "Ornate",
                    "quality": 5.3,
                    "image": "artifact-gusset-2",
                    "name": "Ornate Gusset",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_gusset_t2c", "slot_count": 0, "value": 21930.921549, "odds_multiplier": 0.9, "effects": [{"target": "hab_capacity_bonus", "value": 1.1, "text": "+10%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_gusset_t2e", "slot_count": 2, "value": 219084.215486, "odds_multiplier": 0.009, "effects": [{"target": "hab_capacity_bonus", "value": 1.12, "text": "+12%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Distegguished",
                    "quality": 8.1,
                    "image": "artifact-gusset-3",
                    "name": "Distegguished Gusset",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_gusset_t3c", "slot_count": 0, "value": 85144.841389, "odds_multiplier": 0.9, "effects": [{"target": "hab_capacity_bonus", "value": 1.15, "text": "+15%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_gusset_t3r", "slot_count": 1, "value": 269197.57286, "odds_multiplier": 0.09, "effects": [{"target": "hab_capacity_bonus", "value": 1.16, "text": "+16%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Jeweled",
                    "quality": 13.1,
                    "image": "artifact-gusset-4",
                    "name": "Jeweled Gusset",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_gusset_t4c", "slot_count": 0, "value": 396437.090005, "odds_multiplier": 0.9, "effects": [{"target": "hab_capacity_bonus", "value": 1.2, "text": "+20%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_gusset_t4e", "slot_count": 2, "value": 4855061.741907, "odds_multiplier": 0.006, "effects": [{"target": "hab_capacity_bonus", "value": 1.22, "text": "+22%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_gusset_t4l", "slot_count": 3, "value": 12535675.96442, "odds_multiplier": 0.0009, "effects": [{"target": "hab_capacity_bonus", "value": 1.25, "text": "+25%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.TUNGSTEN_ANKH]: {
            "family_name": "Tungsten Ankh",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Crude",
                    "quality": 2,
                    "image": "artifact-tungsten_ankh-1",
                    "name": "Crude Tungsten Ankh",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_ankh_t1c", "slot_count": 0, "value": 993.667506, "odds_multiplier": 0.9, "effects": [{"target": "egg_value_bonus", "value": 1.1, "text": "+10%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 5,
                    "image": "artifact-tungsten_ankh-2",
                    "name": "Tungsten Ankh",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_ankh_t2c", "slot_count": 0, "value": 18204.534523, "odds_multiplier": 0.9, "effects": [{"target": "egg_value_bonus", "value": 1.25, "text": "+25%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_ankh_t2r", "slot_count": 1, "value": 90922.672615, "odds_multiplier": 0.036, "effects": [{"target": "egg_value_bonus", "value": 1.28, "text": "+28%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Polished",
                    "quality": 7.8,
                    "image": "artifact-tungsten_ankh-3",
                    "name": "Polished Tungsten Ankh",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_ankh_t3c", "slot_count": 0, "value": 75461.490186, "odds_multiplier": 0.9, "effects": [{"target": "egg_value_bonus", "value": 1.5, "text": "+50%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_ankh_t3r", "slot_count": 1, "value": 238576.127675, "odds_multiplier": 0.09, "effects": [{"target": "egg_value_bonus", "value": 1.75, "text": "+75%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_ankh_t3l", "slot_count": 3, "value": 2385536.276752, "odds_multiplier": 0.0009, "effects": [{"target": "egg_value_bonus", "value": 2, "text": "+100%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Brilliant",
                    "quality": 11.7,
                    "image": "artifact-tungsten_ankh-4",
                    "name": "Brilliant Tungsten Ankh",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_ankh_t4c", "slot_count": 0, "value": 276129.51142, "odds_multiplier": 0.9, "effects": [{"target": "egg_value_bonus", "value": 2, "text": "+100%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_ankh_t4r", "slot_count": 1, "value": 1746263.25667, "odds_multiplier": 0.0225, "effects": [{"target": "egg_value_bonus", "value": 2.25, "text": "+125%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_ankh_t4l", "slot_count": 3, "value": 8731216.283349, "odds_multiplier": 0.0009, "effects": [{"target": "egg_value_bonus", "value": 2.5, "text": "+150%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.AURELIAN_BROOCH]: {
            "family_name": "Aurelian Brooch",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Plain",
                    "quality": 1.9,
                    "image": "artifact-aurelian_brooch-1",
                    "name": "Plain Aurelian Brooch",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_brooch_t1c", "slot_count": 0, "value": 847.034923, "odds_multiplier": 0.9, "effects": [{"target": "drone_reward_bonus", "value": 1.1, "text": "+10%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 3.9,
                    "image": "artifact-aurelian_brooch-2",
                    "name": "Aurelian Brooch",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_brooch_t2c", "slot_count": 0, "value": 8233.909878, "odds_multiplier": 0.9, "effects": [{"target": "drone_reward_bonus", "value": 1.25, "text": "+25%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Jeweled",
                    "quality": 6.7,
                    "image": "artifact-aurelian_brooch-3",
                    "name": "Jeweled Aurelian Brooch",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_brooch_t3c", "slot_count": 0, "value": 46403.651172, "odds_multiplier": 0.9, "effects": [{"target": "drone_reward_bonus", "value": 1.5, "text": "+50%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_brooch_t3r", "slot_count": 1, "value": 146687.172511, "odds_multiplier": 0.09, "effects": [{"target": "drone_reward_bonus", "value": 1.6, "text": "+60%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_brooch_t3e", "slot_count": 2, "value": 463811.511722, "odds_multiplier": 0.009, "effects": [{"target": "drone_reward_bonus", "value": 1.7, "text": "+70%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Eggceptional",
                    "quality": 9.8,
                    "image": "artifact-aurelian_brooch-4",
                    "name": "Eggceptional Aurelian Brooch",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_brooch_t4c", "slot_count": 0, "value": 156628.760864, "odds_multiplier": 0.9, "effects": [{"target": "drone_reward_bonus", "value": 2, "text": "+100%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_brooch_t4r", "slot_count": 1, "value": 990474.148954, "odds_multiplier": 0.0225, "effects": [{"target": "drone_reward_bonus", "value": 2.25, "text": "+125%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_brooch_t4e", "slot_count": 2, "value": 2101084.928938, "odds_multiplier": 0.005, "effects": [{"target": "drone_reward_bonus", "value": 2.5, "text": "+150%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_brooch_t4l", "slot_count": 3, "value": 4952270.744771, "odds_multiplier": 0.0009, "effects": [{"target": "drone_reward_bonus", "value": 3, "text": "+200%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.VIAL_OF_MARTIAN_DUST]: {
            "family_name": "Vial of Martian Dust",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Tiny",
                    "quality": 1.75,
                    "image": "artifact-vial_of_martian_dust-1",
                    "name": "Tiny Vial of Martian Dust",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_vial_t1c", "slot_count": 0, "value": 656.830376, "odds_multiplier": 0.9, "effects": [{"target": "running_chicken_bonus", "value": 10, "text": "+10"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 4.8,
                    "image": "artifact-vial_of_martian_dust-2",
                    "name": "Vial of Martian Dust",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_vial_t2c", "slot_count": 0, "value": 15978.306346, "odds_multiplier": 0.9, "effects": [{"target": "running_chicken_bonus", "value": 50, "text": "+50"}]},
                        [T.Rarity.RARE]: {"id": "artifact_vial_t2r", "slot_count": 1, "value": 50473.784263, "odds_multiplier": 0.09, "effects": [{"target": "running_chicken_bonus", "value": 60, "text": "+60"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Hermetic",
                    "quality": 7.9,
                    "image": "artifact-vial_of_martian_dust-3",
                    "name": "Hermetic Vial of Martian Dust",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_vial_t3c", "slot_count": 0, "value": 78600.18956, "odds_multiplier": 0.9, "effects": [{"target": "running_chicken_bonus", "value": 100, "text": "+100"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_vial_t3e", "slot_count": 1, "value": 785776.895596, "odds_multiplier": 0.009, "effects": [{"target": "running_chicken_bonus", "value": 150, "text": "+150"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Prime",
                    "quality": 12.5,
                    "image": "artifact-vial_of_martian_dust-4",
                    "name": "Prime Vial of Martian Dust",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_vial_t4c", "slot_count": 0, "value": 341210.673655, "odds_multiplier": 0.9, "effects": [{"target": "running_chicken_bonus", "value": 200, "text": "+200"}]},
                        [T.Rarity.RARE]: {"id": "artifact_vial_t4r", "slot_count": 1, "value": 2157872.667539, "odds_multiplier": 0.0225, "effects": [{"target": "running_chicken_bonus", "value": 300, "text": "+300"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_vial_t4l", "slot_count": 2, "value": 10789263.337695, "odds_multiplier": 0.0009, "effects": [{"target": "running_chicken_bonus", "value": 500, "text": "+500"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.DEMETERS_NECKLACE]: {
            "family_name": "Demeters Necklace",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Simple",
                    "quality": 1.2,
                    "image": "artifact-demeters_necklace-1",
                    "name": "Simple Demeters Necklace",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_necklace_t1c", "slot_count": 0, "value": 213.911646, "odds_multiplier": 0.9, "effects": [{"target": "egg_value_bonus", "value": 1.1, "text": "+10%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "Jeweled",
                    "quality": 3.2,
                    "image": "artifact-demeters_necklace-2",
                    "name": "Jeweled Demeters Necklace",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_necklace_t2c", "slot_count": 0, "value": 4383.717036, "odds_multiplier": 0.9, "effects": [{"target": "egg_value_bonus", "value": 1.25, "text": "+25%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_necklace_t2r", "slot_count": 1, "value": 23898.676423, "odds_multiplier": 0.03, "effects": [{"target": "egg_value_bonus", "value": 1.35, "text": "+35%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Pristine",
                    "quality": 5.8,
                    "image": "artifact-demeters_necklace-3",
                    "name": "Pristine Demeters Necklace",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_necklace_t3c", "slot_count": 0, "value": 29256.313096, "odds_multiplier": 0.9, "effects": [{"target": "egg_value_bonus", "value": 1.5, "text": "+50%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_necklace_t3r", "slot_count": 1, "value": 130751.406309, "odds_multiplier": 0.045, "effects": [{"target": "egg_value_bonus", "value": 1.6, "text": "+60%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_necklace_t3e", "slot_count": 2, "value": 292338.13096, "odds_multiplier": 0.009, "effects": [{"target": "egg_value_bonus", "value": 1.75, "text": "+75%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Beggspoke",
                    "quality": 8.9,
                    "image": "artifact-demeters_necklace-4",
                    "name": "Beggspoke Demeters Necklace",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_necklace_t4c", "slot_count": 0, "value": 115085.635013, "odds_multiplier": 0.9, "effects": [{"target": "egg_value_bonus", "value": 2, "text": "+100%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_necklace_t4r", "slot_count": 1, "value": 727732.351336, "odds_multiplier": 0.0225, "effects": [{"target": "egg_value_bonus", "value": 2.25, "text": "+125%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_necklace_t4e", "slot_count": 2, "value": 1361440.793268, "odds_multiplier": 0.006429, "effects": [{"target": "egg_value_bonus", "value": 2.5, "text": "+150%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_necklace_t4l", "slot_count": 3, "value": 3638561.756679, "odds_multiplier": 0.0009, "effects": [{"target": "egg_value_bonus", "value": 3, "text": "+200%"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.LUNAR_TOTEM]: {
            "family_name": "Lunar Totem",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Basic",
                    "quality": 0.7,
                    "image": "artifact-lunar_totem-1",
                    "name": "Basic Lunar Totem",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_totem_t1c", "slot_count": 0, "value": 58.666074, "odds_multiplier": 0.9, "effects": [{"target": "away_earning_bonus", "value": 2, "text": "+100%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 3.4,
                    "image": "artifact-lunar_totem-2",
                    "name": "Lunar Totem",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_totem_t2c", "slot_count": 0, "value": 5316.895747, "odds_multiplier": 0.9, "effects": [{"target": "away_earning_bonus", "value": 4, "text": "+300%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_totem_t2r", "slot_count": 1, "value": 29009.906728, "odds_multiplier": 0.03, "effects": [{"target": "away_earning_bonus", "value": 8, "text": "8x"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Powerful",
                    "quality": 6.5,
                    "image": "artifact-lunar_totem-3",
                    "name": "Powerful Lunar Totem",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_totem_t3c", "slot_count": 0, "value": 42117.186554, "odds_multiplier": 0.9, "effects": [{"target": "away_earning_bonus", "value": 20, "text": "20x"}]},
                        [T.Rarity.RARE]: {"id": "artifact_totem_t3r", "slot_count": 1, "value": 188266.980912, "odds_multiplier": 0.045, "effects": [{"target": "away_earning_bonus", "value": 40, "text": "40x"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Eggceptional",
                    "quality": 11.1,
                    "image": "artifact-lunar_totem-4",
                    "name": "Eggceptional Lunar Totem",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_totem_t4c", "slot_count": 0, "value": 233323.677759, "odds_multiplier": 0.9, "effects": [{"target": "away_earning_bonus", "value": 50, "text": "50x"}]},
                        [T.Rarity.RARE]: {"id": "artifact_totem_t4r", "slot_count": 1, "value": 1277854.484446, "odds_multiplier": 0.03, "effects": [{"target": "away_earning_bonus", "value": 100, "text": "100x"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_totem_t4e", "slot_count": 2, "value": 3688800.984116, "odds_multiplier": 0.0036, "effects": [{"target": "away_earning_bonus", "value": 150, "text": "150x"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_totem_t4l", "slot_count": 3, "value": 9035643.936518, "odds_multiplier": 0.0006, "effects": [{"target": "away_earning_bonus", "value": 200, "text": "200x"}]}
                    }
                }
            ]
        },
        [T.ArtifactFamily.PUZZLE_CUBE]: {
            "family_name": "Puzzle Cube",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Ancient",
                    "quality": 0.5,
                    "image": "artifact-puzzle_cube-1",
                    "name": "Ancient Puzzle Cube",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_cube_t1c", "slot_count": 0, "value": 36.470511, "odds_multiplier": 0.9, "effects": [{"target": "research_cost_bonus", "value": 0.95, "text": "-5%"}]}
                    }
                },
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 2.6,
                    "image": "artifact-puzzle_cube-2",
                    "name": "Puzzle Cube",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_cube_t2c", "slot_count": 0, "value": 2267.815035, "odds_multiplier": 0.9, "effects": [{"target": "research_cost_bonus", "value": 0.9, "text": "-10%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_cube_t2e", "slot_count": 2, "value": 20085.347517, "odds_multiplier": 0.01125, "effects": [{"target": "research_cost_bonus", "value": 0.85, "text": "-15%"}]}
                    }
                },
                {
                    "tier": 3,
                    "qualifier": "Mystical",
                    "quality": 6.8,
                    "image": "artifact-puzzle_cube-3",
                    "name": "Mystical Puzzle Cube",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_cube_t3c", "slot_count": 0, "value": 48655.335519, "odds_multiplier": 0.9, "effects": [{"target": "research_cost_bonus", "value": 0.8, "text": "-20%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_cube_t3r", "slot_count": 1, "value": 153807.623618, "odds_multiplier": 0.09, "effects": [{"target": "research_cost_bonus", "value": 0.78, "text": "-22%"}]}
                    }
                },
                {
                    "tier": 4,
                    "qualifier": "Unsolvable",
                    "quality": 11.1,
                    "image": "artifact-puzzle_cube-4",
                    "name": "Unsolvable Puzzle Cube",
                    "rarities": {
                        [T.Rarity.COMMON]: {"id": "artifact_cube_t4c", "slot_count": 0, "value": 260860.851265, "odds_multiplier": 0.72, "effects": [{"target": "research_cost_bonus", "value": 0.5, "text": "-50%"}]},
                        [T.Rarity.RARE]: {"id": "artifact_cube_t4r", "slot_count": 1, "value": 1844412.992058, "odds_multiplier": 0.0144, "effects": [{"target": "research_cost_bonus", "value": 0.47, "text": "-53%"}]},
                        [T.Rarity.EPIC]: {"id": "artifact_cube_t4e", "slot_count": 2, "value": 3400908.417855, "odds_multiplier": 0.004235, "effects": [{"target": "research_cost_bonus", "value": 0.45, "text": "-55%"}]},
                        [T.Rarity.LEGENDARY]: {"id": "artifact_cube_t4l", "slot_count": 3, "value": 8248378.854253, "odds_multiplier": 0.00072, "effects": [{"target": "research_cost_bonus", "value": 0.4, "text": "-60%"}]}
                    }
                }
            ]
        }
    },
    [T.ItemCategory.STONE]: {
        [T.StoneFamily.PROPHECY_STONE]: {
            "family_name": "Prophecy Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 6.2,
                    "image": "stone-prophecy-1",
                    "name": "Prophecy Stone Fragment",
                    "id": "stone_prophecy_t1",
                    "value": 33367.677649,
                    "odds_multiplier": 1.06},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 8.5,
                    "image": "stone-prophecy-2",
                    "name": "Prophecy Stone",
                    "id": "stone_prophecy_t2",
                    "value": 421387.187621,
                    "odds_multiplier": 0.05,
                    "effects": [{"target": "prophecy_egg_bonus", "value": 1.0005, "text": "+0.05%"}]},
                {
                    "tier": 3,
                    "qualifier": "Eggsquisite",
                    "quality": 12.8,
                    "image": "stone-prophecy-3",
                    "name": "Eggsquisite Prophecy Stone",
                    "id": "stone_prophecy_t3",
                    "value": 2016121.313549,
                    "odds_multiplier": 0.03,
                    "effects": [{"target": "prophecy_egg_bonus", "value": 1.001, "text": "+0.1%"}]},
                {
                    "tier": 4,
                    "qualifier": "Radiant",
                    "quality": 17.2,
                    "image": "stone-prophecy-4",
                    "name": "Radiant Prophecy Stone",
                    "id": "stone_prophecy_t4",
                    "value": 6355910.022815,
                    "odds_multiplier": 0.02,
                    "effects": [{"target": "prophecy_egg_bonus", "value": 1.0015, "text": "+0.15%"}]}
            ]
        },
        [T.StoneFamily.CLARITY_STONE]: {
            "family_name": "Clarity Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 6,
                    "image": "stone-clarity-1",
                    "name": "Clarity Stone Fragment",
                    "id": "stone_clarity_t1",
                    "value": 30046.40882,
                    "odds_multiplier": 1.06},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 8,
                    "image": "stone-clarity-2",
                    "name": "Clarity Stone",
                    "id": "stone_clarity_t2",
                    "value": 293343.150806,
                    "odds_multiplier": 0.07,
                    "effects": [{"target": "enlightenment_effectiveness", "value": 25, "text": "25%"}]},
                {
                    "tier": 3,
                    "qualifier": "Eggsquisite",
                    "quality": 12.2,
                    "image": "stone-clarity-3",
                    "name": "Eggsquisite Clarity Stone",
                    "id": "stone_clarity_t3",
                    "value": 1339289.804938,
                    "odds_multiplier": 0.05,
                    "effects": [{"target": "enlightenment_effectiveness", "value": 50, "text": "50%"}]},
                {
                    "tier": 4,
                    "qualifier": "Eggceptional",
                    "quality": 17.5,
                    "image": "stone-clarity-4",
                    "name": "Eggceptional Clarity Stone",
                    "id": "stone_clarity_t4",
                    "value": 6717510.81403,
                    "odds_multiplier": 0.02,
                    "effects": [{"target": "enlightenment_effectiveness", "value": 100, "text": "100%"}]}
            ]
        },
        [T.StoneFamily.LIFE_STONE]: {
            "family_name": "Life Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 4.3,
                    "image": "stone-life-1",
                    "name": "Life Stone Fragment",
                    "id": "stone_life_t1",
                    "value": 10363.22846,
                    "odds_multiplier": 1.06},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 6,
                    "image": "stone-life-2",
                    "name": "Life Stone",
                    "id": "stone_life_t2",
                    "value": 97767.625644,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "internal_hatchery_bonus", "value": 1.02, "text": "+2%"}]},
                {
                    "tier": 3,
                    "qualifier": "Good",
                    "quality": 9.52,
                    "image": "stone-life-3",
                    "name": "Good Life Stone",
                    "id": "stone_life_t3",
                    "value": 428216.690225,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "internal_hatchery_bonus", "value": 1.03, "text": "+3%"}]},
                {
                    "tier": 4,
                    "qualifier": "Eggceptional",
                    "quality": 15.2,
                    "image": "stone-life-4",
                    "name": "Eggceptional Life Stone",
                    "id": "stone_life_t4",
                    "value": 1913837.916825,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "internal_hatchery_bonus", "value": 1.04, "text": "+4%"}]}
            ]
        },
        [T.StoneFamily.QUANTUM_STONE]: {
            "family_name": "Quantum Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 3.8,
                    "image": "stone-quantum-1",
                    "name": "Quantum Stone Fragment",
                    "id": "stone_quantum_t1",
                    "value": 6985.726607,
                    "odds_multiplier": 1.06},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 5.5,
                    "image": "stone-quantum-2",
                    "name": "Quantum Stone",
                    "id": "stone_quantum_t2",
                    "value": 74012.883896,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "shipping_bonus", "value": 1.02, "text": "+2%"}]},
                {
                    "tier": 3,
                    "qualifier": "Phased",
                    "quality": 7.45,
                    "image": "stone-quantum-3",
                    "name": "Phased Quantum Stone",
                    "id": "stone_quantum_t3",
                    "value": 195413.983179,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "shipping_bonus", "value": 1.04, "text": "+4%"}]},
                {
                    "tier": 4,
                    "qualifier": "Meggnificent",
                    "quality": 13.7,
                    "image": "stone-quantum-4",
                    "name": "Meggnificent Quantum Stone",
                    "id": "stone_quantum_t4",
                    "value": 1372504.337427,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "shipping_bonus", "value": 1.05, "text": "+5%"}]}
            ]
        },
        [T.StoneFamily.DILITHIUM_STONE]: {
            "family_name": "Dilithium Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 4.1,
                    "image": "stone-dilithium-1",
                    "name": "Dilithium Stone Fragment",
                    "id": "stone_dilithium_t1",
                    "value": 8901.779025,
                    "odds_multiplier": 1.06},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 7,
                    "image": "stone-dilithium-2",
                    "name": "Dilithium Stone",
                    "id": "stone_dilithium_t2",
                    "value": 160096.394363,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "boost_duration_bonus", "value": 1.03, "text": "+3%"}]},
                {
                    "tier": 3,
                    "qualifier": "Eggsquisite",
                    "quality": 10.25,
                    "image": "stone-dilithium-3",
                    "name": "Eggsquisite Dilithium Stone",
                    "id": "stone_dilithium_t3",
                    "value": 542420.864079,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "boost_duration_bonus", "value": 1.06, "text": "+6%"}]},
                {
                    "tier": 4,
                    "qualifier": "Brilliant",
                    "quality": 16.85,
                    "image": "stone-dilithium-4",
                    "name": "Brilliant Dilithium Stone",
                    "id": "stone_dilithium_t4",
                    "value": 2661483.487963,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "boost_duration_bonus", "value": 1.08, "text": "+8%"}]}
            ]
        },
        [T.StoneFamily.SOUL_STONE]: {
            "family_name": "Soul Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 3.9,
                    "image": "stone-soul-1",
                    "name": "Soul Stone Fragment",
                    "id": "stone_soul_t1",
                    "value": 7589.039879,
                    "odds_multiplier": 1.06},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 5.1,
                    "image": "stone-soul-2",
                    "name": "Soul Stone",
                    "id": "stone_soul_t2",
                    "value": 58131.479486,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "soul_egg_bonus", "value": 1.05, "text": "+5%"}]},
                {
                    "tier": 3,
                    "qualifier": "Eggsquisite",
                    "quality": 9.1,
                    "image": "stone-soul-3",
                    "name": "Eggsquisite Soul Stone",
                    "id": "stone_soul_t3",
                    "value": 524165.1797,
                    "odds_multiplier": 0.05,
                    "effects": [{"target": "soul_egg_bonus", "value": 1.1, "text": "+10%"}]},
                {
                    "tier": 4,
                    "qualifier": "Radiant",
                    "quality": 13.1,
                    "image": "stone-soul-4",
                    "name": "Radiant Soul Stone",
                    "id": "stone_soul_t4",
                    "value": 1880372.644663,
                    "odds_multiplier": 0.04,
                    "effects": [{"target": "soul_egg_bonus", "value": 1.25, "text": "+25%"}]}
            ]
        },
        [T.StoneFamily.TERRA_STONE]: {
            "family_name": "Terra Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 4.2,
                    "image": "stone-terra-1",
                    "name": "Terra Stone Fragment",
                    "id": "stone_terra_t1",
                    "value": 9613.37027,
                    "odds_multiplier": 1.06},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 5.1,
                    "image": "stone-terra-2",
                    "name": "Terra Stone",
                    "id": "stone_terra_t2",
                    "value": 58131.479486,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "running_chicken_bonus", "value": 10, "text": "+10"}]},
                {
                    "tier": 3,
                    "qualifier": "Rich",
                    "quality": 7.8,
                    "image": "stone-terra-3",
                    "name": "Rich Terra Stone",
                    "id": "stone_terra_t3",
                    "value": 226334.470557,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "running_chicken_bonus", "value": 50, "text": "+50"}]},
                {
                    "tier": 4,
                    "qualifier": "Eggceptional",
                    "quality": 14.9,
                    "image": "stone-terra-4",
                    "name": "Eggceptional Terra Stone",
                    "id": "stone_terra_t4",
                    "value": 1795569.028501,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "running_chicken_bonus", "value": 100, "text": "+100"}]}
            ]
        },
        [T.StoneFamily.TACHYON_STONE]: {
            "family_name": "Tachyon Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 3,
                    "image": "stone-tachyon-1",
                    "name": "Tachyon Stone Fragment",
                    "id": "stone_tachyon_t1",
                    "value": 3291.894295,
                    "odds_multiplier": 1.06},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 3.25,
                    "image": "stone-tachyon-2",
                    "name": "Tachyon Stone",
                    "id": "stone_tachyon_t2",
                    "value": 13766.266268,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "laying_bonus", "value": 1.02, "text": "+2%"}]},
                {
                    "tier": 3,
                    "qualifier": "Eggsquisite",
                    "quality": 6.85,
                    "image": "stone-tachyon-3",
                    "name": "Eggsquisite Tachyon Stone",
                    "id": "stone_tachyon_t3",
                    "value": 149376.582539,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "laying_bonus", "value": 1.04, "text": "+4%"}]},
                {
                    "tier": 4,
                    "qualifier": "Brilliant",
                    "quality": 13.85,
                    "image": "stone-tachyon-4",
                    "name": "Brilliant Tachyon Stone",
                    "id": "stone_tachyon_t4",
                    "value": 1421172.890927,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "laying_bonus", "value": 1.05, "text": "+5%"}]}
            ]
        },
        [T.StoneFamily.SHELL_STONE]: {
            "family_name": "Shell Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 2,
                    "image": "stone-shell-1",
                    "name": "Shell Stone Fragment",
                    "id": "stone_shell_t1",
                    "value": 917.571578,
                    "odds_multiplier": 1.06},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 2.95,
                    "image": "stone-shell-2",
                    "name": "Shell Stone",
                    "id": "stone_shell_t2",
                    "value": 10104.301843,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "egg_value_bonus", "value": 1.05, "text": "+5%"}]},
                {
                    "tier": 3,
                    "qualifier": "Eggsquisite",
                    "quality": 6.85,
                    "image": "stone-shell-3",
                    "name": "Eggsquisite Shell Stone",
                    "id": "stone_shell_t3",
                    "value": 149376.582539,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "egg_value_bonus", "value": 1.08, "text": "+8%"}]},
                {
                    "tier": 4,
                    "qualifier": "Flawless",
                    "quality": 12.85,
                    "image": "stone-shell-4",
                    "name": "Flawless Shell Stone",
                    "id": "stone_shell_t4",
                    "value": 1118149.100504,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "egg_value_bonus", "value": 1.1, "text": "+10%"}]}
            ]
        },
        [T.StoneFamily.LUNAR_STONE]: {
            "family_name": "Lunar Stone",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Fragment",
                    "quality": 1.9,
                    "image": "stone-lunar-1",
                    "name": "Lunar Stone Fragment",
                    "id": "stone_lunar_t1",
                    "value": 643.461915,
                    "odds_multiplier": 1.59},
                {
                    "tier": 2,
                    "qualifier": "",
                    "quality": 3.5,
                    "image": "stone-lunar-2",
                    "name": "Lunar Stone",
                    "id": "stone_lunar_t2",
                    "value": 17443.780316,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "away_earning_bonus", "value": 1.2, "text": "+20%"}]},
                {
                    "tier": 3,
                    "qualifier": "Eggsquisite",
                    "quality": 7.25,
                    "image": "stone-lunar-3",
                    "name": "Eggsquisite Lunar Stone",
                    "id": "stone_lunar_t3",
                    "value": 179119.241098,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "away_earning_bonus", "value": 1.3, "text": "+30%"}]},
                {
                    "tier": 4,
                    "qualifier": "Meggnificent",
                    "quality": 13.25,
                    "image": "stone-lunar-4",
                    "name": "Meggnificent Lunar Stone",
                    "id": "stone_lunar_t4",
                    "value": 1233387.70098,
                    "odds_multiplier": 0.1,
                    "effects": [{"target": "away_earning_bonus", "value": 1.4, "text": "+40%"}]}
            ]
        }
    },
    [T.ItemCategory.INGREDIENT]: {
        [T.IngredientFamily.GOLD_METEORITE]: {
            "family_name": "Gold Meteorite",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Tiny",
                    "quality": 1.8,
                    "image": "ingredient-gold_meteorite-1",
                    "name": "Tiny Gold Meteorite",
                    "id": "ingredient_gold_t1",
                    "value": 311.280894,
                    "odds_multiplier": 5.25},
                {
                    "tier": 2,
                    "qualifier": "Enriched",
                    "quality": 6.8,
                    "image": "ingredient-gold_meteorite-2",
                    "name": "Enriched Gold Meteorite",
                    "id": "ingredient_gold_t2",
                    "value": 26660.931743,
                    "odds_multiplier": 3},
                {
                    "tier": 3,
                    "qualifier": "Solid",
                    "quality": 11.85,
                    "image": "ingredient-gold_meteorite-3",
                    "name": "Solid Gold Meteorite",
                    "id": "ingredient_gold_t3",
                    "value": 181914.430031,
                    "odds_multiplier": 2.25}
            ]
        },
        [T.IngredientFamily.TAU_CETI_GEODE]: {
            "family_name": "Tau Ceti Geode",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Tau",
                    "quality": 2.8,
                    "image": "ingredient-tau_ceti_geode-1",
                    "name": "Tau Ceti Geode Piece",
                    "id": "ingredient_geode_t1",
                    "value": 1582.202431,
                    "odds_multiplier": 3},
                {
                    "tier": 2,
                    "qualifier": "Glimmering",
                    "quality": 8.1,
                    "image": "ingredient-tau_ceti_geode-2",
                    "name": "Glimmering Tau Ceti Geode",
                    "id": "ingredient_geode_t2",
                    "value": 60213.817059,
                    "odds_multiplier": 1.8},
                {
                    "tier": 3,
                    "qualifier": "Radiant",
                    "quality": 13.8,
                    "image": "ingredient-tau_ceti_geode-3",
                    "name": "Radiant Tau Ceti Geode",
                    "id": "ingredient_geode_t3",
                    "value": 296181.874046,
                    "odds_multiplier": 2.25}
            ]
        },
        [T.IngredientFamily.SOLAR_TITANIUM]: {
            "family_name": "Solar Titanium",
            "tiers": [
                {
                    "tier": 1,
                    "qualifier": "Ore",
                    "quality": 3.2,
                    "image": "ingredient-solar_titanium-1",
                    "name": "Solar Titanium Ore",
                    "id": "ingredient_titanium_t1",
                    "value": 2412.367642,
                    "odds_multiplier": 3},
                {
                    "tier": 2,
                    "qualifier": "Bar",
                    "quality": 6.7,
                    "image": "ingredient-solar_titanium-2",
                    "name": "Solar Titanium Bar",
                    "id": "ingredient_titanium_t2",
                    "value": 34277.903934,
                    "odds_multiplier": 1.65},
                {
                    "tier": 3,
                    "qualifier": "Geogon",
                    "quality": 12.5,
                    "image": "ingredient-solar_titanium-3",
                    "name": "Solar Titanium Geogon",
                    "id": "ingredient_titanium_t3",
                    "value": 202719.493881,
                    "odds_multiplier": 2.55}
            ]
        }
    }
};


enum EffectType {
    ADDITIVE,
    MULTIPLICATIVE,
    UNKNOWN
};

const effectMetadata: Record<string, { type: EffectType, text: string }> = {
    "enlightenment_earning_bonus": { "type": EffectType.MULTIPLICATIVE, "text": "enlightenment egg value" },
    "prophecy_egg_bonus"         : { "type": EffectType.ADDITIVE      , "text": "to Egg of Prophecy bonus" },
    "team_laying_bonus"          : { "type": EffectType.ADDITIVE      , "text": "co-op teammates' egg laying rate" },
    "team_earning_bonus"         : { "type": EffectType.ADDITIVE      , "text": "co-op teammates' earnings" },
    "hold_to_hatch_bonus"        : { "type": EffectType.ADDITIVE      , "text": "hold to hatch rate" },
    "boost_bonus"                : { "type": EffectType.ADDITIVE      , "text": "boost boost" },
    "laying_bonus"               : { "type": EffectType.MULTIPLICATIVE, "text": "egg laying rate" },
    "soul_egg_collection_bonus"  : { "type": EffectType.ADDITIVE      , "text": "Soul Egg collection rate" },
    "internal_hatchery_bonus"    : { "type": EffectType.MULTIPLICATIVE, "text": "internal hatchery rate" },
    "shipping_bonus"             : { "type": EffectType.MULTIPLICATIVE, "text": "shipping rate" },
    "drone_cash_bonus"           : { "type": EffectType.ADDITIVE      , "text": "chance of cash in gifts and drones" },
    "drone_gold_bonus"           : { "type": EffectType.ADDITIVE      , "text": "chance of gold in gifts and drones" },
    "farm_value_bonus"           : { "type": EffectType.MULTIPLICATIVE, "text": "farm valuation" },
    "drone_frequency_bonus"      : { "type": EffectType.ADDITIVE      , "text": "drone frequency" },
    "hab_capacity_bonus"         : { "type": EffectType.MULTIPLICATIVE, "text": "hab capacity" },
    "egg_value_bonus"            : { "type": EffectType.MULTIPLICATIVE, "text": "egg value" },
    "drone_reward_bonus"         : { "type": EffectType.ADDITIVE      , "text": "drone rewards" },
    "running_chicken_bonus"      : { "type": EffectType.ADDITIVE      , "text": "max running chicken bonus" },
    "away_earning_bonus"         : { "type": EffectType.MULTIPLICATIVE, "text": "away earnings" },
    "research_cost_bonus"        : { "type": EffectType.MULTIPLICATIVE, "text": "research cost" },
    "enlightenment_effectiveness": { "type": EffectType.ADDITIVE      , "text": "effect of artifact on enlightenment" },
    "boost_duration_bonus"       : { "type": EffectType.MULTIPLICATIVE, "text": "boost duration" },
    "soul_egg_bonus"             : { "type": EffectType.ADDITIVE      , "text": "bonus per Soul Egg" }
};


/**
 * Return a unique string that can be used to sort items
 */
export function getSortId(item: T.Item | null): string {
    if (!item) return "";
    // @ts-ignore typescript fails to correlate the category index and the family index type in artifactMetadata
    const itemData = artifactMetadata[item.category]?.[item.family]?.tiers?.[item.tier-1];
    return item.category == T.ItemCategory.ARTIFACT ? itemData?.rarities?.[item.rarity]?.id : itemData?.id;
}

/**
 * Returns a readable name for an item
 */
export function getName(item: T.Item | null): string {
    if (!item) return "";
    // @ts-ignore
    const itemFamilyData = artifactMetadata[item.category]?.[item.family];
    const itemData = itemFamilyData?.tiers?.[item.tier-1];
    return itemData?.name ?? itemFamilyData?.family_name ?? "Unknown Item";
}

/**
 * Returns a list of descriptions for an item effects
 */
export function getDescriptions(item: T.Item | null): [string, string][] {
    if (!item) return [];
    // @ts-ignore
    const itemData = artifactMetadata[item.category]?.[item.family]?.tiers?.[item.tier-1];
    // @ts-ignore
    const effects: Effect[] = itemData?.effects ?? itemData?.rarities?.[item.rarity]?.effects;;
    const ret: [string, string][] = []
    if (!effects) return ret;
    for (const effect of effects) {
        ret.push([effect.text ?? "unknown", effectMetadata[effect.target]?.["text"] ?? "bonus"]);
    }
    return ret;
}

/**
 * Returns the file name of the item image
 */
export function getImageSource(item: T.Item | null): string {
    if (!item) return "/img/icons/stone-slot.png";
    // @ts-ignore
    const itemData = artifactMetadata[item.category]?.[item.family]?.tiers?.[item.tier-1];
    const filename = itemData?.image;
    return filename ? `/img/items/${filename}.png` : "/img/not-found.png";
}

/**
 * Returns the amount of stone slots of an artifact
 */
export function getSlotCount(artifact: T.Artifact): number {
    // @ts-ignore
    const itemData = artifactMetadata[artifact.category]?.[artifact.family]?.tiers?.[artifact.tier-1];
    // @ts-ignore
    return itemData?.rarities?.[artifact.rarity]?.slot_count;
}

/**
 * Returns a map of effects for an item
 * If the item contains stones, compound their effects, unless recursive is set to false.
 * If a certain bonus does not appear, the caller must handle the default value.
 */
export function getEffects(item: T.Item | null, recursive: boolean = true): Record<string, number> {
    if (!item) return {};
    // @ts-ignore
    const itemData = artifactMetadata[item.category]?.[item.family]?.tiers?.[item.tier-1];
    // @ts-ignore
    const effects: Effect[] = itemData?.effects ?? itemData?.rarities?.[item.rarity]?.effects;;
    if (!effects) return {};

    const ret: Record<string, number> = {};

    function applyEffect(target: string, value: number) {
        const type: EffectType = effectMetadata[target]?.["type"] ?? EffectType.UNKNOWN;
        switch (type) {
            case EffectType.ADDITIVE:
                ret[target] = (ret[target] ?? 0) + value;
                break;
            case EffectType.MULTIPLICATIVE:
                ret[target] = (ret[target] ?? 1) * value;
                break;
            case EffectType.UNKNOWN:
                console.log(`Unknown effect type '${type}' for ${target}, ignoring`);
                break;
        }
    };

    effects.forEach(({target, value}) => applyEffect(target, value));

    if (recursive && item.category === T.ItemCategory.ARTIFACT) {
        const artifact = item as T.Artifact;
        artifact.stones?.flatMap(stone => Object.entries(getEffects(stone)))
                    .forEach(([target, value]) => applyEffect(target, value));
    }

    return ret;
}

/*
 * Create a deep copy of an item
 */
export function copyItem(item: T.Item): T.Item {
  if (item.category === T.ItemCategory.ARTIFACT) {
    const artifact = item as T.Artifact;
    return {
      ...artifact,
      stones: artifact.stones.map(stone => (stone ? { ...stone } : null))
    };
  }
  return { ...item };
}


