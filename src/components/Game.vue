<script setup lang="ts">
import LettersHive from './LettersHive.vue';
import ControlButtons from './ControlButtons.vue';
import GuessedWords from './GuessedWords.vue';
import WordBuilder from './WordBuilder.vue';
import { onBeforeMount, onMounted } from 'vue';
import { useGameStore } from '@/stores/game';

const gameStore = useGameStore();

onBeforeMount(() => {
    gameStore.setup()
})


</script>

<template>
    

    <div class="ui">
        <div class="title">
            <h1>Spelling Hive 🐝</h1>
            <h4>Find the words using the letters of the hive, must use the central letter at least once!</h4>
        </div>
        
    
        <div class="ui-hive">
            <WordBuilder />

            <LettersHive />

            <ControlButtons />
        </div>

        <GuessedWords />
    </div>

    

</template>

<style scoped>
.ui {
    display: flex;
    flex-wrap: wrap;
}

.ui-hive {
    flex: 0 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    margin: 0 2rem;
}

.title {
    flex: 0 0 100%;
    margin: 2rem 2rem;
}

h1 {
    font-size: 2.5rem;
}
</style>