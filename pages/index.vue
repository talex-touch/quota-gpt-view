<script setup lang="ts">
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import History from '~/components/history/index.vue'
import { chatManager } from '~/composables/chat'
import ShareSection from '~/components/chat/ShareSection.vue'
import type { InputPlusProperty } from '~/components/input/input'
import { getTargetPrompt } from '~/composables/api/chat'
import { $completion } from '~/composables/api/base/v1/aigc/completion'
import { type IChatConversation, type IChatInnerItem, type IChatItem, IChatItemStatus, PersistStatus, QuotaModel } from '~/composables/api/base/v1/aigc/completion-types'
import { $historyManager } from '~/composables/api/base/v1/aigc/history'



definePageMeta({
  layout: 'default',
  pageTransition: {
    name: 'slide',
  },
})

const chatRef = ref()
const initConversation = $completion.emptyHistory()
const pageOptions = reactive<{
  settingDialog: boolean
  expand: boolean
  select: string
  template: any
  conversation: IChatConversation
  inputProperty: InputPlusProperty
  share: any
  status: IChatItemStatus
}>({
  settingDialog: false,
  expand: true,
  select: '',
  template: null,
  conversation: initConversation,
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

function handleDelete(id: string) {
  // chatManager.deleteMessage(id)

  // pageOptions.select = chatManager.history.value.length - 1

  // handleCreate()
}

watch(
  () => pageOptions.select,
  (select) => {
    pageOptions.template = null
    if (!select) {
      // chatManager.messages.value = JSON.parse(JSON.stringify(chatManager.originObj))
      return
    }

    const historyList = $historyManager.options.list

    const conversation = historyList.get(select)
    if (!conversation) {
      pageOptions.select = ''
      return
    }

    setTimeout(async () => {
      // get template
      // pageOptions.template
      if (conversation.templateId !== undefined && conversation.templateId !== -1) {
        const res: any = await getTargetPrompt(conversation.templateId)

        pageOptions.template = res.data
      }

      pageOptions.conversation = conversation

      pageOptions.share.enable = false
      chatRef.value?.handleBackToBottom(false)
    }, 200)
  },
  { deep: true },
)

function handleCreate() {
  const conversation = $completion.emptyHistory()

  $historyManager.options.list.set(conversation.id, conversation)

  Object.assign(pageOptions, {
    conversation,
    select: conversation.id,
    share: {
      enable: false,
    },
  })

  return true
}

async function innerSend(conversation: IChatConversation, chatItem: IChatItem, index: number) {
  conversation.sync = PersistStatus.MODIFIED

  const chatCompletion = $completion.createCompletion(conversation, chatItem, index)

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

      $historyManager.syncHistory(conversation)
    },
    onFrequentLimit() {
      chatManager.cancelCurrentReq()
    },
  })

    chatCompletion.send()
  }

  // 重新生成某条消息 只需要给消息索引即可 还需要传入目标inner 如果有新的参数赋值则传options替换
  async function handleRetry(index: number, innerItem: IChatInnerItem) {
    const conversation = pageOptions.conversation

  const chatItem = conversation.messages[index]
  const _innerItem = $completion.emptyChatInnerItem({
    model: innerItem.model,
    value: '',
    meta: innerItem.meta,
    timestamp: Date.now(),
    status: IChatItemStatus.AVAILABLE,
  })

    chatItem.content.push(_innerItem)

    // console.log('a', conversation.messages)

    innerSend(conversation, chatItem, index)
  }

  async function handleSend(query: string, _meta: any) {
    const conversation = pageOptions.conversation

  if (!$historyManager.options.list.get(conversation.id))
    $historyManager.options.list.set(conversation.id, conversation)

  const shiftItem = conversation.messages.at(-1)

  const chatItem = $completion.emptyChatItem()
  const innerItem = $completion.emptyChatInnerItem({
    model: QuotaModel.QUOTA_THIS_NORMAL,
    value: query,
    meta: {
      temperature: 0,
    },
    timestamp: Date.now(),
    status: IChatItemStatus.AVAILABLE,
  })

    chatItem.content.push(innerItem)
    conversation.messages.push(chatItem)

    innerSend(conversation, chatItem, shiftItem?.content.length ?? 0)
  }

provide('pageOptions', pageOptions)

  function handleShare() {
    pageOptions.share.selected.length = 0
    pageOptions.share.enable = !pageOptions.share.enable
  }
</script>

<template>
  <div :class="{ expand: pageOptions.expand, empty: !pageOptions.conversation.messages.length }" class="PageContainer">
    <History
      v-model:select="pageOptions.select" v-model:expand="pageOptions.expand" class="PageContainer-History"
      @create="handleCreate" @delete="handleDelete"
    />

    <div class="PageContainer-Main">
      <ThChat ref="chatRef" v-model:messages="pageOptions.conversation" :status="pageOptions.status"
        @cancel="chatManager.cancelCurrentReq()" @retry="handleRetry" />

      <ThInput v-model:input-property="pageOptions.inputProperty"
        :template-enable="!pageOptions.conversation.messages.length" :status="Status.AVAILABLE" :hide="false"
        @send="handleSend" />

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

          <span v-if="!!pageOptions.conversation.messages.length"
            :class="pageOptions.share.enable ? 'warning shining' : ''" cursor-pointer class="tag" @click="handleShare">
            <i i-carbon:share />分享对话
          </span>

          <span class="tag">
            <i i-carbon:time />0 mins
          </span>
        </template>
        <template #end>
          <ChatHeadTrSyncStatus :status="pageOptions.conversation.sync" />
        </template>
      </AigcChatStatusBar>

      <ShareSection v-if="pageOptions.conversation" :length="pageOptions.conversation.messages.length"
        :show="pageOptions.share.enable" :selected="pageOptions.share.selected" />

      <div class="copyright">
        ThisAI. 可能会犯错，生成的内容仅供参考。v24.08.27
        <span class="business">四川科塔锐行科技有限公司</span>
      </div>


      <!-- 根据 发送消息超过10次 控制弹窗的显示 -->
      <!-- <FeedBack v-if="showFeedbackForm" @close="showFeedbackForm = false" /> -->

      <ChorePersonalDialog v-if="userStore.isLogin" v-model="pageOptions.settingDialog" />
    </div>
  </div>
</template>

<style lang="scss">
.PageContainer {
  &::before {
    z-index: -2;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.5;
    filter: blur(58px) saturate(180%);
    transition: 0.35s;
    transform: scale(1.05);
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
    transition: 0.35s;
    // filter: blur(18px);
    background-color: var(--el-bg-color);
  }
  &.empty {
    &::before {
      opacity: 0.75;

      filter: blur(0px) saturate(100%);
    }
    &::after {
      opacity: 0;
    }
  }

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

      opacity: 0.75;
      // filter: blur(18px);
      background-color: var(--el-bg-color-page);
    }

    flex-shrink: 0;
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
