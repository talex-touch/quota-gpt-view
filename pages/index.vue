<script setup lang="ts">
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import History from '~/components/history/index.vue'
import { chatManager } from '~/composables/chat'
import ShareSection from '~/components/chat/ShareSection.vue'
import type { InputPlusProperty } from '~/components/input/input'
import { getTargetPrompt } from '~/composables/api/chat'
import { $completion } from '~/composables/api/base/v1/aigc/completion'
import { type IChatConversation, IChatItemStatus, QuotaModel } from '~/composables/api/base/v1/aigc/index.type.d.ts'

definePageMeta({
  layout: 'default',
  pageTransition: {
    name: 'slide',
  },
})

const chatRef = ref()
const pageOptions = reactive<{
  settingDialog: boolean
  expand: boolean
  select: number
  template: any
  conversation: IChatConversation
  inputProperty: InputPlusProperty
  share: any
  status: IChatItemStatus
}>({
  settingDialog: false,
  expand: true,
  select: -1,
  template: null,
  conversation: $completion.emptyHistory(),
  inputProperty: {
    internet: true,
    temperature: 50,
  },
  share: {
    enable: false,
    selected: new Array<number>(),
    getMessages() {
      return [chatManager.messages.value?.messages.filter((_, index) => pageOptions.share.selected.includes(index)), chatManager.messages.value?.topic]
    },
  },
  status: IChatItemStatus.AVAILABLE,
})

function handleDelete(index: number) {
  chatManager.deleteMessage(index)

  pageOptions.select = chatManager.history.value.length - 1

  // handleCreate()
}

watch(
  () => pageOptions.select,
  (ind) => {
    pageOptions.template = null

    if (ind < 0 || ind >= chatManager.history.value.length) {
      // chatManager.messages.value = JSON.parse(JSON.stringify(chatManager.originObj))
      return
    }

    const conversation = chatManager.history.value[ind]

    setTimeout(async () => {
      // get template
      // pageOptions.template
      if (conversation.templateId !== undefined && conversation.templateId !== -1) {
        const res: any = await getTargetPrompt(conversation.templateId)

        pageOptions.template = res.data
      }

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
  chatManager.messages.value = JSON.parse(JSON.stringify(chatManager.originObj))

  return true
}

async function handleSend(query: string, _meta: any) {
  const conversation = pageOptions.conversation

  const chatItem = $completion.emptyChatItem()
  const innerItem = $completion.emptyChatInnerItem({
    model: QuotaModel.QUOTA_THIS_NORMAL,
    value: query,
    meta: {
      temperature: 0,
    },
    status: IChatItemStatus.AVAILABLE,
  })

  chatItem.content.push(innerItem)
  conversation.messages.push(chatItem)

  const chatCompletion = $completion.createCompletion(conversation, innerItem)

  chatCompletion.registerHandler({
    onCompletion: () => {
      chatRef.value?.generateScroll()

      return true
    },
    onTriggerStatus(status) {
      pageOptions.status = status
    },
    async onReqCompleted() {
      // await genTitle(pageOptions.select)

      // if (userStore.value.isLogin) {
      //   setTimeout(() => {
      //     chatManager.postTargetHistory(conversation)
      //   }, 500)
      // }
    },
    onFrequentLimit() {
      chatManager.cancelCurrentReq()
    },
  })

  chatCompletion.send()
}

// provide('updateConversationTopic', (index: number, topic: string) => {
//   const conversation: ThHistory = chatManager.history.value[index]

//   conversation.topic = topic
//   conversation.sync = false
// })
provide('pageOptions', pageOptions)

function handleShare() {
  pageOptions.share.selected.length = 0
  pageOptions.share.enable = !pageOptions.share.enable
}
</script>

<template>
  <div :class="{ expand: false }" class="PageContainer">
    <!-- <History
      v-model:selectIndex="pageOptions.select" v-model:expand="pageOptions.expand" class="PageContainer-History"
      @create="handleCreate" @delete="handleDelete"
    /> -->

    <div class="PageContainer-Main">
      <ThChat
        ref="chatRef"
        v-model:messages="pageOptions.conversation" :status="pageOptions.status"
        @cancel="chatManager.cancelCurrentReq()"
      />

      <ThInput
        v-model:input-property="pageOptions.inputProperty"
        :template-enable="!pageOptions.conversation.messages.length" :status="Status.AVAILABLE" :hide="false"
        @send="handleSend"
      />

      <AigcChatStatusBar>
        <template #start>
          <span v-if="!userStore.isLogin" class="tag warning shining">
            未登录无法使用
          </span>

          <span v-if="pageOptions.inputProperty.internet" class="tag success">
            联网模式
          </span>
          <span v-else class="tag warning">
            离线模式
          </span>

          <span cursor-pointer class="tag" @click="handleShare">
            <i i-carbon:share />分享对话
          </span>

          <span class="tag">
            <i i-carbon:time />2 mins
          </span>
        </template>
      </AigcChatStatusBar>
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

  // background-color: red;
}
</style>
