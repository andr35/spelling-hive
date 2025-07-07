<script setup lang="ts">
import { useGameStore } from '../stores/game';


const props = defineProps<{
    letter: string,
    central?: boolean
}>();

const gameStore = useGameStore();

function onClickCell() {
    gameStore.addLetter(props.letter);
}


</script>

<template>

    <div 
        class="cell" 
        :class="{ 'central': props.central }"
        @click="onClickCell" 
    >
        <p class="letter">{{ letter?.toUpperCase() }}</p>
    </div>

</template>

<style scoped>
.cell {
    height: 5rem;
    width: fit-content;
    aspect-ratio: 1/cos(30deg);
    clip-path: polygon(50% -50%, 100% 50%, 50% 150%, 0 50%);
    background: var(--gray);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.3rem;
}

.cell:hover {
    background: var(--gray-hover);
    cursor: pointer;
}

.central {
    background: var(--yellow)
}

.central:hover {
    background: var(--yellow-hover)
}

.letter {
    font-size: x-large;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
}
</style>