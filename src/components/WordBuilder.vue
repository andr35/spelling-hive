<script setup lang="ts">
import { watch, ref } from 'vue';
import { useGameStore } from '../stores/game';


const gameStore = useGameStore();

const showGuessed = ref(false);
const showError = ref(false);

watch(() => gameStore.lastGuessedWord, () => {
    if (gameStore.lastGuessedWord != '') {
        showGuessed.value = true;
        setTimeout(() => {
            showGuessed.value = false;
        }, 2000);
    }
});

watch(() => gameStore.currentWord, () => {
    if (gameStore.currentWord != '') {
        showGuessed.value = false;
    }
})

watch(() => gameStore.invalidWord, () => {
    showError.value = true
    setTimeout(() => {
        showError.value = false;
    }, 2000);
})

</script>

<template>

    <div class="word-container">
        <p v-if="!showGuessed">
            <span v-for="letter in [...gameStore.currentWord]" :class="{'highlight-letter': letter == gameStore.letters[3]}">
                {{ letter.toUpperCase() }}
            </span>
            <span class="beam">|</span>
        </p>
        <p v-else class="guessed">
            <span class="rotating-bee">🐝</span> {{ gameStore.lastGuessedWord.toUpperCase() }} <span class="rotating-bee">🐝</span>
        </p>
        <p class="error" v-if="showError">{{ gameStore.invalidWord }}</p>
    </div>

</template>

<style scoped>
.word-container {
    height: 6rem;
}

p {
    text-align: center;
    font-size: 2rem;
}

.guessed {
    color: var(--yellow-hover);
    animation: change-color-guessed 0.5s infinite;
}

@keyframes change-color-guessed {
  0% { color: var(--bg) }
  100% { color: var(--yellow-hover) }
}

.rotating-bee {
      display: inline-block;
      animation: rotate 0.5s linear infinite;
    }

@keyframes rotate {
    from {
    transform: rotate(0deg);
    }
    to {
    transform: rotate(360deg);
    }
}

.highlight-letter {
    color: #ffdc42;
}

.beam {
    animation: change-color 1s infinite;
}

@keyframes change-color {
  0% { color: var(--bg) }
  100% { color: var(--yellow-hover) }
}

.error {
    text-align: center;
    font-size: medium;
    color: red;
}
</style>
