<script setup lang="ts">
import { useGameStore } from '../stores/game';


const gameStore = useGameStore();

</script>

<template>

    <div class="word-container">
        <p>
            <span v-for="letter in [...gameStore.currentWord]" :class="{'highlight-letter': letter == gameStore.letters[3]}">
                {{ letter.toUpperCase() }}
            </span>
            <span class="beam">|</span>
        </p>
    </div>

</template>

<style scoped>
p {
    text-align: center;
    font-size: 2rem;
}

.highlight-letter {
    color: #ffdc42;
}

.beam {
    animation: change-color 1s infinite;
}

@keyframes change-color {
  0% { color: var(--bg) }
  100% { color: var(--yellow-hover) }
}

</style>
