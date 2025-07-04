<script setup lang="ts">
import { useGameStore } from '../stores/game';

const gameStore = useGameStore();

</script>

<template>
    <div class="container">
        <p>You have guessed {{ gameStore.guessedWords.length }} words. Still {{ gameStore.allowedWords.length - gameStore.guessedWords.length }} to guess</p>
        <ul>
            <li v-for="word in gameStore.guessedWords">{{ word.toUpperCase() }}</li>
        </ul>
    </div>

    
    <div>
        <ul>
            <li v-for="word in gameStore.allowedWords">{{ word }}</li>
        </ul>
    </div> 
   

</template>

<style scoped>
.container {
    border-left: 1px solid #cacaca;
    padding: 0 2rem;
}

li {
    list-style-type: none;
}
</style>