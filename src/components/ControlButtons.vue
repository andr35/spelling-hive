<script setup lang="ts">
import { useGameStore } from '../stores/game';


const gameStore = useGameStore();

</script>

<template>

    <div>
        <button @click="gameStore.deleteLetter">Delete</button>
        <button>Rotate</button>
        <button @click="gameStore.enterWord">Enter</button>
    </div>

</template>

<style scoped>
button {
    border-radius: 20%;
    border: 1px solid #757575;
    padding: 0.5rem 1rem;
    margin: 0 0.5rem;
    background-color: white;
    display: inline;
}

button:hover {
    cursor: pointer;
    background-color: #c5c5c5;
}
</style>