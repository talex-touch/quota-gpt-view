<script setup lang="ts">
import ChatSetting from '../setting/ChatSetting.vue'
import type { ThHistory } from '../history/history'
import ChatItem from './ChatItem.vue'
import EmptyGuide from './EmptyGuide.vue'
import TrChatTitle from './head/TrChatTitle.vue'
import TrSyncStatus from './head/TrSyncStatus.vue'
import { Status } from '~/composables/chat'
import ModelSelector from '~/components/model/ModelSelector.vue'
import AccountAvatar from '~/components/personal/AccountAvatar.vue'
import IconButton from '~/components/button/IconButton.vue'

const props = defineProps<{
  messages: ThHistory
  roundLimit: boolean
}>()

const emits = defineEmits<{
  (e: 'update:messages', messages: ChatCompletion): void
  (e: 'cancel'): void
}>()

const scrollbar = ref()

const share: any = (inject('pageOptions')! as any).share
const options = reactive({
  backToBottom: false,
  stopGenerating: false,
  share,
})

watchEffect(() => {
  options.stopGenerating = props.messages?.status === Status.GENERATING
})

const messagesModel = useVModel(props, 'messages', emits)

function handleCancel() {
  emits('cancel')
}

watch(
  () => props.messages?.messages.length,
  () => {
    setTimeout(() => {
      handleBackToBottom()
    }, 10)
  },
)

function handleShare() {
  options.share.selected.length = 0
  options.share.enable = !options.share.enable
}

function handleSelectShareItem(index: number, check: boolean) {
  if (!check)
    options.share.selected = options.share.selected.filter((_index: any) => _index !== index)
  else
    options.share.selected = [...new Set([...options.share.selected, index])]
}

onMounted(() => {
  handleBackToBottom(false)

  setTimeout(() => {
    handleScroll()
  }, 200)
})

function handleScroll() {
  const scrollbarEl = scrollbar.value?.wrapRef
  if (!scrollbarEl)
    return

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

const messageBubbles = computed(() =>
  [...(props.messages?.messages ?? [])].filter(message => !message.hide),
)

defineExpose({
  handleBackToBottom,
  generateScroll: () => {
    handleScroll()

    if (!options.backToBottom)
      handleBackToBottom()
  },
})

const [chatSettingShow, toggleChatSettingShow] = useToggle()
</script>

<template>
  <div class="ThChat">
    <ChatSetting v-if="messagesModel" v-model:data="messagesModel" v-model:show="chatSettingShow" />

    <div v-if="messages" :class="{ show: messages.messages?.length > 1 }" class="ThChat-Title">
      <div v-if="userStore?.isAdmin && messageBubbles" v-wave class="ThChat-Setting" @click="toggleChatSettingShow()">
        <div i-carbon-settings />
        <span>设置</span>
      </div>

      <div class="ThChat-HeadBar" flex items-center gap-4>
        <TrSyncStatus :syncing="messages.syncing" :sync="messages.sync" />
        <TrChatTitle :title="messages.topic" />
        <IconButton :shining="options.share.enable" :stay="true" @click="handleShare">
          <div i-carbon-share />
        </IconButton>
      </div>

      <span v-if="messageBubbles" class="model">
        <ModelSelector v-model="messagesModel.model" />
      </span>
      <AccountAvatar />
    </div>

    <div class="ThChat-Container" :class="{ stop: options.stopGenerating, backToBottom: options.backToBottom }">
      <el-scrollbar ref="scrollbar" @scroll="handleScroll">
        <div v-if="messages" class="ThChat-Container-Wrapper">
          <ChatItem
            v-for="(message, ind) in messageBubbles" :key="message.id" :ind="ind"
            :total="messages.messages.length" :item="message" :share="options.share.enable"
            :select="options.share.selected" @select="handleSelectShareItem"
          />

          <div v-if="!options.share.enable && roundLimit" class="TrChat-RateLimit">
            为了避免恶意使用，你需要登录来解锁聊天限制！
          </div>
        </div>

        <EmptyGuide :show="messages.messages?.length > 1" />

        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
      </el-scrollbar>

      <div class="ThChat-BackToBottom" @click="handleBackToBottom()">
        <div i-carbon-down-to-bottom />
      </div>
      <div class="ThChat-StopGenerating" @click="handleCancel()">
        停止生成
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.TrChat-RateLimit {
  &::before {
    content: '';
    position: absolute;

    left: -10%;
    width: 120%;

    height: 50px;

    background: linear-gradient(
      to bottom,
      transparent 0%,
      var(--el-bg-color-page)
    );
  }

  z-index: 3;
  position: sticky;
  margin: 1rem 0 2rem;

  bottom: 20px;

  text-align: center;
  color: var(--el-color-danger);
}

.ThChat-Setting {
  &:hover {
    span {
      opacity: 1;

      transform: translateX(0);
    }

    width: 80px;

    background-color: var(--el-text-color-placeholder);
  }

  &:active {
    transform: translateY(-50%) scale(0.75);
  }

  div {
    position: absolute;

    top: 8px;
    left: 8px;
  }

  span {
    position: absolute;

    top: 5px;
    left: 30px;

    width: 50px;

    opacity: 0;
    transition: 0.25s;
    transform: translateX(-50%);
  }

  position: absolute;

  top: 50%;
  left: 0.5rem;

  width: 32px;
  height: 32px;

  opacity: 0.75;
  cursor: pointer;
  transition: 0.25s;
  border-radius: 12px;
  transform: translateY(-50%);
}

.ThChat-HeadBar {
  .ThChat-Title.show & {
    transform: scale(1) translateY(0);
  }

  transform: scale(0.8) translateY(-200%);

  // border-bottom: 1px solid var(--el-border-color);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
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

  z-index: 3;
  position: absolute;
  padding: 0.25rem 0.5rem;

  left: 50%;
  bottom: 10%;

  cursor: pointer;
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
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

  z-index: 3;
  position: absolute;
  display: flex;
  padding: 0.25rem 0.5rem;

  left: 50%;
  bottom: 10%;

  height: 32px;

  align-items: center;

  cursor: pointer;
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  border-radius: 18px;
  transform: translate(-50%, -50%) translateX(-100px) scale(0);
  backdrop-filter: blur(18px) saturate(180%);
}

.ThChat-Container {
  &-Wrapper {
    z-index: 2;
    position: relative;
    padding: 1rem 0;
    padding-top: 40px;

    display: flex;
    flex-direction: column;

    left: 50%;
    width: min(70%, 1080px);

    gap: 0.25rem;
    box-sizing: border-box;

    transform: translateX(-50%);
  }
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}

.ThChat {
  &-Title {
    & .model {
      position: absolute;

      right: 1rem;

      font-size: 14px;
    }

    z-index: 4;
    position: absolute;
    padding: 0.5rem 0.25rem;
    display: flex;

    color: var(--el-text-color);
    align-items: center;
    justify-content: center;

    top: 0.5rem;
    left: 0;

    width: 100%;
    height: 40px;

    // backdrop-filter: blur(18px) saturate(180%);
  }

  position: relative;
  padding: 1rem 1.25rem;

  top: 0%;
  left: 0%;

  width: 100%;
  height: 100%;
  overflow: hidden;

  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
}
</style>
