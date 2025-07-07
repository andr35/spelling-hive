<script setup lang="ts">
import LettersHive from './LettersHive.vue';
import ControlButtons from './ControlButtons.vue';
import GuessedWords from './GuessedWords.vue';
import WordBuilder from './WordBuilder.vue';
import { onBeforeMount, onMounted } from 'vue';
import { useGameStore } from '@/stores/game';
import HiveButton from './HiveButton.vue';

const gameStore = useGameStore();

onBeforeMount(() => {
    gameStore.setup()
})


</script>

<template>
    

    <div class="title">
        <h1>Spelling Hive 🐝</h1>
        <h4>Find the words using the letters of the hive, including the central letter at least once!</h4>
    </div>
    
    <div class="game">
        <div class="controls">
            <div class="word-builder">
                <WordBuilder />
            </div>            

            <LettersHive />

            <div class="buttons">
                <ControlButtons v-if="!gameStore.victory" />

                <HiveButton @click="gameStore.newGame()">New game</HiveButton>
            </div>
            
        </div>

        <div class="score">
            <GuessedWords />
        </div>
    </div>
    
</template>

<style scoped>
.title {
    flex: 0 0 100%;
    margin: 0.5rem 2rem;
}

h1 {
    font-size: 2.5rem;
}

.game {
    display: flex;
    flex-wrap: wrap;
}

.controls {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    margin: 0 1rem 2rem 1rem;
}

.score {
    flex: 1 0 70%;
}

.buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}
</style>