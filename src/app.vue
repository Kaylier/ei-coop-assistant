<template>

    <header>
        <nav>
            <router-link to="/" class="router-link logo">
                <img src="/favicon.png" id="logo-img" />
                <h1>Coop Assistant</h1>
            </router-link>
            <router-link to="/hoa" class="router-link">
                <img src="/img/icons/hoa.png" />
                <span>Hall of Artifacts</span>
            </router-link>
            <router-link to="/earning-set" class="router-link">
                <img src="/img/icons/earning-set.png" />
                <span>Earning Sets</span>
            </router-link>
            <router-link to="/laying-set" class="router-link">
                <img src="/img/icons/laying-set.png" />
                <span>Laying Sets</span>
            </router-link>
        </nav>
    </header>

    <main>
        <img src="/img/icons/loading.svg" id="page-loading" />
        <router-view />
        <div class="filler" />
        <item-tooltip ref="itemTooltip" />
    </main>

    <footer>
        <a href="javascript:localStorage.clear();location.reload();">clear cache</a>
        <a href="https://github.com/Kaylier/ei-coop-assistant">source code</a>
    </footer>

</template>

<style src="@/styles/style.css" />

