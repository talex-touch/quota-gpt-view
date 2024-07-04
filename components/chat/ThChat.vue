<script setup lang="ts">
import ChatItem from './ChatItem.vue'
import EmptyGuide from './EmptyGuide.vue'
import { Status } from '~/composables/chat'

const props = defineProps<{
  messages: any
  status: Status
}>()

watch(
  () => props.messages.messages.length,
  () => {
    setTimeout(() => {
      handleBackToBottom()
    }, 10)
  },
)
const scrollbar = ref()

const options = reactive({
  backToBottom: false,
  stopGenerating: false,
})

watch(
  () => props.status,
  (status) => {
    options.stopGenerating = status === Status.GENERATING
  },
)

onMounted(() => {
  handleBackToBottom(false)

  setTimeout(() => {
    handleScroll()
  }, 200)
})

function handleScroll() {
  const scrollbarEl = scrollbar.value.wrapRef
  const { scrollTop, scrollHeight, clientHeight } = scrollbarEl
  // const rect = scrollbarEl.getBoundingClientRect()
  // console.log(clientHeight, scrollTop, '|', scrollHeight, 'a', rect, scrollbarEl.parentElement.parentElement.clientHeight)
  if (Math.abs(clientHeight - scrollHeight) < 10) {
    options.backToBottom = false
    return
  }

  const diff = scrollHeight - scrollTop - document.body.clientHeight
  options.backToBottom = diff >= scrollHeight * 0.1
}

function handleBackToBottom(animation: boolean = true) {
  const el: HTMLElement = scrollbar.value.wrapRef

  el.scrollTo({
    top: el.scrollHeight,
    behavior: animation ? 'smooth' : 'instant',
  })
}
</script>

<template>
  <div class="ThChat">
    <div :class="{ show: messages.messages?.length }" class="ThChat-Title">
      <p>
        {{ messages.topic }}
      </p>
      <span class="model">{{ messages.mask.modelConfig.model }}</span>
    </div>
    <div
      class="ThChat-Container"
      :class="{ stop: options.stopGenerating, backToBottom: options.backToBottom }"
    >
      <el-scrollbar ref="scrollbar" @scroll="handleScroll">
        <div class="ThChat-Container-Wrapper">
          <ChatItem
            v-for="(message, ind) in messages.messages"
            :key="message.id"
            :ind="ind"
            :total="messages.messages.length"
            :item="message"
          />
        </div>

        <EmptyGuide :show="messages.messages?.length" />

        <br>
        <br>
        <br>
        <br>
      </el-scrollbar>

      <div class="ThChat-BackToBottom" @click="handleBackToBottom()">
        <div i-carbon-down-to-bottom />
      </div>
      <div class="ThChat-StopGenerating" @click="handleBackToBottom()">
        停止生成
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.ThChat-Title {
  &.show {
    transform: scale(1) translateY(0);
  }
  transform: scale(0.8) translateY(-100%);

  transition: 0.25s;
}

.ThChat-Container {
  &.stop {
    .ThChat-StopGenerating {
      transform: translate(-50%, -50%) translateX(0) scale(1);
    }
  }

  &.backToBottom .ThChat-BackToBottom {
    transform: translate(-50%, -50%) translateX(0) scale(1);
  }

  &.backToBottom.stop .ThChat-BackToBottom {
    transform: translate(-50%, -50%) translateX(-35px) scale(1);
  }

  &.backToBottom.stop .ThChat-StopGenerating {
    transform: translate(-50%, -50%) translateX(35px) scale(1);
  }
}

.ThChat-StopGenerating {
  &::before {
    z-index: -1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.25;
    border-radius: 18px;
    background-color: var(--el-text-color-placeholder);
  }
  &:hover {
    color: var(--el-color-danger);
  }
  z-index: 1;
  position: absolute;
  padding: 0.25rem 0.5rem;

  left: 50%;
  bottom: 10%;

  cursor: pointer;
  transition: 0.25s;
  border-radius: 18px;
  transform: translate(-50%, -50%) translateX(100px) scale(0);
  backdrop-filter: blur(18px) saturate(180%);
}

.ThChat-BackToBottom {
  &::before {
    z-index: -1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.25;
    border-radius: 18px;
    background-color: var(--el-text-color-placeholder);
  }
  z-index: 1;
  position: absolute;
  display: flex;
  padding: 0.25rem 0.5rem;

  left: 50%;
  bottom: 10%;

  height: 32px;

  align-items: center;

  cursor: pointer;
  transition: 0.25s;
  border-radius: 18px;
  transform: translate(-50%, -50%) translateX(-100px) scale(0);
  backdrop-filter: blur(18px) saturate(180%);
}

.ThChat-Container {
  &-Wrapper {
    position: relative;
    padding: 1rem 1.25rem;
    padding-top: 40px;

    display: flex;
    flex-direction: column;

    gap: 0.25rem;
    box-sizing: border-box;
  }
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}

.ThChat {
  &-Title {
    &::before {
      z-index: -1;
      content: '';
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      opacity: 0.25;
      background-color: var(--el-text-color-placeholder);
    }
    & .model {
      position: absolute;

      right: 1rem;

      opacity: 0.75;
      font-size: 14px;
    }
    z-index: 2;
    position: absolute;
    display: flex;

    color: var(--el-text-color);
    align-items: center;
    justify-content: center;

    top: 0;
    left: 0;

    width: 100%;
    height: 30px;

    backdrop-filter: blur(18px) saturate(180%);
  }
  position: absolute;
  padding: 1rem 1.25rem;

  top: 0%;
  left: 0%;

  width: 100%;
  height: 100%;
  overflow: hidden;

  border-radius: 0 0 16px 16px;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
}
</style>
