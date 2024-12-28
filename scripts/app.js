window.onerror = function(message, source, lineno, colno, error) { alert(message); };

const { loadModule } = window['vue3-sfc-loader'];

const options = {
    compiledCache: {
        set(key, str) {
            localStorage.setItem(key, str);
        },
        get(key) {
            return localStorage.getItem(key) || undefined;
        },
    },
    moduleCache: Object.assign(Object.create(null), {
        vue: Vue,
        router: VueRouter,
    }),
    getFile(url) {
        return fetch(url).then((resp) => resp.ok ? resp.text() : Promise.reject(resp));
    },
    addStyle(styleStr) {
        const style = document.createElement('style');
        style.textContent = styleStr;
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
    },
    log(type, ...args) {
        console.log(type, ...args);
    },
};





// Assign components

const { createApp, defineAsyncComponent } = Vue;
const app = createApp();

app.component('router-view', VueRouter.RouterView);
app.component('router-link', VueRouter.RouterLink);

app.component('load-eid', defineAsyncComponent(() => loadModule('./components/load-eid.vue', options)));
app.component('inventory-view', defineAsyncComponent(() => loadModule('./components/inventory.vue', options)));
app.component('inventory-sets', defineAsyncComponent(() => loadModule('./components/inventory-sets.vue', options)));
app.component('item-view', defineAsyncComponent(() => loadModule('./components/item.vue', options)));


// Router setup

const { createRouter, createWebHistory } = VueRouter;

const routes = [
    {
        path: '/',
        redirect: '/laying-set'
    },
    {
        path: '/hoa',
        component: () => loadModule('./components/hoa.vue', options),
        meta: { title: "Hall of Artifacts" }
    },
    {
        path: '/laying-set',
        component: () => loadModule('./components/laying-set.vue', options),
        meta: { title: "Choose Laying Set" }
    },
    {
        path: '/deflector-graph',
        component: () => loadModule('./components/deflector-graph.vue', options),
        meta: { title: "Deflector Graph" }
    },
    {
        path: '/error',
        name: 'error',
        component: () => loadModule('./components/error.vue', options),
        meta: { title: "Error" },
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => loadModule('./components/error.vue', options),
        meta: { title: "Error 404 (not found)" },
        props: true,
        params: { code: 404, message: "Page not found" }
    },
];

const router = createRouter({ history: createWebHistory(), routes });
router.afterEach((to, from) => {
    Vue.nextTick(() => {
        document.title = (to.meta.title + " - " || "") + "Coop Assistant";
    });
});
router.isReady().then(() => {
    document.getElementById("page-loading").remove()
});
router.onError((e) => {
    router.push('error');
    throw e;
});

app.use(router);


app.config.errorHandler = (err, instance, info) => {
    router.push('error');
    throw err;
};

// Mount app

app.mount('#app');

