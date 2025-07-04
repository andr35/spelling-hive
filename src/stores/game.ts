import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import wordsTxt from '../assets/words.txt?raw'

export const useGameStore = defineStore('game', () => {
  const allWords = ref<string[]>()
  const allowedWords = ref<string[]>([])
  const newGame = ref(false);
  const letters = ref<string[]>([])
  const currentWord = ref('')
  const invalidWord = ref('')
  const guessedWords = ref<string[]>([])

  function setup() {
    newGame.value = true;
    allWords.value = wordsTxt.split('\n')
    while(allowedWords.value.length < 5) {
      generateLetters();
      const allowedSet = new Set(letters.value)
      // Filter words to only keep those with the generated letters and that contain the central letter
      allowedWords.value = allWords.value.filter(word => [...word].every(letter => allowedSet.has(letter)) && word.includes(letters.value[3]))
      console.log('Valid words: ' + allowedWords.value.length + ' / ' + allWords.value.length + ' words')
    }
    

    //letters.value = letters.value.map(l => l.toUpperCase())
  }

  function generateLetters() {
    letters.value = []
    const vowels = ['a', 'e', 'i', 'o', 'u']
    const consonats = ['w', 'r', 't', 'y', 'p', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm']

    const usedVowels = []
    var usedIndexes = new Set()
    while (usedVowels.length < 3) {
      const index = Math.floor(Math.random() * vowels.length)
      if (!usedIndexes.has(index)) {
        usedIndexes.add(index)
        usedVowels.push(vowels[index])
      }
    }

    const usedCons = []
    usedIndexes = new Set()
    while (usedCons.length < 4) {
      const index = Math.floor(Math.random() * consonats.length)
      if (!usedIndexes.has(index)) {
        usedIndexes.add(index)
        usedCons.push(consonats[index])
      }
    }

    letters.value = usedCons.concat(usedVowels)
    for (let i = letters.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters.value[i], letters.value[j]] = [letters.value[j], letters.value[i]]
    }
  }

  function addLetter(letter: string) {
    currentWord.value = currentWord.value.concat(letter);
  }

  function deleteLetter() {
    currentWord.value = currentWord.value.slice(0, currentWord.value.length-1)
  }

  function enterWord() {
    if (allowedWords.value.includes(currentWord.value) && !guessedWords.value.includes(currentWord.value)) {
      guessedWords.value.push(currentWord.value);
      invalidWord.value = ""
    } else {
      if (guessedWords.value.includes(currentWord.value)) {
        invalidWord.value = "Word already found"
      } else if (!currentWord.value.includes(letters.value[3])) {
        invalidWord.value = "Word must include letter " + letters.value[3].toUpperCase()
      } else {
        invalidWord.value = "Word not in list"
      }
    }
    currentWord.value = '';
  }

  return { setup, letters, currentWord, guessedWords, invalidWord, addLetter, deleteLetter, enterWord, allowedWords }
})
