import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {
  const newGame = ref(false);
  const letters = ref<string[]>([])
  const currentWord = ref('')
  const guessedWords = ref<string[]>([])

  function setup() {
    newGame.value = true;
    generateLetters();
  }

  function generateLetters() {
    letters.value = []
    const vowels = ['a', 'e', 'i', 'o', 'u']
    const consonats = ['w', 'r', 't', 'y', 'p', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm']
    

    letters.value = ['a', 'b', 'c', 'x', 'e', 'f', 'g']
  }

  function addLetter(letter: string) {
    currentWord.value = currentWord.value.concat(letter);
  }

  function deleteLetter() {
    currentWord.value = currentWord.value.slice(0, currentWord.value.length-1)
  }

  function enterWord() {
    guessedWords.value.push(currentWord.value);
    currentWord.value = '';
  }

  return { setup, letters, currentWord, guessedWords, addLetter, deleteLetter, enterWord }
})
