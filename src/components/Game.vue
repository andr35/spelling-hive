<script setup lang="ts">
import LettersHive from "./LettersHive.vue";
import ControlButtons from "./ControlButtons.vue";
import GuessedWords from "./GuessedWords.vue";
import WordBuilder from "./WordBuilder.vue";
import { onBeforeMount, onMounted, onBeforeUnmount } from "vue";
import { useGameStore } from "@/stores/game";
import HiveButton from "./HiveButton.vue";

const gameStore = useGameStore();

onBeforeMount(() => {
  gameStore.setup();
});

// Keyboard controls
function handleKeydown(e: KeyboardEvent) {
  // Avoid interfering with text inputs/contenteditable
  const target = e.target as HTMLElement | null;
  if (target) {
    const tag = target.tagName.toLowerCase();
    const isEditable =
      tag === "input" ||
      tag === "textarea" ||
      (target as HTMLElement).isContentEditable;
    if (isEditable) return;
  }

  const key = e.key.toLowerCase();

  // Enter submits
  if (key === "enter") {
    e.preventDefault();
    gameStore.enterWord();
    return;
  }

  // Backspace/Delete removes last letter
  if (key === "backspace" || key === "delete") {
    e.preventDefault();
    gameStore.deleteLetter();
    return;
  }

  // Escape clears current word
  if (key === "escape" || key === "esc") {
    e.preventDefault();
    gameStore.currentWord = "";
    return;
  }

  // Rotate letters with Alt+R (avoid Ctrl+R which refreshes)
  if (e.altKey && key === "r") {
    e.preventDefault();
    gameStore.rotate();
    return;
  }

  // Space ignored (words contain only letters)
  if (key === " " || key === "spacebar") {
    e.preventDefault();
    return;
  }

  // Letters A-Z: add if part of hive letters
  // Do NOT type when a system modifier is pressed (Ctrl/Cmd/Meta/Alt),
  // so that shortcuts like Ctrl+R (reload) are not intercepted.
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    if (key.length === 1 && key >= "a" && key <= "z") {
      if (gameStore.letters.includes(key)) {
        e.preventDefault();
        gameStore.addLetter(key);

        // Also animate the corresponding hive letter as if clicked
        try {
          // LettersHive renders LetterCell in order; find cell by data-letter attribute
          const root = document.querySelector('.controls');
          const cell = root?.querySelector(
            `.hive .cell[data-letter="${key}"]`
          ) as HTMLElement | null;
          if (cell) {
            // retrigger the same 'pop' animation class used by clicks
            cell.classList.remove('pop');
            // force reflow
            void cell.offsetWidth;
            cell.classList.add('pop');
          }
        } catch {
          // no-op if not found
        }
      }
    }
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown, { passive: false });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="title">
    <h1>Spelling Hive 🐝</h1>
    <h4>
      Find the words using the letters of the hive, including the central letter
      at least once!
    </h4>
  </div>

  <div class="game">
    <div class="controls">
      <div class="word-builder">
        <WordBuilder />
      </div>

      <!-- Loading overlay when AI initializes a new game -->
      <div class="ai-loading" v-if="gameStore.loadingAI">
        <div class="spinner" aria-label="Loading new game from AI"></div>
        <div class="ai-loading-text">Asking the bee mind...</div>
      </div>

      <!-- Markup hint: add data-letter on each cell via :deep selector expectation -->
      <LettersHive />

      <div class="buttons">
        <ControlButtons v-if="!gameStore.victory" />

        <div class="buttons-between">
          <HiveButton
            :disabled="gameStore.victory || gameStore.loadingAI || gameStore.hintTyping"
            @click="gameStore.hint()"
            aria-label="Get a hinted word"
            title="Animate a valid word suggestion"
          >
            {{ gameStore.hintTyping ? "Hinting…" : "Hint" }}
          </HiveButton>
        </div>

        <div>
          <HiveButton @click="gameStore.newGame()">New game</HiveButton>
        </div>
      </div>

      <!-- AI settings panel -->
      <div class="ai-settings">
        <div class="ai-row">
          <label class="ai-toggle">
            <input
              type="checkbox"
              :checked="gameStore.aiEnabled"
              @change="
                gameStore.setAiEnabled(
                  ($event.target as HTMLInputElement).checked
                )
              "
            />
            <span>Enable AI</span>
          </label>
          <HiveButton
            :disabled="gameStore.loadingAI"
            @click="gameStore.newGame()"
          >
            {{
              gameStore.loadingAI ? "Initializing…" : "Start with AI / New game"
            }}
          </HiveButton>
        </div>

        <div class="ai-row">
          <input
            class="ai-input"
            type="password"
            placeholder="OpenRouter API Key"
            :value="gameStore.apiKey"
            @input="
              gameStore.setApiKey(($event.target as HTMLInputElement).value)
            "
          />
          <HiveButton
            @click="gameStore.fetchModels()"
            :disabled="!gameStore.apiKey || gameStore.loadingAI"
          >
            Fetch Models
          </HiveButton>
        </div>

        <div class="ai-row">
          <select
            class="ai-select"
            :value="gameStore.selectedModel"
            @change="
              gameStore.setSelectedModel(
                ($event.target as HTMLSelectElement).value
              )
            "
          >
            <option value="" disabled>Select a model</option>
            <option v-for="m in gameStore.models" :key="m.id" :value="m.id">
              {{ m.name || m.id
              }}<span v-if="(m.tags || []).includes('free')"> (FREE)</span>
            </option>
          </select>
        </div>

        <small class="ai-help">
          Your API key is stored locally in your browser. Models marked FREE do
          not require credits.
        </small>
      </div>
    </div>

    <div class="score">
      <GuessedWords />
    </div>
  </div>
</template>

<style scoped>
.title {
  flex: 0 0 100%;
  margin: 0.5rem 2rem 0.25rem;
  text-align: center;
}

/* Decorative line under title for visual anchor */
.title::after {
  content: "";
  display: block;
  width: min(180px, 40%);
  height: 4px;
  margin: 0.5rem auto 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #ffe77a 0%, #ffdc42 50%, #ffd416 100%);
  opacity: 0.9;
}

h1 {
  font-size: clamp(1.9rem, 2.2vw + 1rem, 2.8rem);
  letter-spacing: 0.6px;
  text-shadow: 0 1px 0 #fff7c7;
}

.title h4 {
  opacity: 0.85;
  margin-top: 0.5rem;
  font-size: clamp(0.95rem, 0.6vw + 0.8rem, 1.1rem);
}

/* Card-like panels for subtle depth */
.controls,
.score {
  background: #fffef7;
  border: 1px solid #f2e69a;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 7%);
  backdrop-filter: saturate(1.05);
}

/* Base layout */
.game {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  justify-content: center;
}

/* Soft gradient halo behind hive + controls section */
.controls {
  position: relative;
  flex: 1 1 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.4rem;
  margin: 0 1rem 2rem 1rem;
  padding: 1.1rem 1.25rem;
}
.controls::before {
  content: "";
  position: absolute;
  inset: -6px;
  z-index: -1;
  border-radius: 16px;
  background: radial-gradient(
    80% 60% at 50% 0%,
    rgba(255, 220, 66, 0.2),
    rgba(255, 220, 66, 0) 70%
  );
}

.score {
  flex: 1 0 420px;
  padding: 1.1rem 1.25rem;
}

/* subtle separators inside panels if needed */
.score :deep(hr),
.controls :deep(hr) {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, #f1e99b 40%, transparent);
  margin: 0.75rem 0;
}

.buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  box-sizing: border-box;
  padding-inline: 0.25rem;
}

/* Make Enter button visually primary and larger; keep New game smaller */
.buttons :deep(button),
.buttons :deep(.btn) {
  /* Base sizing for all action buttons here */
  font-size: 1rem;
  padding: 0.6rem 1rem;
}

/* ControlButtons renders: Delete, Rotate, Enter (3rd) */
.buttons :deep(.btn:nth-child(3)),
.buttons :deep(button:nth-child(3)) {
  /* Enlarge Enter */
  font-size: 1.1rem;
  padding: 0.75rem 1.25rem;
}

/* The New game button is placed after ControlButtons, directly under .buttons */
.buttons > :deep(.btn:last-child),
.buttons > :deep(button:last-child) {
  /* Reduce New game size */
  font-size: 0.95rem;
  padding: 0.5rem 0.85rem;
}

/* Buttons positioned between hive and AI settings */
.buttons-between {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Subtle pulse during hint typing animation */
.buttons-between :deep(button[disabled]) {
  position: relative;
}
.buttons-between :deep(button[disabled])::after {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 12px;
  background: radial-gradient(120% 120% at 50% 50%, rgba(255,220,70,0.25), rgba(255,220,70,0) 60%);
  animation: hintPulse 1s ease-in-out infinite;
  pointer-events: none;
}
@keyframes hintPulse {
  0% { opacity: 0.15; transform: scale(0.98); }
  50% { opacity: 0.35; transform: scale(1.02); }
  100% { opacity: 0.15; transform: scale(0.98); }
}

/* On small screens, stretch buttons to be easier to tap */
@media (max-width: 768px) {
  .buttons :deep(button),
  .buttons :deep(.btn) {
    width: min(420px, 100%);
  }

  /* Enlarge Enter even more on mobile for better tap target */
  .buttons :deep(.btn:nth-child(3)),
  .buttons :deep(button:nth-child(3)) {
    min-height: 52px;
    font-size: 1.15rem;
    padding: 0.85rem 1.3rem;
  }

  /* Downscale ONLY the "New game" button (the last button in .buttons) */
  .buttons > :deep(button:last-child),
  .buttons > :deep(.btn:last-child) {
    min-height: 42px;
    font-size: 0.95rem;
    padding: 0.55rem 0.9rem;
  }
}

/* Place game action buttons near the hive */
.hive-and-controls {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 1rem;
}

.beside-hive {
  align-items: stretch;
}

@media (max-width: 768px) {
  .hive-and-controls {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.5rem;
  }
  .beside-hive {
    width: 100%;
  }
  .beside-hive :deep(button) {
    width: min(420px, 100%);
  }
}

/* Subtle hover lift for buttons area */
.buttons :deep(button) {
  transition: transform 0.12s ease, box-shadow 0.12s ease,
    background-color 0.15s ease;
}
.buttons :deep(button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgb(0 0 0 / 10%);
}

/* AI settings layout */
.ai-settings {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding: 0.5rem 0 0.25rem;
}
.ai-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  width: 100%;
}
.ai-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.ai-input,
.ai-select {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid #e9e1a2;
  border-radius: 10px;
  background: #fffdf1;
  color: #333;
}
.ai-input::placeholder {
  color: #a89f60;
}
.ai-help {
  display: block;
  opacity: 0.8;
  font-size: 0.85rem;
  text-align: center;
}

/* Guard against any element wider than viewport on mobile */
@media (max-width: 768px) {
  .title {
    margin: 0.5rem 0.75rem 0.25rem;
  }

  .game {
    width: 100%;
    max-width: 100%;
  }

  .controls,
  .score,
  .ai-settings,
  .buttons {
    width: 100%;
    max-width: 100%;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    box-sizing: border-box;
  }

  /* Keep the main box within the viewport; no nested scrolling */
  .controls {
    max-width: 640px;
  }

  :deep(.hive) {
    transform-origin: center;
    margin-inline: auto;
    scale: 0.9;
  }
}

@media (max-width: 480px) {
  :deep(.hive) {
    scale: 0.78;
  }
}

/* Ensure hive container doesn't overflow on narrow screens */
:deep(.hive) {
  max-width: 100%;
}

/* Make each LetterCell expose a data-letter attribute for keyboard animation targeting */
:deep(.hive .cell) {
  /* no visual changes here; attribute is added in component via binding */
}

/* Responsive layout: stack vertically and scale hive on small screens */
@media (max-width: 768px) {
  .title {
    margin: 0.5rem 1rem 0.25rem;
    text-align: center;
  }

  .game {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .controls,
  .score {
    width: 100%;
    flex: 1 1 auto;
    margin: 0 0 0.75rem 0;
    padding: 0.85rem 0.85rem;
    border-radius: 12px;
  }

  .ai-row {
    grid-template-columns: 1fr;
  }

  /* Center and scale the hive proportionally without clipping */
  :deep(.hive) {
    transform-origin: center;
    scale: 0.9;
    margin-inline: auto;
  }

  /* Tighten vertical spacing */
  .buttons {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  :deep(.hive) {
    scale: 0.8;
  }

  /* Enlarge tap targets and make buttons full-width for thumb reach */
  :deep(button),
  :deep(.btn) {
    min-width: 44px;
    min-height: 44px;
  }
  .buttons :deep(button),
  .buttons :deep(.btn) {
    width: min(480px, 100%);
  }

  /* Reduce side margins so content breathes on very small screens */
  .title {
    margin: 0.5rem 1rem 0.25rem;
  }
}
</style>
