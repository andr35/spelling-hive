<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import LetterCell from './LetterCell.vue';

const gameStore = useGameStore();

</script>

<template>

    <div class="hive">
        <div class="two-col">
            <LetterCell :letter="gameStore.letters[0]" />
            <LetterCell :letter="gameStore.letters[1]" />
        </div>

        <div class="three-col">
            <LetterCell :letter="gameStore.letters[2]" />
            <LetterCell :letter="gameStore.letters[3]" :central="true" />
            <LetterCell :letter="gameStore.letters[4]" />
        </div>
        
        <div class="two-col">
            <LetterCell :letter="gameStore.letters[5]" />
            <LetterCell :letter="gameStore.letters[6]" />
        </div>
    </div>


</template>

<style scoped>

.hive {
    margin: 0;
    padding: 0;
    display: flex;
}

.two-col {
    margin: 2.8rem 0;
    display: flex;
    flex-direction: column;
}

.three-col {
    margin: 0 -1.48rem;
    display: flex;
    flex-direction: column;
}
</style>