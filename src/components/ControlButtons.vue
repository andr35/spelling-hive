<script setup lang="ts">
import { useGameStore } from '../stores/game';
import HiveButton from './HiveButton.vue';


const gameStore = useGameStore();

</script>

<template>

    <div>
        <HiveButton @click="gameStore.deleteLetter">Delete</HiveButton>
        <HiveButton >Rotate</HiveButton>
        <HiveButton @click="gameStore.enterWord">Enter</HiveButton>
        <p class="error" v-if="gameStore.invalidWord != ''">{{ gameStore.invalidWord }}</p>
    </div>
    

</template>

<style scoped>
.error {
    text-align: center;
    font-size: medium;
    color: red;
}
</style>