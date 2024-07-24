<script name="ThInput" setup lang="ts">
import type { InputPlusProperty } from './input'
import ThInputPlus from './ThInputPlus.vue'
import { Status } from '~/composables/chat'

const props = defineProps<{
  status: Status
  shrink: boolean
  hide: boolean
}>()
const emits = defineEmits<{
  (name: 'send', data: any): void
  (name: 'clear'): void
}>()

const input = ref('')
const nonPlusMode = computed(() => input.value.startsWith('/') || input.value.startsWith('@'))
const inputProperty = reactive<InputPlusProperty>({
  internet: true,
})
const inputHistories = useLocalStorage<string[]>('inputHistories', [])
const inputHistoryIndex = ref(inputHistories.value.length - 1)
const showSend = computed(() => input.value.trim().length)

function handleSend(event: Event) {
  if (!showSend.value)
    return
  if (props.status !== Status.AVAILABLE)
    return

  event.preventDefault()

  const el = document.getElementById('main-input')!

  el!.style.height = ''

  inputHistories.value.push(input.value)
  inputHistories.value = inputHistories.value.slice(-15)

  inputHistoryIndex.value = inputHistories.value.length - 1

  emits('send', input.value)

  input.value = ''
}

function handleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()

    if (event.shiftKey) {
      event.stopPropagation()

      input.value += '\n'
    }
    else { handleSend(event) }

    return
  }

  if (inputHistories.value.length < 1)
    return

  const isLastOne = inputHistoryIndex.value === inputHistories.value.length - 1

  const { key } = event
  if (key === 'ArrowUp') {
    if (inputHistoryIndex.value !== 0 && isLastOne)
      input.value && inputHistories.value.push(input.value)

    if (!isLastOne)
      inputHistoryIndex.value -= 1
    if (inputHistoryIndex.value < 0)
      inputHistoryIndex.value = 0
  }
  else if (key === 'ArrowDown') {
    if (isLastOne)
      return (input.value = '')

    inputHistoryIndex.value = inputHistoryIndex.value + 1

    if (inputHistoryIndex.value > inputHistories.value.length - 1)
      inputHistoryIndex.value = inputHistories.value.length - 1
  }
  else {
    return
  }

  input.value = inputHistories.value[inputHistoryIndex.value]
}

function triggerUpdateInput() {
  const el = document.getElementById('main-input')!

  el!.style.height = ''
  el!.style.height = `${el.scrollHeight}px`
}

watch(
  () => input.value,
  () => {
    nextTick(triggerUpdateInput)
  },
  { immediate: true },
)

onMounted(() => {
  const el = document.getElementById('main-input')

  setTimeout(() => {
    el?.focus()
  })
})
</script>

<template>
  <div
    :class="{
      disabled: hide,
      shrink,
      collapse: nonPlusMode,
      showSend,
      generating: status === Status.GENERATING,
      error: status === Status.ERROR,
    }" class="ThInput" @keydown.enter="handleSend"
  >
    <div v-if="false" class="ThInput-Float">
      <el-tag>QuotaGPT-Smart</el-tag>
    </div>

    <ThInputPlus v-model="inputProperty" />

    <div class="ThInput-Input">
      <textarea
        id="main-input" v-model="input" maxlength="3000" autofocus autocomplete="off" placeholder="问任何问题都可以 (Shift + Enter以换行)..."
        @keydown="handleInputKeydown"
      />
    </div>

    <div class="ThInput-Send" @click="handleSend">
      <div i-carbon:send-alt />
      <span v-if="status === Status.GENERATING">生成中</span>
      <span v-else-if="status === Status.ERROR">出现错误，请刷新页面。</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ThInput-Float {
  z-index: -1;
  position: absolute;
  display: flex;

  justify-content: flex-start;

  top: -50px;
  left: 0;

  width: 100%;
  height: 40px;

  border-radius: 14px;
  box-shadow: var(--el-box-shadow);
  background: var(--el-bg-color-page);
}

.ThInput {
  &.collapse {
    .ThInput-Plus {
      display: none;
    }
  }

  &.disabled {
    .ThInput-Input,
    .ThInput-Send,
    .ThInput-Plus {
      opacity: 0;
    }

    width: 0 !important;

    opacity: 0;
    pointer-events: none;

    transition:
      opacity 0.125s 0.375s,
      width 0.5s;
  }
  &.error {
    padding: 0;
  }

  span {
    position: absolute;

    top: 50%;
    left: 50%;

    width: max-content;

    transform: translate(-50%, -50%);
  }

  z-index: 3;
  position: absolute;
  padding: 0.5rem 0.75rem;
  display: flex;

  gap: 0.5rem;
  align-items: flex-end;

  left: 50%;
  bottom: 2.5%;

  width: 80%;
  min-height: 50px;

  &.shrink {
    width: 80%;

    transform: translateX(-50%);
  }

  &.generating {
    width: 20%;
    height: 50px;

    transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  box-sizing: border-box;
  border-radius: 16px;
  transform: translateX(-50%);
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
  transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);

  // transition:
  //   opacity 0.25s,
  //   width 0.75s;
}

.ThInput-Input {
  .error &,
  .generating & {
    opacity: 0;

    pointer-events: none;
  }

  textarea {
    &:focus-visible {
      outline: none;
      border: none;
    }

    position: relative;

    top: 0;

    width: calc(100% - 20px - 1.5rem);
    max-height: 330px;
    height: 22px;
    min-height: 22px;
    overflow: visible;

    resize: none;
    box-sizing: border-box;
    // transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    background-color: transparent;
  }

  flex: 1;

  overflow: hidden;
}

.ThInput-Send {
  .error & {
    div {
      opacity: 0;
    }

    transform: scale(1);

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
    border-radius: 16px;
    background: var(--el-color-danger);
    box-shadow: none;
    box-shadow: 0 0 8px 2px var(--el-color-danger);
  }

  &::before {
    z-index: -1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0;
    border-radius: 16px;
    animation: animate 1.5s linear infinite;
    transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    background: linear-gradient(135deg, #14ffe9, #ffeb3b, #ff00e0);
  }

  &::after {
    z-index: -2;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0;
    border-radius: 16px;
    transform: scale(1.025);
    animation: animate 1.5s linear infinite;
    transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    background: linear-gradient(135deg, #14ffe9, #ffeb3b, #ff00e0);
  }

  .showSend & {
    transform: scale(1);
  }

  .generating & {
    &::before {
      opacity: 0.75;
    }

    &::after {
      opacity: 0.5;
    }

    div {
      opacity: 0;
    }

    transform: scale(1);

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
    border-radius: 16px;
    background: transparent;
  }

  &:hover {
    background-color: var(--el-color-primary);
    box-shadow: 0 0 2px 4px var(--el-color-primary-light-5);
  }

  &:active {
    transform: scale(0.95);
  }

  position: absolute;
  display: flex;

  color: #fff;
  font-size: 1.25rem;
  align-items: center;
  justify-content: center;

  bottom: 8px;
  right: 0.75rem;

  width: 36px;
  height: 36px;

  cursor: pointer;
  transition:
    transform 0.5s,
    border-radius 0.25s,
    left 0.25s,
    width 0.25s;
  transform: scale(0);
  border-radius: 16px;
  background-color: var(--el-color-primary-light-3);
  box-shadow: 0 0 2px 4px var(--el-color-primary-light-7);
}

@keyframes animate {
  0% {
    filter: blur(10px) hue-rotate(0deg);
  }

  50% {
    filter: blur(20px) hue-rotate(180deg);
  }

  100% {
    filter: blur(10px) hue-rotate(360deg);
  }
}
</style>
