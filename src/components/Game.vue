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
}

.ui-hive {
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
}
</style>