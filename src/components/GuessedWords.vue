<script setup lang="ts">
import { useGameStore } from '../stores/game';

const gameStore = useGameStore();

</script>

<template>
    <div>
        <p>You have guessed {{ gameStore.guessedWords.length }} words</p>
        <ul>
            <li v-for="word in gameStore.guessedWords">{{ word }}</li>
        </ul>
    </div>

</template>

<style scoped>

</style>