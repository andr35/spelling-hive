<script setup lang="ts">
import { useGameStore } from '../stores/game';
import HiveButton from './HiveButton.vue';
import { Icon } from "@iconify/vue";


const gameStore = useGameStore();

</script>

<template>

    <div class="btns">
        <HiveButton @click="gameStore.deleteLetter">Delete</HiveButton>
        <HiveButton @click="gameStore.rotate">
            Rotate
        </HiveButton>
        <HiveButton @click="gameStore.enterWord">Enter</HiveButton>
        
    </div>
    

</template>

<style scoped>
.btns {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>