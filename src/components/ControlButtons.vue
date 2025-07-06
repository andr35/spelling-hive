<script setup lang="ts">
import { useGameStore } from '../stores/game';
import HiveButton from './HiveButton.vue';


const gameStore = useGameStore();

</script>

<template>

    <div>
        <HiveButton @click="gameStore.deleteLetter">Delete</HiveButton>
        <HiveButton @click="gameStore.rotate">Rotate</HiveButton>
        <HiveButton @click="gameStore.enterWord">Enter</HiveButton>
        
    </div>
    

</template>

<style scoped>

</style>