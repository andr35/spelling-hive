<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useGameStore } from '../stores/game';

const props = defineProps<{
  letter: string,
  central?: boolean
}>();

const gameStore = useGameStore();

// Toggle a class to retrigger CSS animation on each click or keyboard input
const popping = ref(false);
const rootEl = ref<HTMLDivElement | null>(null);

function triggerPop(fromEventEl?: HTMLElement | null) {
  // ensure we animate the cell root
  const el = fromEventEl ?? rootEl.value;
  if (!el) return;
  // retrigger animation
  el.classList.remove('pop');
  // force reflow
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  el.offsetWidth;
  el.classList.add('pop');
  popping.value = true;
}

function onClickCell(e?: MouseEvent) {
  if (!gameStore.victory) {
    gameStore.addLetter(props.letter);
    triggerPop(e?.currentTarget as HTMLElement | null);
  }
}

// Keyboard listener: animate when the same letter is typed
function handleKeydown(e: KeyboardEvent) {
  // ignore when typing in inputs/contenteditable
  const target = e.target as HTMLElement | null;
  if (target) {
    const tag = target.tagName.toLowerCase();
    const isEditable =
      tag === 'input' || tag === 'textarea' || target.isContentEditable;
    if (isEditable) return;
  }

  if (gameStore.victory) return;

  const key = e.key.toLowerCase();
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    if (key === props.letter) {
      // Only animate; Game.vue already adds the letter if valid.
      triggerPop(null);
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div
    ref="rootEl"
    class="cell"
    :data-letter="letter"
    :class="{ central: props.central, pop: popping }"
    @click="onClickCell"
    @animationend="popping = false"
  >
    <p class="letter" v-if="!gameStore.victory">{{ letter?.toUpperCase() }}</p>
    <p v-else-if="gameStore.victory && !props.central">🐝</p>
    <p v-else-if="gameStore.victory && props.central">🏆</p>
  </div>
</template>

<style scoped>
.cell {
  height: 5rem;
  width: fit-content;
  aspect-ratio: 1/cos(30deg);
  clip-path: polygon(50% -50%, 100% 50%, 50% 150%, 0 50%);
  background: var(--gray);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.3rem;
  transition: transform 120ms ease, background 120ms ease, box-shadow 120ms ease;
  will-change: transform;
}

.cell:hover {
  background: var(--gray-hover);
  cursor: pointer;
}

.central {
  background: var(--yellow)
}

.central:hover {
  background: var(--yellow-hover)
}

.letter {
  font-size: x-large;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

/* Pop animation for click/keyboard feedback */
@keyframes pop {
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
  30% { transform: scale(1.12); box-shadow: 0 6px 14px rgba(0,0,0,0.12); }
  60% { transform: scale(0.98); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
}

.pop {
  animation: pop 160ms ease-out forwards;
}
</style>
