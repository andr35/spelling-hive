import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// import wordsTxt from '../assets/words.txt?raw'
// import wordsTxt from '../assets/basic_words.txt?raw'
import wordsTxt from '../assets/better.txt?raw'

export const useGameStore = defineStore('game', () => {
  const allWords = ref<string[]>([])
  const allowedWords = ref<string[]>([])
  const letters = ref<string[]>([])
  const currentWord = ref('')
  const lastGuessedWord = ref('')
  const invalidWord = ref('')
  const guessedWords = ref<string[]>([])

  const hintWord = ref('')

  const victory = computed(() => {
    return guessedWords.value.length == allowedWords.value.length;
  })

  function setup() {
    allWords.value = wordsTxt.split('\n')
    allWords.value.forEach(word => word.replace('\r', ''))
    newGame()
  }

  function newGame() {
    allowedWords.value = [];
    currentWord.value = "";
    invalidWord.value = "";
    guessedWords.value = [];
    hintWord.value = "";
    while(allowedWords.value.length < 5) {
      generateLetters();
      const allowedSet = new Set(letters.value)
      // Filter words to only keep those with the generated letters and that contain the central letter
      allowedWords.value = allWords.value.filter(word => [...word].every(letter => allowedSet.has(letter)) && word.includes(letters.value[3]))
      console.log(`Using letters ${letters.value}: genereted ${allowedWords.value.length} valid words out of ${allWords.value.length} words`)
      console.log(`Words to find: ${allowedWords.value}`)
    }
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
      lastGuessedWord.value = currentWord.value
      guessedWords.value.push(currentWord.value)
      invalidWord.value = ""
    } else {
      if (guessedWords.value.includes(currentWord.value)) {
        invalidWord.value = "Word already found"
      } else if (!currentWord.value.includes(letters.value[3])) {
        invalidWord.value = "Word must include letter " + letters.value[3].toUpperCase()
      } else if (currentWord.value.length < 4) {
        invalidWord.value = "Word too short"
      } else {
        invalidWord.value = "Word not in list"
      }
    }
    setTimeout(() => {
      invalidWord.value = ""
    }, 2000);
    currentWord.value = ''
    hintWord.value = ''
  }

  function rotate() {
    const lettersCopy = [...letters.value]
    letters.value[0] = lettersCopy[2]
    letters.value[1] = lettersCopy[0]
    letters.value[2] = lettersCopy[5]
    letters.value[4] = lettersCopy[1]
    letters.value[5] = lettersCopy[6]
    letters.value[6] = lettersCopy[4]
  }

  function hint() {
    const missing = allowedWords.value.filter(word => !guessedWords.value.includes(word))
    const missingWord = missing[0]
    const regex = new RegExp(`[^${letters.value[3]}]`, 'g')
    hintWord.value = missingWord.replace(regex, '?')
    setTimeout(() => {
      hintWord.value = ""
    }, 5000)
  }

  return { 
    setup, 
    newGame, 
    letters, 
    currentWord, 
    lastGuessedWord, 
    guessedWords, 
    invalidWord, 
    addLetter, 
    deleteLetter, 
    enterWord, 
    rotate, 
    allowedWords,
    hint,
    hintWord,
    victory
  }
})
