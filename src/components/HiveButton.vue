<script setup lang="ts">

const emits = defineEmits(['click'])

</script>

<template>
    <button @click="emits('click')"><slot></slot></button>
</template>

<style scoped>
button {
    border-radius: 15%;
    border: 1px solid #cacaca;
    padding: 0.5rem 1rem;
    background-color: white;
    display: inline;
}

button:hover {
    cursor: pointer;
    background-color: var(--yellow-hover)
}
</style>