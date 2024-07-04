<script name="ThInput" setup lang="ts">
import { Status } from '~/composables/chat'

const props = defineProps<{
  status: Status
  shrink: boolean
}>()
const emits = defineEmits<{
  (name: 'send', data: any, callback: (status: Status, data: any) => void): void
  (name: 'changeStatus', data: Status): void
  (name: 'clear'): void
}>()

const status = useVModel(props, 'status', emits)

const input = ref('')
const showSend = computed(() => input.value.trim().length)

function clear() {
  emits('clear')
}

function handleSend() {
  if (!showSend.value)
    return
  if (status.value !== Status.AVAILABLE)
    return

  status.value = Status.GENERATING

  emits('send', input.value, (_status: Status) => {
    status.value = _status

    const el = document.getElementById('main-input')

    setTimeout(() => {
      el?.focus()
    })
  })

  input.value = ''
}
</script>

<template>
  <div
    :class="{
      shrink,
      showSend,
      generating: status === Status.GENERATING,
      error: status === Status.ERROR,
    }"
    class="ThInput"
    @keydown.enter="handleSend"
  >
    <div class="ThInput-Input">
      <input id="main-input" v-model="input" placeholder="问任何问题都可以...">
    </div>

    <div class="ThInput-Send" @click="handleSend">
      <div i-carbon:send-alt />
      <span v-if="status === Status.GENERATING">生成中</span>
      <span v-else-if="status === Status.ERROR">出现错误，请刷新页面。</span>
    </div>
  </div>

  <div
    :class="{ expand: shrink, generating: status === Status.GENERATING }"
    class="ThInput-Clear"
    @click="clear"
  >
    <div i-carbon-misuse-outline />
  </div>
</template>

<style lang="scss" scoped>
.ThInput-Clear {
  &:hover {
    &::before {
      opacity: 1;
    }
  }

  &::before {
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.75;
    border-radius: 16px;
    background-color: var(--el-color-danger);
  }
  &.expand {
    transform: translateX(50%) translateX(5rem) scale(1);
  }
  &.expand.generating {
    left: 55%;

    transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }
  position: absolute;
  padding: 0.25rem;
  display: flex;

  color: #fff;
  font-size: 1.5rem;
  align-items: center;
  justify-content: center;

  bottom: 2.5%;

  left: 87%;
  width: 50px;
  height: 50px;

  cursor: pointer;
  box-sizing: border-box;
  border-radius: 16px;
  box-shadow: var(--el-box-shadow);
  transform: translateX(50%) translateX(5rem) scale(0);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.ThInput {
  span {
    position: absolute;

    top: 50%;
    left: 50%;

    width: max-content;

    transform: translate(-50%, -50%);
  }

  &.error &-Send {
    div {
      opacity: 0;
    }
    transform: scale(1);

    left: 0;
    width: 100%;
    pointer-events: none;
    border-radius: 16px;
    background: var(--el-color-danger);
    box-shadow: 0 0 2px 4px var(--el-color-primary-light-5);
  }

  &-Send {
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
        opacity: 1;
      }
      &::after {
        opacity: 0.75;
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

    top: 7px;
    right: 7px;

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
  &-Input {
    .generating & {
      opacity: 0;

      pointer-events: none;
    }

    input {
      &:focus-visible {
        outline: none;
        border: none;
      }
      position: absolute;
      padding: 0 0.5rem;

      top: 0;

      width: 100%;
      height: 100%;

      box-sizing: border-box;
      background-color: transparent;
    }
  }

  // &.showSend {
  //   border-radius: 12px 24px 24px 12px;
  // }
  &.shrink {
    width: calc(85% - 2em);

    transform: translateX(-50%) translateX(-2rem);
  }
  &.generating {
    width: 20%;

    transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  position: absolute;
  padding: 0.25rem;
  display: flex;

  bottom: 2.5%;

  left: 50%;
  width: 85%;
  height: 50px;

  box-sizing: border-box;
  border-radius: 16px;
  transform: translateX(-50%);
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
  transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);
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
