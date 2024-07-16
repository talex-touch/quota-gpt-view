<script setup lang="ts">
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import History from '~/components/history/index.vue'
import type { ThHistory } from '~/components/history/history'
import { chatManager } from '~/composables/chat'

const chatRef = ref()
const pageOptions = reactive<any>({
  expand: true,
  select: -1,
})

const roundLimit = computed(() => chatManager.messages.value.messages.length / 2 >= 10)

watch(
  () => pageOptions.select,
  (ind) => {
    if (ind < 0 || ind >= chatManager.history.value.length)
      return

    const conversation = chatManager.history.value[ind]
    if (!conversation.model)
      conversation.model = 'gpt-3.5-turbo'

    chatManager.messages.value = conversation
    // chatManager.messages.value
    //   = ind === -1 ? JSON.parse(JSON.stringify(chatManager.originObj)) :

    setTimeout(() => {
      chatRef.value?.handleBackToBottom(false)
    }, 200)
  },
  { deep: true },
)

function handleCreate() {
  pageOptions.select = -1

  nextTick(() => {
    chatManager.createMessage()

    pageOptions.select = chatManager.history.value.length - 1
  })
}

async function handleSend(query: string, callback: Function) {
  const format = genFormatNowDate()

  let genTitle: any = (_index: number) => void 0

  if (chatManager.messages.value.messages.length < 2) {
    if (pageOptions.select === -1) {
      const _history: ThHistory = {
        sync: false,
        ...chatManager.messages.value,
      }
      chatManager.history.value.push(_history)

      pageOptions.select = chatManager.history.value.length - 1
    }

    genTitle = (index: number) => (chatManager.genConversationTitle(chatManager.history.value[index]))
  }

  const conversation = chatManager.history.value[pageOptions.select]

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
  conversation.lastUpdate = Date.now()

  chatManager.sendMessage(obj, conversation, {
    onTriggerUpdate: () => {
      chatRef.value?.handleBackToBottom(false)
    },
    onTriggerStatus(status) {
      callback(status)
    },
  })

  genTitle(pageOptions.select)
}

provide('updateConversationTopic', (index: number, topic: string) => {
  chatManager.history.value[index].topic = topic
})
</script>

<template>
  <div :class="{ expand: pageOptions.expand }" class="PageContainer">
    <History
      v-model:selectIndex="pageOptions.select"
      v-model:expand="pageOptions.expand"
      class="PageContainer-History"
      :history="chatManager.history.value"
      @create="handleCreate"
      @delete="chatManager.deleteMessage"
    />

    <div class="PageContainer-Main">
      <ThChat
        ref="chatRef"
        v-model:messages="chatManager.messages.value"
        :status="chatManager.status.value"
        :round-limit="roundLimit"
        @cancel="chatManager.cancelCurrentReq"
      />
      <ThInput
        v-model:status="chatManager.status.value"
        :shrink="chatManager.messages.value.messages.length > 1"
        :round-limit="roundLimit"
        @send="handleSend"
      />

      <div class="copyright">
        ThisAI. 可能会犯错，生成的内容仅供参考。v24.07.16
        <span class="business">四川科塔锐行智能科技有限公司</span>
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
  position: absolute;

  left: 50%;

  bottom: 0;

  opacity: 0.5;
  font-size: 14px;
  transform: translateX(-50%);
}
</style>
