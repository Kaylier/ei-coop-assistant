<template>
    <div class="filler"></div>
    <section class="not-found">
        <img src="/img/not-found.png" alt="Not Found Icon" class="not-found-icon" />
        <div class="not-found-text">
            <h1>Error {{code}}</h1>
            <p>{{message}}</p>
        </div>
    </section>
</template>

<script setup lang="ts">
defineProps<{
    code?: number,
    message?: string
}>();
</script>

<style scoped>
.not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: left;
    box-sizing: border-box;
}

.not-found-icon {
    width: 10em;
    height: 10em;
}

.not-found-text {
    width: 10em;
    height: 10em;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

h1 {
    color: #b33;
    margin: 0;
}

p {
    margin: 0;
    font-size: 1.2rem;
    color: #555;
}
</style>

