<template>
    <section class="index-page">
        <div v-for="page in pages" :key="page.path" class="card" >
            <router-link :to="page.path" class="card-link">
                <img :src="page.img" alt=""/>
                <div>
                    <h2>{{ page.title }}</h2>
                    <p v-html="page.description"/>
                </div>
            </router-link>
        </div>
    </section>
    <section class="info">
        This website is fan-made and not affiliated to Auxbrain.<br/>
        If you find bugs, you can contact kaylier on the
            <a href="https://discord.gg/egginc">Egg, Inc. Discord server</a>.

    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Page {
    title: string,
    img: string,
    path: string,
    description: string,
}

const pages = ref<Page[]>([
    {
        title: 'Hall of Artifacts',
        img: "/img/icons/hoa.png",
        path: '/hoa',
        description: "Overview of your artifacts and saved artifact sets"
    }, {
        title: 'Earning',
        img: "/img/icons/earning-set.png",
        path: '/earning-set',
        description: "Helpers for building your contract farm:<br/>\
                      - Artifact recommendations for EB, Earning and Mirror sets<br/>\
                      - Estimations of time and population required to max your researches",
    }, {
        title: 'Boosting',
        img: "/img/icons/boosting-set.png",
        path: '/boosting-set',
        description: "Helpers for boosting in your contract farm:<br/>\
                      - Artifact recommendations for Dilithium and IHR sets<br/>\
                      - Estimations of chickens gained with various boost combos<br/>\
                      - Timer for tracking your boost time",
    }, {
        title: 'Laying',
        img: "/img/icons/laying-set.png",
        path: '/laying-set',
        description: "Helper for optimizing production in your contract farm<br/>\
                      Recommended artifacts for ranges of received deflector bonus",
    }, {
        title: 'Prestige',
        img: "/img/icons/prestige-set.png",
        path: '/prestige-set',
        description: "Temporary page for helping preparing prestiges<br/>\
                      Recommended artifacts for multiple strategies<br/>\
                      Estimation of your Soul Egg gains",
    },
]);

</script>

<style scoped>
.index-page {
    display: flex;
    flex-flow: column nowrap;
    gap: 0.75rem;
    padding: 2rem;
}

.info {
    font-size: 0.95rem;
}

.card {
    background: var(--bg-alt-color);
    border-radius: 0.75rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
    transform: scale(1.02);
    box-shadow: 0 0 .5em var(--bg-hover-color) inset;
}

.card-link {
    display: flex;
    flex-flow: row nowrap;
    gap: 1.5rem;
    text-decoration: none;
    color: inherit;
    padding: 1.5rem;
}

.card-link img {
    height: min(64px, 4rem);
}

@media (max-width: 55rem) {
    .card-link img {
        display: none;
    }
}

.card-link h2 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
}

.card-link p {
    margin: 0;
    color: var(--placeholder-color);
    font-size: 0.95rem;
}
</style>
