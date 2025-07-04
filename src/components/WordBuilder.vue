<script setup lang="ts">
import { useGameStore } from '../stores/game';


const gameStore = useGameStore();

</script>

<template>

    <div class="word-container">
        <p v-if="gameStore.currentWord == ''">Click the letters</p>
        <p v-else>{{ gameStore.currentWord }}</p>
    </div>

</template>

<style scoped>

</style>
