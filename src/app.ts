import { createApp, ref, nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';
import * as T from '@/scripts/types.ts';
import App from '@/app.vue';


// TODO: delete this vv
// Temporary transition of local storage key name pattern
const keyMap = new Map<string, string[]>([
    ['player-eid', ['player-eid']],
    ['user-data', ['user-data']],

    ['allow-reslotting', ['earning-reslotting', 'boosting-reslotting', 'laying-reslotting', 'optimal-reslotting']],

    ['swap-cube', ['earning-cube-swap']],
    ['online', ['earning-online']],
    ['egg-value', ['earning-egg-value']],
    ['mirror', ['earning-mirror']],
    ['misc-bonus', ['earning-misc-bonus']],

    ['boosting-includes', ['boosting-including']],
    ['gusset-swapping', ['boosting-gusset-swap']],
    ['allowed-gusset', ['boosting-gusset-target', 'laying-gusset-target']],
    ['ihc-enabled', ['boosting-offline']],
    ['pinned-boost-sets', ['boosting-favourite-boost-sets']],

    ['deflector-mode', ['laying-deflector-mode']],
    ['allow-variants', ['laying-variants']],
    ['base-laying-rate', ['laying-base-laying-rate']],
    ['base-shipping-rate', ['laying-base-shipping-rate']],

]);
for (var i = 0; i < localStorage.length; i++){
    const key = localStorage.key(i)!;
    const value = localStorage.getItem(key)!;
    if ([...keyMap.values()].some(x => x.includes(key))) {
        // Recent entry, do not touch
    } else if (keyMap.has(key)) {
        for (const dest of keyMap.get(key)!) {
            if (!localStorage.getItem(dest)) {
                // If no recent entry exists, move old entry
                localStorage.setItem(dest, value);
            }
        }
        localStorage.removeItem(key);
    } else {
        localStorage.removeItem(key);
    }
}
// TODO: delete this ^^


const app = createApp(App);

app.config.errorHandler = (err) => {
    console.error('Global error:', err);
    router.push('/error');
    throw err;
};



import { RouterView, RouterLink } from 'vue-router';

app.component('router-view', RouterView);
app.component('router-link', RouterLink);

import ItemTooltip from '@/components/item-tooltip.vue';
import LoadEid from '@/components/load-eid.vue';
import InventoryComponent from '@/components/inventory-frame.vue';
import ItemComponent from '@/components/item-frame.vue';
import ArtifactSetCard from '@/components/artifact-set-card.vue';
import ResearchChart from '@/components/earning-set/research-chart.vue';
import SettingText from '@/components/setting-text.vue';
import SettingSwitch from '@/components/setting-switch.vue';
import BoostSetCard from '@/components/boosting-set/boost-set-card.vue';

app.component('item-tooltip', ItemTooltip);
app.component('load-eid', LoadEid);
app.component('inventory-frame', InventoryComponent);
app.component('item-frame', ItemComponent);
app.component('artifact-set-card', ArtifactSetCard);
app.component('research-chart', ResearchChart);
app.component('setting-text', SettingText);
app.component('setting-switch', SettingSwitch);
app.component('boost-set-card', BoostSetCard);



// Defines routes. View components are lazy-loaded
const routes = [
    {
        path: '/',
        redirect: '/laying-set'
    },
    {
        path: '/hoa',
        component: () => import('@/views/hoa.vue'),
        meta: { title: "Hall of Artifacts" }
    },
    {
        path: '/earning-set',
        component: () => import('@/views/earning-set.vue'),
        meta: { title: "Earning" }
    },
    {
        path: '/boosting-set',
        component: () => import('@/views/boosting-set.vue'),
        meta: { title: "Boosting" }
    },
    {
        path: '/laying-set',
        component: () => import('@/views/laying-set.vue'),
        meta: { title: "Laying" }
    },
    {
        path: '/optimal-set',
        component: () => import('@/views/optimal-set.vue'),
        meta: { title: "Optimal sets" }
    },
    {
        path: '/error',
        name: 'error',
        component: () => import('@/views/error.vue'),
        meta: { title: "Error" },
        props: (route: RouteLocationNormalized) => ({
            code: Number(route.query.code) || "",
            message: route.query.message || ""
        })
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('@/views/error.vue'),
        meta: { title: "Error 404 (not found)" },
        props: (route: RouteLocationNormalized) => ({
            code: Number(route.query.code) || 404,
            message: route.query.message || "Page not found"
        })
    },
];

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });

router.afterEach((to) => {
    nextTick(() => {
        document.title = (to.meta.title + " — " || "") + "Coop Assistant";
    });
});

router.isReady().then(() => {
    document.getElementById("page-loading")?.remove()
});

router.onError((err) => {
    console.error('Router error:', err);
    router.push('/error');
    throw err;
});

app.use(router);



const vm = app.mount('#app');

app.provide("showItemTooltip", (item: T.Item, event: Event) => {
    const tooltip = vm.$refs.itemTooltip as InstanceType<typeof ItemTooltip> | undefined;
    tooltip?.show(item, event);
});

app.provide("hideItemTooltip", () => {
    const tooltip = vm.$refs.itemTooltip as InstanceType<typeof ItemTooltip> | undefined;
    tooltip?.hide();
});

const highlightedItemId = ref<number | null>(null);
app.provide("highlightedItemId", highlightedItemId);

