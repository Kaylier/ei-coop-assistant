<template>
    <div class="card-frame">
        <h3>
            <label v-if="description" tabindex="0" class="tooltip-icon">
                ⓘ
                <span class="tooltip-text" v-html="description" />
            </label>
            {{ title }}
            <img v-for="img in boostImages" :src="img"/>
        </h3>
        <inventory-frame :artifacts="set.set" :isSet="true" :userData="userData" :boosts="boosts" :column="4" :row="1" />

        <div v-for="entry of entries">
            <template v-if="entry.img" v-for="img of entry.img">
                <img v-if="img" :src="img"/>
            </template>
            <span class="highlighted" v-html="entry.valueUpd"/>
            {{ entry.text }}
            <template v-if="entry.valueNew">
                (
                <template v-if="entry.valueOld">
                    <span class="highlighted" v-html="entry.valueOld"/>
                    &rarr;
                </template>
                <span class="highlighted" v-html="entry.valueNew"/>
                )
            </template>
        </div>

        <slot/>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as T from '@/scripts/types.ts';
import { formatNumber } from '@/scripts/utils.ts';
import { getImageSource, getEffects } from '@/scripts/artifacts.ts';
import { Effects, getEffectText } from '@/scripts/effects.ts';

type StatKey = 'eb' | 'earn' | 'rcb' | 'away'
                    | 'se' | 'sercb' | 'seaway'
                    | 'cr' | 'dili' | 'ihr' | 'hab' | 'lay' | 'ship';

const props = defineProps<{
    title: string,
    description?: string,
    userData: T.UserData,
    set: T.ArtifactSet,
    externalCube?: T.Artifact,
    mirror?: number,
    boosts?: T.BoostCategory[],
    stats?: StatKey[], // Main stats, always shown
    substats?: StatKey[], // Secondary stats, shown when relevant
}>();


const boostImages = computed<string[]>(() => [
    ...(props.boosts?.includes(T.BoostCategory.BIRD_FEED) ? ["/img/boosts/earning_50x10.png"] : []),
    ...(props.boosts?.includes(T.BoostCategory.SOUL_BEACON) ? ["/img/boosts/soul_500x10.png"] : []),
    ...(props.boosts?.includes(T.BoostCategory.TACHYON_PRISM) ? ["/img/boosts/tachyon_1000x10.png"] : []),
]);


// Stat entry, "<img> <valueUpd> <text> (<valueOld> -> <valueNew>)"
type Entry = {
    img?: string[],
    text: string,
    valueUpd: string,
    valueOld?: string,
    valueNew?: string,
    relevant?: boolean,
};

const entries = computed<Entry[]>(() => {
    const ret = new Map<StatKey, Entry>();

    const nakedEff = props.userData?.maxedEffects ?? Effects.initial;
    const clothedEff = new Effects(nakedEff, props.set.effects);
    const hasBF = props.boosts?.includes(T.BoostCategory.BIRD_FEED);
    const hasSB = props.boosts?.includes(T.BoostCategory.SOUL_BEACON);
    const hasTach =  props.boosts?.includes(T.BoostCategory.TACHYON_PRISM);

    /** EB (Earning Bonus)
     * If a mirror is given and higher than clothed EB, show the effect of the mirror
     */
    const newEB = Math.max(clothedEff.eb, props.mirror ?? 1);
    ret.set('eb', {
        img: props.mirror && props.mirror > clothedEff.eb ? ["/img/icons/mirror.png"] : undefined,
        valueUpd: `×${formatNumber(newEB/nakedEff.eb)}`,
        text: "EB",
        valueOld: `${formatNumber(nakedEff.eb*100)}%`,
        valueNew: `${formatNumber(newEB*100)}%`,
        relevant: (newEB/nakedEff.eb) > 1,
    });

    /** Earnings
     * Baseline is online without running chickens, this allows direct comparison between online and offline sets
     */
    const earnings = clothedEff.laying_rate      / nakedEff.laying_rate
                   * clothedEff.egg_value        / nakedEff.egg_value
                   * clothedEff.earning_mult     / nakedEff.earning_mult
                   * clothedEff.eb               / nakedEff.eb
                   * (hasBF ? clothedEff.boost_mult / nakedEff.boost_mult : 1);
    const earnings_mrcb = earnings * clothedEff.earning_mrcb_mult;
    const earnings_away = earnings * clothedEff.earning_away_mult;
    ret.set('earn', {
        img: hasBF ? ["/img/boosts/earning_50x10.png"] : undefined,
        text: "earnings",
        valueUpd: `×${formatNumber(earnings)}`,
        relevant: earnings > 7,
    });
    ret.set('rcb', {
        img: hasBF ? ["/img/boosts/earning_50x10.png"] : undefined,
        text: "earnings (with rcb)",
        valueUpd: `×${formatNumber(earnings_mrcb)}`,
        relevant: earnings_mrcb > 540 && earnings_mrcb > earnings_away,
    });
    ret.set('away', {
        img: hasBF ? ["/img/boosts/earning_50x10.png"] : undefined,
        text: "earnings (away)",
        valueUpd: `×${formatNumber(earnings_away)}`,
        relevant: earnings_away > 540 && earnings_away > earnings_mrcb,
    });


    /** Soul Egg Gains
     * using 0.21 exponent approximation
     */
    const vearnings = earnings
                    * clothedEff.prestige_earning_mult / nakedEff.prestige_earning_mult
                    * (hasSB ? clothedEff.boost_mult / nakedEff.boost_mult : 1);
    const vearnings_mrcb = vearnings * clothedEff.earning_mrcb_mult;
    const vearnings_away = vearnings * clothedEff.earning_away_mult;
    const soulegg = Math.pow(vearnings, 0.21);
    const soulegg_mrcb = Math.pow(vearnings_mrcb, 0.21);
    const soulegg_away = Math.pow(vearnings_away, 0.21);
    ret.set('se', {
        img: [...(hasBF ? ["/img/boosts/earning_50x10.png"] : []), ...(hasSB ? ["/img/boosts/soul_500x10.png"] : [])],
        text: "SE gains",
        valueUpd: `×${formatNumber(soulegg)}`,
        relevant: soulegg > 1.5,
    });
    ret.set('sercb', {
        img: [...(hasBF ? ["/img/boosts/earning_50x10.png"] : []), ...(hasSB ? ["/img/boosts/soul_500x10.png"] : [])],
        text: "SE gains (with rcb)",
        valueUpd: `×${formatNumber(soulegg_mrcb)}`,
        relevant: soulegg_mrcb > 6 && soulegg_mrcb > soulegg_away,
    });
    ret.set('seaway', {
        img: [...(hasBF ? ["/img/boosts/earning_50x10.png"] : []), ...(hasSB ? ["/img/boosts/soul_500x10.png"] : [])],
        text: "SE gains (away)",
        valueUpd: `×${formatNumber(soulegg_away)}`,
        relevant: soulegg_away > 6 && soulegg_away > soulegg_mrcb,
    });

    /** Research cost
     * If an external cube is specified and better than the set cube, use it instead
     */
    const externalCubeMult = props.externalCube ? getEffects(props.externalCube).research_cost_mult : 1;
    const research_cost = clothedEff.research_cost_mult / nakedEff.research_cost_mult;
    ret.set('cr', {
        img: props.externalCube && externalCubeMult < research_cost ? [getImageSource(props.externalCube)] : undefined,
        text: getEffectText('research_cost_mult'),
        valueUpd: `-${formatNumber((1 - Math.min(externalCubeMult, research_cost))*100)}%`,
        relevant: externalCubeMult < 1 || research_cost < 1,
    });


    /** Boost duration
     */
    const boost_duration = clothedEff.boost_duration_mult / nakedEff.boost_duration_mult;
    ret.set('dili', {
        text: getEffectText('boost_duration_mult'),
        valueUpd: `×${formatNumber(boost_duration)}`,
        relevant: boost_duration > 1,
    });

    /** IHR
     */
    const ihr = clothedEff.ihr / nakedEff.ihr
              * (hasTach ? clothedEff.boost_mult / nakedEff.boost_mult : 1);
    ret.set('ihr', {
        img: hasTach ? ["/img/boosts/tachyon_1000x10.png"] : undefined,
        text: getEffectText('ihr_mult'),
        valueUpd: `×${formatNumber(ihr)}`,
        //valueNew: `${formatNumber(clothedEff.ihr*60)} chicken/min`,
        relevant: ihr > 1,
    });

    /** Hab Capacity
     */
    const hab_capacity = clothedEff.hab_capacity / nakedEff.hab_capacity;
    ret.set('hab', {
        text: getEffectText('hab_capacity_mult'),
        valueUpd: `×${formatNumber(hab_capacity)}`,
        valueNew: formatNumber(clothedEff.hab_capacity),
        relevant: hab_capacity > 1,
    });

    /** Laying and Shipping Rates
     */
    const laying_rate = clothedEff.laying_rate / nakedEff.laying_rate;
    const shipping_rate = clothedEff.shipping_rate / nakedEff.shipping_rate;
    ret.set('lay', {
        text: getEffectText('laying_rate'),
        valueUpd: `×${formatNumber(laying_rate)}`,
        relevant: laying_rate > 1,
    });
    ret.set('ship', {
        text: getEffectText('shipping_mult'),
        valueUpd: `×${formatNumber(shipping_rate)}`,
        relevant: shipping_rate > 1,
    });

    const stats = props.stats ?? [];
    const substats = (props.substats ?? [...ret.keys()]).filter(x => !stats.includes(x) && ret.get(x)!.relevant);
    return [...stats, ...substats].filter(x => ret.has(x)).map(x => ret.get(x)!);
});

</script>

<style scoped>

.card-frame {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: 0.3em;
    padding: 0.3em;
    background-color: #333333;
    border-radius: 2em 2em 1em 1em;
    font: 1.1em always-together;
    width: min(16em, 90vw);
    box-shadow: 0 0 .5em var(--bg-hover-color) inset;
}

.card-frame h3 {
    font-size: 1.3em;
    margin: 0;
}

.highlighted {
    color: color-mix(in srgb, var(--active-color) 75%, white);
    font-kerning: none;
}

h3 > img {
    height: 0.75em;
}

div > img {
    height: 0.75em;
    margin: 0 0.2em 0 0;
    scale: 1.4;
    filter: saturate(0.5);
}

</style>

