import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// import wordsTxt from '../assets/words.txt?raw'
// import wordsTxt from '../assets/basic_words.txt?raw'
import wordsTxt from '../assets/better.txt?raw'

type OpenRouterModel = {
  id: string
  name?: string
  pricing?: { prompt?: string; completion?: string }
  tags?: string[]
}

type AiGameSpec = {
  letters: string[]
  center: string
  words: string[]
}

export const useGameStore = defineStore('game', () => {
  const allWords = ref<string[]>([])
  const allowedWords = ref<string[]>([])
  const letters = ref<string[]>([])
  const currentWord = ref('')
  const lastGuessedWord = ref('')
  const invalidWord = ref('')
  const guessedWords = ref<string[]>([])

  const hintWord = ref('')
  const hintTyping = ref(false)

  // AI settings
  const aiEnabled = ref<boolean>(false)
  const apiKey = ref<string>(localStorage.getItem('openrouter_api_key') || '')
  const selectedModel = ref<string>(localStorage.getItem('openrouter_model') || '')
  const models = ref<OpenRouterModel[]>([])
  const loadingAI = ref<boolean>(false)

  const victory = computed(() => {
    // Avoid false "victory" flashes when a new game is initializing (no words yet)
    return allowedWords.value.length > 0 && guessedWords.value.length === allowedWords.value.length;
  })

  function setup() {
    allWords.value = wordsTxt.split('\n')
    allWords.value.forEach(word => word.replace('\r', ''))
    // try to fetch models if key exists
    if (apiKey.value) {
      fetchModels().catch(() => {})
    }
    newGame()
  }

  function persistSettings() {
    try {
      localStorage.setItem('openrouter_api_key', apiKey.value || '')
      localStorage.setItem('openrouter_model', selectedModel.value || '')
      localStorage.setItem('spelling_hive_ai_enabled', aiEnabled.value ? '1' : '0')
    } catch (_) {}
  }

  function setApiKey(key: string) {
    apiKey.value = key.trim()
    persistSettings()
  }

  function setSelectedModel(modelId: string) {
    selectedModel.value = modelId
    persistSettings()
  }

  function setAiEnabled(enabled: boolean) {
    aiEnabled.value = enabled
    persistSettings()
  }

  function markError(msg: string) {
    invalidWord.value = msg
    setTimeout(() => {
      if (invalidWord.value === msg) invalidWord.value = ''
    }, 3000)
  }

  async function fetchModels(): Promise<void> {
    if (!apiKey.value) return
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Spelling Hive',
        }
      })
      if (!res.ok) throw new Error(`Failed to fetch models (${res.status})`)
      const data = await res.json()
      // data.data is an array of models
      models.value = (data.data || []) as OpenRouterModel[]
      // Prefer first free model if none selected
      if (!selectedModel.value && models.value.length) {
        const free = models.value.find(m => (m.tags || []).includes('free')) || models.value[0]
        selectedModel.value = free.id
        persistSettings()
      }
    } catch (e) {
      console.error(e)
      markError('Unable to fetch models')
    }
  }

  function newGame() {
    // Reset state first to avoid transient UI glitches
    currentWord.value = "";
    invalidWord.value = "";
    guessedWords.value = [];
    hintWord.value = "";
    allowedWords.value = [];

    if (aiEnabled.value && apiKey.value && selectedModel.value) {
      // use AI to initialize
      initGameWithAI().catch(err => {
        console.error(err)
        markError('AI init failed, using local words')
        initLocalGame()
      })
    } else {
      initLocalGame()
    }
  }

  function initLocalGame() {
    while(allowedWords.value.length < 5) {
      generateLetters();
      const allowedSet = new Set(letters.value)
      // Filter words to only keep those with the generated letters and that contain the central letter
      allowedWords.value = allWords.value.filter(word => [...word].every(letter => allowedSet.has(letter)) && word.includes(letters.value[3]))
      console.log(`Using letters ${letters.value}: genereted ${allowedWords.value.length} valid words out of ${allWords.value.length} words`)
      console.log(`Words to find: ${allowedWords.value}`)
    }
  }

  async function initGameWithAI() {
    loadingAI.value = true
    try {
      // Instruct the model to return strict JSON with letters, center, and words
      const prompt = `You are configuring a Spelling Bee-like game. Return STRICT JSON only with keys: letters, center, words.
Rules:
- language: all words MUST be valid English words (US or UK). Do NOT include proper nouns, abbreviations, acronyms, or non-English words.
- letters: an array of 7 unique lowercase letters a-z.
- center: one letter that MUST be included in every word; it MUST be one of the letters.
- words: 6-15 lowercase words, each 4+ letters, that use ONLY the provided letters and include the center at least once. Prefer fewer high-quality words rather than many. No duplicates.
- characters: letters only, ASCII a-z. No apostrophes, hyphens, diacritics, or spaces.
Format EXACTLY:
{"letters":["a","b","c","d","e","f","g"],"center":"d","words":["deaf","fade","caged"]}`

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Spelling Hive',
        },
        body: JSON.stringify({
          model: selectedModel.value,
          messages: [
            { role: 'system', content: 'You respond in strict JSON without explanations.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 800,
        })
      })

      if (!res.ok) throw new Error(`OpenRouter error ${res.status}`)
      const data = await res.json()
      const content: string = data.choices?.[0]?.message?.content || ''
      const jsonStart = content.indexOf('{')
      const jsonEnd = content.lastIndexOf('}')
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON in response')

      const parsed: AiGameSpec = JSON.parse(content.slice(jsonStart, jsonEnd + 1))

      if (!parsed?.letters || !Array.isArray(parsed.letters) || parsed.letters.length !== 7) {
        throw new Error('Invalid letters in AI response')
      }
      if (!parsed.center || typeof parsed.center !== 'string') {
        throw new Error('Invalid center in AI response')
      }
      if (!parsed.words || !Array.isArray(parsed.words) || parsed.words.length < 5) {
        throw new Error('Insufficient words in AI response')
      }

      // Normalize
      const uniqLetters = Array.from(new Set(parsed.letters.map(l => String(l).toLowerCase())))
      if (uniqLetters.length !== 7) throw new Error('Letters not unique')
      const center = parsed.center.toLowerCase()
      if (!uniqLetters.includes(center)) throw new Error('Center not part of letters')

      letters.value = uniqLetters
      // Ensure central letter at position 3 for UI expectations
      const centerIdx = letters.value.indexOf(center)
      if (centerIdx !== -1 && centerIdx !== 3) {
        const tmp = letters.value[3]
        letters.value[3] = letters.value[centerIdx]
        letters.value[centerIdx] = tmp
      }

      // Sanitize words
      const allowedSet = new Set(letters.value)
      let validWords = parsed.words
        .map(w => String(w).toLowerCase().trim())
        // English-only heuristic: only a-z characters
        .filter(w => /^[a-z]+$/.test(w))
        .filter(w => w.length >= 4)
        .filter(w => w.includes(letters.value[3]))
        .filter(w => [...w].every(ch => allowedSet.has(ch)))

      // Cap to at most 15 words to keep puzzles tight
      if (validWords.length > 15) {
        validWords = validWords.slice(0, 15)
      }

      allowedWords.value = Array.from(new Set(validWords))

      if (allowedWords.value.length < 5) {
        throw new Error('AI returned too few valid words after filtering')
      }
      console.log(`AI game: ${letters.value} with ${allowedWords.value.length} words [${allowedWords.value}]`)
    } catch (e) {
      console.error(e)
      // Fallback to local generation
      initLocalGame()
      markError('AI spec invalid, used local fallback')
    } finally {
      loadingAI.value = false
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

    // Trigger hive cell pop animation for this letter (if present in DOM)
    try {
      const root = document.querySelector('.controls');
      const cell = root?.querySelector(`.hive .cell[data-letter="${letter}"]`) as HTMLElement | null;
      if (cell) {
        cell.classList.remove('pop');
        // force reflow to restart CSS animation
        void cell.offsetWidth;
        cell.classList.add('pop');
      }
    } catch {
      // no-op if DOM not ready
    }
  }

  async function typeWordAnimated(word: string, delayMs = 200) {
    // Prevent concurrent animations
    if (hintTyping.value) return
    hintTyping.value = true
    try {
      // Clear current builder
      currentWord.value = ''

      // Sequentially add letters with a small delay and animate matching hive cells
      for (const ch of word) {
        addLetter(ch) // addLetter already triggers the pop on the corresponding cell
        await new Promise(res => setTimeout(res, delayMs))
      }

      // Brief pause to let the player see the full word, then submit
      await new Promise(res => setTimeout(res, Math.min(600, delayMs * 3)))
      enterWord()
    } finally {
      hintTyping.value = false
    }
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
    // Pick first missing valid word; if none or already animating, ignore
    if (hintTyping.value) return
    const missing = allowedWords.value.filter(word => !guessedWords.value.includes(word))
    const missingWord = missing[0]
    if (!missingWord) return

    // Optional masked preview for accessibility/visual aid
    const regex = new RegExp(`[^${letters.value[3]}]`, 'g')
    hintWord.value = missingWord.replace(regex, '?')
    setTimeout(() => {
      if (hintWord.value) hintWord.value = ""
    }, 2500)

    // Animate typing and auto-submit
    // Use faster cadence for long words
    const pace = missingWord.length > 6 ? 140 : 180

    // Also, visually pulse the distinct letters present in the hinted word right away
    try {
      const uniqueLetters = Array.from(new Set(missingWord.split('')));
      const root = document.querySelector('.controls');
      uniqueLetters.forEach((ch) => {
        const cell = root?.querySelector(`.hive .cell[data-letter="${ch}"]`) as HTMLElement | null;
        if (cell) {
          cell.classList.remove('pop');
          void cell.offsetWidth;
          cell.classList.add('pop');
        }
      });
    } catch {
      // ignore if DOM not present
    }

    // Fire-and-forget; internal guard prevents overlap
    void typeWordAnimated(missingWord, pace)
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
    hintTyping,
    typeWordAnimated,
    victory,

    // AI exports
    aiEnabled,
    apiKey,
    selectedModel,
    models,
    loadingAI,
    setApiKey,
    setSelectedModel,
    setAiEnabled,
    fetchModels,
  }
})
