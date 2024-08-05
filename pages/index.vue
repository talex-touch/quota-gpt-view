<script setup lang="ts">
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import History from '~/components/history/index.vue'
import type { ThHistory } from '~/components/history/history'
import { chatManager } from '~/composables/chat'
import ShareSection from '~/components/chat/ShareSection.vue'
import { inputProperty } from '~/components/input/input'

const chatRef = ref()
const pageOptions = reactive<any>({
  settingDialog: false,
  expand: true,
  select: -1,
  share: {
    enable: false,
    selected: new Array<number>(),
    getMessages() {
      return [chatManager.messages.value?.messages.filter((_, index) => pageOptions.share.selected.includes(index)), chatManager.messages.value?.topic]
    },
  },
})

const roundLimit = computed(() => (!userStore.value?.token && ((chatManager.messages.value?.messages?.length) ?? 1) >= 10))

function handleDelete(index: number) {
  chatManager.deleteMessage(index)

  pageOptions.select = chatManager.history.value.length - 1
}

watch(
  () => pageOptions.select,
  (ind) => {
    if (ind < 0 || ind >= chatManager.history.value.length)
      return

    const conversation = chatManager.history.value[ind]

    setTimeout(() => {
      chatManager.messages.value = conversation
      if (!chatManager.messages.value!.status)
        chatManager.messages.value!.status = Status.AVAILABLE

      pageOptions.share.enable = false
      chatRef.value?.handleBackToBottom(false)
    }, 200)
  },
  { deep: true },
)

function handleCreate() {
  const res = chatManager.createMessage()
  if (!res)
    return false

  pageOptions.select = chatManager.history.value.length - 1

  return true
}

async function handleSend(query: string) {
  const format = genFormatNowDate()

  let genTitle: any = async (_index: number) => void 0

  if (chatManager.messages.value?.messages && chatManager.messages.value.messages.length < 2) {
    if (pageOptions.select === -1) {
      const res = handleCreate()

      if (!res) {
        chatManager.setStatus(Status.AVAILABLE)
        return
      }
    }

    genTitle = async (index: number) =>
      await chatManager.genConversationTitle(chatManager.history.value[index])
  }

  const conversation: ThHistory = chatManager.history.value[pageOptions.select]

  conversation.messages.push({
    date: format,
    role: 'user',
    content: query,
    streaming: false,
  })

  const obj = reactive<any>({
    date: format,
    role: 'assistant',
    content: '',
    generating: true,
    streaming: false,
  })

  conversation.messages.push(obj)
  conversation.sync = false
  conversation.lastUpdate = Date.now()

  chatManager.setStatus(Status.GENERATING)

  chatManager.messages.value = conversation

  await chatManager.sendMessage(obj, conversation, {
    model: chatManager.messages.value.model,
    tools: inputProperty.internet,
  }, {
    onTriggerUpdate: () => {
      chatRef.value?.generateScroll()
    },
    onTriggerStatus(status) {
      chatManager.setStatus(status)
    },
    async onReqCompleted() {
      await genTitle(pageOptions.select)

      setTimeout(() => {
        chatManager.postTargetHistory(conversation)
      }, 500)
    },
    onFrequentLimit() {
      chatManager.cancelCurrentReq()
    },
  })
}

provide('updateConversationTopic', (index: number, topic: string) => {
  const conversation: ThHistory = chatManager.history.value[index]

  conversation.topic = topic
  conversation.sync = false
})
provide('pageOptions', pageOptions)
</script>

<template>
  <div :class="{ expand: pageOptions.expand }" class="PageContainer">
    <History
      v-model:selectIndex="pageOptions.select" v-model:expand="pageOptions.expand" class="PageContainer-History"
      :history="chatManager.history.value" @create="handleCreate" @delete="handleDelete"
    />

    <div class="PageContainer-Main">
      <ThChat
        ref="chatRef" v-model:messages="chatManager.messages.value" :round-limit="roundLimit"
        @cancel="chatManager.cancelCurrentReq()"
      />
      <ThInput
        :status="chatManager.messages.value?.status ?? Status.AVAILABLE"
        :hide="pageOptions.share.enable || roundLimit" @send="handleSend"
      />

      <ShareSection
        v-if="chatManager.messages.value" :length="chatManager.messages.value.messages.length"
        :show="pageOptions.share.enable" :selected="pageOptions.share.selected"
      />

      <div class="copyright">
        ThisAI. 可能会犯错，生成的内容仅供参考。v24.08.05
        <span class="business">四川科塔锐行科技有限公司</span>
      </div>

      <ChorePersonalDialog v-if="userStore.token" v-model="pageOptions.settingDialog" />
    </div>
  </div>
</template>

<style lang="scss">
.PageContainer {
  &-Main {
    z-index: 2;
    position: relative;

    flex: 1;
    width: 100%;
    height: 100%;
  }

  &-History {
    &::before {
      z-index: -2;
      content: '';
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      opacity: 0.5;
      filter: blur(18px);
      background-size: cover;
      background-image: var(--wallpaper);
    }

    &::after {
      z-index: -1;
      content: '';
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      opacity: 0.5;
      filter: blur(18px);
      background-color: var(--el-bg-color);
    }
    z-index: 3;
  }

  position: absolute;
  display: flex;

  width: 100%;
  height: 100%;

  top: 0;
  left: 0;

  overflow: hidden;
}

.copyright {
  z-index: 3;
  position: absolute;

  left: 50%;

  bottom: 0;
  width: 100%;

  color: var(--el-text-color-secondary);
  font-size: 14px;
  text-align: center;
  transform: translateX(-50%);

  mix-blend-mode: difference;
  // background: var(--el-bg-color-page);
}
</style>
