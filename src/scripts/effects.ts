/**
 * Effects class, automatically handling all kind of effects from researches, artifacts...
 *
 * Detailed descriptions of effect variables are in effectMetadata.
 */


/*
 * General naming pattern is
 *  x_rate = x_base * x_mult
 *  where x_rate is a computed property
 *        x_base is an additive property
 *        x_mult is a multiplicative property
 *  The type is additive (0) or multiplicative (1). It is used both as an enum and as a neutral element
 *
 * Examples:
 *  Maximum laying rate:
 *      hab_capacity * laying_rate
 *  Effective laying rate:
 *      min(laying_rate, shipping_rate)
 *  Earning /chicken/second:
 *      laying_rate * egg_value * earning_mult * eb
 *  prestige gains at full habs for a given time:
 *      ((time * hab_capacity * laying_rate * egg_value *
 *        earning_mult * earning_away_mult * eb *
 *        prestige_earning_mult * 1e-6)**0.21
 *      - 155837117430.27557)*prestige_mult
 */
const effectMetadata = {

    /** Hatching Rate or Hold to Hatch Rate
     * (chicken/s)
     *
     * Amount of chicken per second dispensed from the hatchery to the road when holding the chicken button.
     *
     * Modified by:
     *  - Epic Research "Hold To Hatch"
     *  - Artifact "Actuator"
     *
     * Related:
     *  - Hab Capacity
     *  - Boost Quantum Warming bulb
     *  - Boost Dilithium Warming bulb
     */
    hatching_rate         : { type: 0, init: 2, text: "hold to hatch rate"},

    /** Internal Hatchery Rate
     * ihr (chicken/s) = ihr_base (chicken/s) * ihr_mult
     * ihr_away (chicken/s) = ihr (chicken/s) * ihr_away_mult
     *
     * Amount of chickens added to the population per second.
     * Depending on context, use either ihr or ihr_away.
     *
     * Base modified by:
     *  - Common Research "Internal Hatcheries"
     *  - Common Research "Internal Hatchery Upgrades"
     *  - Common Research "Internal Hatchery Expansion (T5)"
     *  - Common Research "Internal Hatchery Expansion (T7)"
     *  - Common Research "Machine Learning Incubators"
     *  - Common Research "Neural Linking"
     * Multiplier modified by:
     *  - Epic Research "Epic Int. Hatcheries"
     *  - Colleggtibles
     *  - Artifact "Chalice"
     *  - Stone "Life Stone"
     *  - Contract Modifiers
     *  - Boost "Tachyon Prism"
     * Away multiplier modified by:
     *  - Epic Research "Internal Hatchery Calm"
     *
     * Related:
     *  - Hab Capacity
     *  - Epic Research "Internal Hatchery Sharing"
     */
    ihr_base              : { type: 0, init: 0, text: "internal hatchery rate" },
    ihr_mult              : { type: 1, init: 4, text: "internal hatchery rate" },
    ihr_away_mult         : { type: 1, init: 1, text: "internal hatchery rate" },

    /** Hab Capacity
     * hab_capacity (chicken) = hab_capacity_base (chicken) * hab_capacity_mult
     *
     * Maximum amout of chicken in your population.
     * Note: The base must be replaced with `set` instead of updated through `apply`,
     *       since new habs replaces the previous ones.
     *
     * Base modified by:
     *  - Habs (initially a Coop for 250 chickens)
     * Multiplier modified by:
     *  - Colleggtibles
     *  - Common Research "Hen House Remodel"
     *  - Common Research "Microlux™ Chicken Suites"
     *  - Common Research "Grav Plating"
     *  - Common Research "Wormhole Dampening"
     *  - Artifact "Gusset"
     *  - Contract Modifiers
     *
     * Related:
     *  - Hatching Rate
     *  - Internal Hatchery Rate
     *  - Laying Rate
     */
    hab_capacity_base     : { type:-1, init: 250, text: "hab capacity" },
    hab_capacity_mult     : { type: 1, init: 1, text: "hab capacity" },

    /** Laying Rate
     * (egg/chicken/s)
     *
     * Amount of egg laid per chickens per second.
     * Note: This is not capped by shipping rate
     * Note: laying_rate is multiplicative
     *
     * Modified by:
     *  - Common Research "Comfortable Nests"
     *  - Common Research "Hen House A/C"
     *  - Common Research "Improved Genetics"
     *  - Common Research "Time Compression"
     *  - Common Research "Timeline Diversion"
     *  - Common Research "Relativity Optimization"
     *  - Epic Research "Epic Comfy Nests"
     *  - Colleggtibles
     *  - Artifact "Quantum Metronome"
     *  - Stone "Tachyon Stone"
     *  - Contract Modifiers
     *  - Coop deflector bonus
     *
     * Related:
     *  - Hab Capacity
     *  - Shipping Rate
     *  - Egg Value
     *  - Artifact "Tachyon Deflector"
     */
    laying_rate           : { type: 1, init: 2/60, text: "laying rate" },

    /** Shipping Rate
     * shipping_rate (egg/s) = shipping_base (egg/s) * shipping_mult
     *
     * Maximum amount of egg shipped per second.
     * Note: Research "Hyper Portalling" only affect hyperloops. However, when this research is available,
     *       hyperloop trains are basically free.
     * Note: The base must be replaced with `set` instead of updated through `apply`,
     *       since new vehicles replaces previous ones.
     *
     * Base modified by:
     *  - Vehicles (initially a Trike for 5000 egg/min)
     * Multiplier modified by:
     *  - Epic Research "Transportation Lobbyists"
     *  - Colleggtibles
     *  - Common Research "Improved Leafsprings"
     *  - Common Research "Lightweight Boxes"
     *  - Common Research "Driver Training"
     *  - Common Research "Super Alloy Frames"
     *  - Common Research "Quantum Egg Storage"
     *  - Common Research "Hover Upgrades"
     *  - Common Research "Dark Containment"
     *  - Common Research "Neural Net Refinement"
     *  - Common Research "Hyper Portalling"
     *  - Artifact "Interstellar Compas"
     *  - Stone "Quantum Stone"
     *  - Contract Modifiers
     *
     * Related:
     *  - Laying Rate
     *  - Egg Value
     */
    shipping_base         : { type:-1, init: 5000/60, text: "shipping rate" },
    shipping_mult         : { type: 1, init: 1, text: "shipping rate" },

    /** Egg Value
     * egg_value (bock/egg) = egg_value_base (bock/egg) * egg_value_mult
     *
     * Amount of money an egg is worth. Only shipped egg will actually be sold.
     * Note: The base must be replaced with `set` instead of updated through `apply`.
     *
     * Base modified by:
     *  - Egg (initially Edible Egg for 0.25 bock/egg)
     * Multiplier modified by:
     *  - Common Research "Nutritional Supplements"
     *  - Common Research "Padded Packaging"
     *  - Common Research "Bigger Eggs"
     *  - Common Research "USDE Prime Certification"
     *  - Common Research "Super-Feed™ Diet"
     *  - Common Research "Improved Genetics"
     *  - Common Research "Shell Fortification"
     *  - Common Research "Even Bigger Eggs"
     *  - Common Research "Genetic Purification"
     *  - Common Research "Graviton Coating"
     *  - Common Research "Crystalline Shelling"
     *  - Common Research "Telepathic Will"
     *  - Common Research "Atomic Purification"
     *  - Common Research "Multiversal Layering"
     *  - Common Research "Eggsistor Miniaturization"
     *  - Common Research "Matter Reconfiguration"
     *  - Common Research "Timeline Splicing"
     *  - Artifact "Dim Light of Eggendil"
     *  - Artifact "Demeters Necklace"
     *  - Artifact "Tungsten Ankh"
     *  - Stone "Shell Stone"
     *
     * Related:
     *  - Laying Rate
     *  - Shipping Rate
     *  - Earning Rate
     */
    egg_value_base        : { type:-1, init: 1, text: "egg value" },
    egg_value_mult        : { type: 1, init: 1, text: "egg value" },

    /** Earning Multiplier
     * (bock/bock)
     *
     * How much actual bocks you get out of each bock worth of eggs sold.
     * EB (earning bonus from mystical eggs) is not included!
     * Depending on context, use either:
     *  - `earning_mult` when idling the game open
     *  - `earning_away_mult` when idling the game closed
     *  - `earning_mrcb_mult` when running chickens (if the bonus is consistently maxed)
     * Note: Research "Padded Packaging" says it changes earnings, but it actually changes egg value.
     * Note: Earning Multiplier has the same effect as egg value, but it is not reflected in in-game stats.
     *
     * Multiplier modified by:
     *  - Permit level
     *  - Colleggtibles
     *  - Contract Modifiers
     *  - Boost "Jimbo's Excellent Bird Feed"
     *  - Event
     *  - Coop earning bonus
     * Away multiplier modified by:
     *  - Colleggtibles
     *  - Artifact "Lunar Totem"
     *  - Stone "Lunar Stone"
     *  - Contract Modifiers
     * RCB multiplier modified by:
     *  - Epic Research "Epic Multiplier"
     *  - Common Research "Coordinated Clucking"
     *  - Common Research "Motivational Clucking"
     *  - Common Research "Enlightened Chickens"
     *  - Artifact "Vial of Martian Dust"
     *  - Stone "Terra Stone"
     *
     * Related:
     *  - Egg Value
     *  - EB
     *  - Prestige Earning Multiplier
     *  - Artifact "Ship in a Bottle"
     */
    earning_mult          : { type: 1, init: 1, text: "earnings" },
    earning_away_mult     : { type: 1, init: 1, text: "away earnings" },
    earning_mrcb_mult     : { type: 0, init: 5, text: "max running chicken bonus" },

    /** EB or Earning Bonus
     * eb = soul_eggs * soul_egg_bonus * prophecy_egg_bonus^prophecy_eggs * 1.01^truth_eggs
     *
     * Comprise multiple components:
     *  - `soul_eggs`: amount of Soul Eggs owned
     *  - `prophecy_eggs`: amount of Eggs of Prophecy owned
     *  - `truth_eggs`: amount of Eggs of Truth owned
     *  - `soul_egg_bonus`: bonus brought by soul eggs
     *  - `prophecy_egg_bonus`: bonus brought by prophecy eggs
     * Note: the game shows the intermediate value `soul_egg_bonus * prophecy_egg_bonus^prophecy_eggs`
     *       capped at 2^31-1 on your prestige screen.
     * Note: Soul Eggs are stored as integers when the player has no Prophecy Eggs, and as float otherwise.
     *       The prestige screens shows a truncated value.
     *
     * Soul Egg Bonus modified by:
     *  - Epic Research "Soul Food"
     *  - Stone "Soul Stone"
     * Prophecy Egg Bonus modified by:
     *  - Epic Research "Prophecy Bonus"
     *  - Artifact "Book of Basan"
     *  - Stone "Prophecy Stone"
     *
     * Related:
     *  - Boost "Soul Mirror"
     *  - Earning Multiplier
     *  - Prestige Earning Multiplier
     */
    soul_eggs             : { type: 0, init: 0, text: "soul eggs" },
    prophecy_eggs         : { type: 0, init: 0, text: "eggs of prophecy" },
    truth_eggs            : { type: 0, init: 0, text: "eggs of truth" },
    soul_egg_bonus        : { type: 0, init: 0.1, text: "soul egg bonus" },
    prophecy_egg_bonus    : { type: 0, init: 1.05, text: "egg of prophecy bonus" },

    /** Prestige Earning Multiplier
     *
     * Multiply your earnings before entering the formula for Soul Egg gains conversion.
     *
     * Modified by:
     *  - Artifact "Phoenix Feather"
     *  - Boost "Soul Beacon"
     *
     * Related:
     *  - Earning Multiplier
     *  - EB
     *  - Prestige Multiplier
     */
    prestige_earning_mult : { type: 1, init: 1, text: "soul egg collection rate" },

    /** Prestige Multiplier
     *
     * Multiply your gained soul eggs on prestige.
     * Note: The prestige screen shows the amount of unclaimed soul egg after applying epic research
     *       but before applying events.
     *
     * Base modified by:
     *  - Epic Research "Prestige Bonus"
     *  - Event
     *
     * Related:
     *  - Prestige Earning Multiplier
     */
    prestige_mult         : { type: 1, init: 1, text: "soul eggs collected" },

    /** Boost Multiplier
     *
     * Multiply the effect of Bird Feeds, Soul Beacons and Tachyon Prisms.
     *
     * Base modified by:
     *  - Artifact "Dilithium Monocle"
     *  - Boost "Boost Beacon"
     *  - Boost Duration Multiplier
     */
    boost_mult            : { type: 1, init: 1, text: "boost boost" },

    /** Boost Duration Multiplier
     *
     * Multiply the duration of boosts upon launching.
     *
     * Base modified by:
     *  - Stone "Dilithium Stone"
     *  - Event
     *
     * Related:
     *  - Boost Multiplier
     */
    boost_duration_mult   : { type: 1, init: 1, text: "boost duration" },

    /** Research Cost
     *
     * Multiply the cost of Common Researches.
     *
     * Base modified by:
     *  - Epic Research "Lab Upgrade"
     *  - Colleggtibles
     *  - Artifact "Puzzle Cube"
     *  - Contract Modifiers
     *  - Event
     */
    research_cost_mult    : { type: 1, init: 1, minimize: true, text: "research cost" },

    /** Vehicle Cost
     *
     * Multiply the cost of Vehicles.
     *
     * Base modified by:
     *  - Epic Research "Bust Unions"
     *  - Colleggtibles
     *  - Contract Modifiers
     *  - Event
     */
    vehicle_cost_mult     : { type: 1, init: 1, minimize: true, text: "vehicle cost" },

    /** Hab Cost
     *
     * Multiply the cost of Habs.
     *
     * Base modified by:
     *  - Epic Research "Cheaper Contractors"
     *  - Colleggtibles
     *  - Contract Modifiers
     *  - Event
     */
    hab_cost_mult         : { type: 1, init: 1, minimize: true, text: "hab cost" },

    /** Team Earning Bonus
     *
     * Multiplies your teammates earnings.
     *
     * Base modified by:
     *  - Artifact "Ship in a Bottle"
     *
     * Related:
     *  - Earning Multiplier
     */
    team_earning_bonus    : { type: 0, init: 1, text: "co-op teammates' earnings" },

    /** Team Laying Bonus
     *
     * Multiplies your teammates laying rates.
     *
     * Base modified by:
     *  - Artifact "Tachyon Deflector"
     *
     * Related:
     *  - Laying Rate
     */
    team_laying_bonus     : { type: 0, init: 1, text: "co-op teammates' laying rates" },

    /** Drone Reward Multiplier
     *
     * Multiplies rewards from drones.
     * Note: Epic Research "Drone Rewards" has a different effect, it changes the probabilities of
     *       appearance of drone tiers. Although, the resulting effect is on average equivalent
     *       to a multiplier by (2 + lvl*0.1) for bock rewards and max(1 + lvl*0.1, lvl*0.2) for GE
     *
     * Base modified by:
     *  - Artifact "Aurelian Brooch"
     *  - Event
     *
     * Related:
     *  - Epic Research "Drone Rewards"
     *  - Drone Frequency Multiplier
     *  - Drone Gold Chance Multiplier
     *  - Drone Cash Chance Multiplier
     */
    drone_reward_mult     : { type: 1, init: 1, text: "drone rewards" },

    /** Drone Frequency Multiplier
     *
     * Multiply the frequency of appearance of drones.
     *
     * Base modified by:
     *  - Artifact "Neodymium Medallion"
     *  - Drone Reward Multiplier
     *  - Drone Gold Chance Multiplier
     *  - Drone Cash Chance Multiplier
     */
    drone_frequency_mult  : { type: 1, init: 1, text: "drone frequency" },

    /** Drone Gold Chance Multiplier
     *
     * Multiplies the probability of getting a gold reward from drones. Capped at 1.
     * Multiplies the weight of getting a gold reward from gifts.
     *
     * Base modified by:
     *  - Artifact "Beak of Midas"
     *  - Drone Reward Multiplier
     *  - Drone Frequency Multiplier
     *  - Drone Cash Chance Multiplier
     */
    drone_gold_mult       : { type: 1, init: 1, text: "chance of gold" },

    /** Drone Cash Chance Multiplier
     *
     * Multiplies the probability of getting a gold reward from drones.
     * The exact formula is unclear and seems bugged. Use with caution.
     *
     * Base modified by:
     *  - Artifact "Carved Rainstick"
     *  - Drone Reward Multiplier
     *  - Drone Frequency Multiplier
     *  - Drone Gold Chance Multiplier
     */
    drone_cash_mult       : { type: 1, init: 1, text: "chance of cash" },

    /** Farm Value Multiplier
     *
     * Multiply your Farm Value.
     *
     * Base modified by:
     *  - Epic Research "Accounting Tricks"
     *  - Artifact "Mercury's Lens"
     */
    farm_value_mult       : { type: 1, init: 1, text: "farm valuation" },

} as const;

export type EffectKey = keyof typeof effectMetadata;


export class Effects {
    protected values: Map<EffectKey, number>;

    constructor(...effects: Effects[]) {
        if (effects.length > 0) {
            this.values = new Map(effects[0].values);
            this.merge(...effects.slice(1));
        } else {
            this.values = new Map<EffectKey, number>();
        }
    }

    static fromMap(map: Map<EffectKey, number>): Effects {
        const effects = new Effects();
        for (const [k, v] of map) {
            effects.set(k, v); // skip identity values
        }
        return effects;
    }

    toMap(complete: boolean = false): Map<EffectKey, number> {
        if (!complete) return new Map(this.values);

        const result = new Map<EffectKey, number>();
        for (const key of Object.keys(effectMetadata) as EffectKey[]) {
            result.set(key, this.get(key));
        }
        return result;
    }

    static fromJSON(json: Record<EffectKey, number>): Effects {
        const effects = new Effects();
        for (const key in json) {
            effects.set(key as EffectKey, json[key as EffectKey]!);
        }
        return effects;
    }

    toJSON(): Record<EffectKey, number> {
        const obj: Partial<Record<EffectKey, number>> = {};
        for (const [key, value] of this.values) {
            obj[key] = value;
        }
        return obj as Record<EffectKey, number>;
    }

    /**
     * In-place merge Effect(s) objects
     */
    merge(...others: Effects[]): this {
        for (const other of others) {
            for (const [k, v] of other.values) {
                this.apply(k, v);
            }
        }
        return this;
    }

    /**
     * Apply an effect for a key
     */
    apply<K extends EffectKey>(key: K, value: number, repeat: number = 1): this {
        switch (effectMetadata[key].type) {
            case-1: this.set(key, Math.max(this.get(key), value)); break;
            case 0: this.set(key, this.get(key) + value*repeat); break;
            case 1: this.set(key, this.get(key) * value**repeat); break;
        }
        return this;
    }

    /**
     * Generic getter
     */
    get<K extends EffectKey>(key: K): number {
        const ret = this.values.get(key);
        if (ret !== undefined) return ret;
        switch (effectMetadata[key].type) {
            case-1: return 0;
            case 0: return 0;
            case 1: return 1;
        }
    }

    /**
     * Generic setter
     */
    set<K extends EffectKey>(key: K, v: number): this {
        // Works for type 0 and 1, -1 is never concerned since it should always be postive
        const neutral = Math.max(effectMetadata[key].type, 0);
        if (v === neutral) this.values.delete(key);
        else               this.values.set(key, v);
        return this;
    }

    /**
     * Return a score for this effect, higher scores are prefered
     * This must be used when the effect value is used in a generic optimization context, to make sure
     * decreasing-value effects like cost reduction are optimized correctly
     */
    getScore<K extends EffectKey>(key: K): number {
        return "minimize" in effectMetadata[key] && effectMetadata[key].minimize ? -this.get(key) : this.get(key);
    }

    static getBound(...effects: Effects[]): Effects {
        const ret = new Effects();
        for (const other of effects) {
            for (const [k, v] of other.values) {
                if ("minimize" in effectMetadata[k] && effectMetadata[k].minimize) {
                    ret.set(k, Math.min(ret.get(k), v));
                } else {
                    ret.set(k, Math.max(ret.get(k), v));
                }
            }
        }
        return ret;
    }

    /**
     * Return true if the effect is identical to new Effects()
     * If keys are given, only tried on specific keys
     */
    isDefault(keys?: EffectKey[]): boolean {
        return keys ? !keys.some(key => this.values.has(key)) : !this.values.size;
    }

    /**
     * Returns an iterator over keys with a non-default value
     */
    keys() {
        return this.values.keys();
    }

    // Defines getters for all EffectKey
    static {
        for (const key of Object.keys(effectMetadata) as EffectKey[]) {
            const neutral = Math.max(effectMetadata[key].type, 0);
            Object.defineProperty(this.prototype, key, {
                get() {
                    return this.values.get(key) ?? neutral;
                },
                set(v: number) {
                    // Works for type 0 and 1, -1 is never concerned since it should always be postive
                    if (v === neutral) this.values.delete(key);
                    else               this.values.set(key, v);
                },
                enumerable: true,
            });
        }
    }



    /**
     * Various shortcuts for common formula
     */
    get ihr() { return this.ihr_base * this.ihr_mult; }
    get ihr_away() { return this.ihr * this.ihr_away_mult; }
    get hab_capacity() { return this.hab_capacity_base * this.hab_capacity_mult; }
    get max_laying_rate() { return this.hab_capacity * this.laying_rate; }
    get shipping_rate() { return this.shipping_base * this.shipping_mult; }
    get egg_value() { return this.egg_value_base * this.egg_value_mult; }
    get eb() { return 1 + this.soul_eggs * this.soul_egg_bonus * Math.pow(this.prophecy_egg_bonus, this.prophecy_eggs) * Math.pow(1.01, this.truth_eggs); }




    /**
     * Base game effect, before any user-dependent modifiers are applied
     */
    private static createInitial(): Effects {
        const initial: Effects = new Effects();
        for (const key of Object.keys(effectMetadata) as EffectKey[]) {
            const baseValue = effectMetadata[key].init;
            initial.set(key, baseValue);
        }
        Object.freeze(initial);
        return initial;
    }
    static readonly initial: Effects = Effects.createInitial();

}

export interface Effects extends Record<EffectKey, number> {}


/**
 * Helper for getting the effect text
 */
export function getEffectText<K extends EffectKey>(key: K): string {
    return effectMetadata[key].text;
}

