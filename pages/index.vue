<script setup lang="ts">
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import History from '~/components/history/index.vue'
import type { ThHistory } from '~/components/history/history'
import { chatManager } from '~/composables/chat'
import ShareSection from '~/components/chat/ShareSection.vue'

const chatRef = ref()
const pageOptions = reactive<any>({
  expand: true,
  select: -1,
  share: {
    enable: false,
    selected: new Array<number>(),
    getMessages() {
      return [chatManager.messages.value.messages.filter((_, index) => pageOptions.share.selected.includes(index)), chatManager.messages.value.topic]
    },
  },
})

const roundLimit = computed(() => chatManager.messages.value.messages.length / 2 >= 10)

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
    if (!conversation.model)
      conversation.model = 'gpt-3.5-turbo'

    chatManager.messages.value = conversation
    if (!chatManager.messages.value.status)
      chatManager.messages.value.status = Status.AVAILABLE

    setTimeout(() => {
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

async function handleSend(query: string, callback: Function) {
  if (!userStore.value.token) {
    callback(Status.AVAILABLE)

    ElMessage.error({
      message: '内测模式下必须登录后使用！',
      grouping: true,
    })

    return
  }

  const format = genFormatNowDate()

  let genTitle: any = async (_index: number) => void 0

  if (chatManager.messages.value.messages.length < 2) {
    if (pageOptions.select === -1) {
      const res = handleCreate()

      if (!res) {
        callback(Status.AVAILABLE)
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

  await chatManager.sendMessage(obj, conversation, {
    onTriggerUpdate: () => {
      chatRef.value?.handleBackToBottom(false)
    },
    onTriggerStatus(status) {
      callback(status)
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
      v-model:selectIndex="pageOptions.select"
      v-model:expand="pageOptions.expand"
      class="PageContainer-History"
      :history="chatManager.history.value"
      @create="handleCreate"
      @delete="handleDelete"
    />

    <div class="PageContainer-Main">
      <ThChat
        ref="chatRef"
        v-model:messages="chatManager.messages.value"
        :status="chatManager.messages.value.status"
        :round-limit="roundLimit"
        @cancel="chatManager.cancelCurrentReq()"
      />
      <ThInput
        v-model:status="chatManager.messages.value.status"
        :shrink="chatManager.messages.value.messages.length > 1"
        :hide="pageOptions.share.enable || roundLimit"
        @send="handleSend"
      />

      <ShareSection :length="chatManager.messages.value.messages.length" :show="pageOptions.share.enable" :selected="pageOptions.share.selected" />

      <div class="copyright">
        ThisAI. 可能会犯错，生成的内容仅供参考。v24.07.23
        <span class="business">四川科塔锐行科技有限公司</span>
      </div>
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
  background: var(--el-bg-color-page);
}
</style>
