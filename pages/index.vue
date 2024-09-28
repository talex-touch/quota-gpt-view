<script setup lang="ts">
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import History from '~/components/history/index.vue'
import ShareSection from '~/components/chat/ShareSection.vue'
import ModelSelector from '~/components/model/ModelSelector.vue'
import type { InputPlusProperty } from '~/components/input/input'
import { getTargetPrompt } from '~/composables/api/chat'
import { $completion } from '~/composables/api/base/v1/aigc/completion'
import { type IChatConversation, type IChatInnerItem, type IChatItem, IChatItemStatus, PersistStatus, QuotaModel } from '~/composables/api/base/v1/aigc/completion-types'
import { $historyManager } from '~/composables/api/base/v1/aigc/history'
import { $endApi } from '~/composables/api/base'

definePageMeta({
  layout: 'default',
  pageTransition: {
    name: 'slide',
  },
})

const chatRef = ref()
const initConversation = $completion.emptyHistory()
const pageOptions = reactive<{
  select: string
  template: any
  conversation: IChatConversation
  inputProperty: InputPlusProperty
  share: any
  status: IChatItemStatus
  feedback: any
  model: QuotaModel
}>({
  model: QuotaModel.QUOTA_THIS_NORMAL,
  feedback: {
    visible: false,
  },
  select: '',
  template: null,
  conversation: initConversation,
  inputProperty: {
    internet: true,
    temperature: 50,
  },
  share: {
    meta: [],
    enable: false,
    selected: new Array<number>(),
    getMessages() {
      return [pageOptions.conversation.messages.filter((_, index) => pageOptions.share.selected.includes(index)), pageOptions.conversation.topic]
    },
  },
  status: IChatItemStatus.AVAILABLE,
})

$event.on('USER_LOGOUT_SUCCESS', () => { pageOptions.conversation = $completion.emptyHistory() })

async function handleDelete(id: string) {
  const res: any = await $endApi.v1.aigc.deleteConversation(id)
  if (res.code !== 200) {
    return ElMessage({
      message: `删除失败(${res.message})！`,
      grouping: true,
      type: 'error',
      plain: true,
    })
  }

  if (id === pageOptions.select)
    handleCreate()

  $historyManager.options.list.delete(id)
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
  })

  pageOptions.share.enable = false

  return true
}

async function innerSend(conversation: IChatConversation, chatItem: IChatItem, index: number) {
  // 判断如果 conversation 是2条消息
  if (userConfig.value.pri_info.appearance.immersive && conversation.messages.length <= 2)
    userConfig.value.pri_info.appearance.expand = false

  conversation.sync = PersistStatus.MODIFIED

  const chatCompletion = $completion.createCompletion(conversation, chatItem, index)

  console.log('chatCompletion.innerMsg', chatCompletion.innerMsg)

  chatCompletion.registerHandler({
    onCompletion: () => {
      chatRef.value?.generateScroll()

      return true
    },
    onTriggerStatus(status) {
      pageOptions.status = status
    },
    async onReqCompleted() {
      // 判断如果是第一条消息那么就要生成title
      if (conversation.messages.length === 2) {
        const shiftItem = [...conversation.messages].shift()
        if (shiftItem?.content.length === 1)
          await chatCompletion.getTitle()
      }
      // await genTitle(pageOptions.select)

      $historyManager.syncHistory(conversation)

      setTimeout(() => chatRef.value?.generateScroll(), 500)
    },
    onFrequentLimit() {
      // chatManager.cancelCurrentReq()
    },
  })

  return chatCompletion
}

function handleSync() {
  $historyManager.syncHistory(pageOptions.conversation)
}

// 重新生成某条消息 只需要给消息索引即可 还需要传入目标inner 如果有新的参数赋值则传options替换
async function handleRetry(index: number, page: number, innerItem: IChatInnerItem) {
  const conversation = pageOptions.conversation

  const chatItem = conversation.messages[index]
  const _innerItem = $completion.emptyChatInnerItem({
    model: innerItem.model,
    value: [],
    meta: innerItem.meta,
    timestamp: Date.now(),
    status: IChatItemStatus.AVAILABLE,
  })

  chatItem.content.push(_innerItem)

  const completion = await innerSend(conversation, chatItem, page)

  completion.send()
}

async function handleSend(query: string, _meta: any) {
  const conversation = pageOptions.conversation

  if (!$historyManager.options.list.get(conversation.id))
    $historyManager.options.list.set(conversation.id, conversation)

  const meta = chatRef.value.getDictMeta()
  console.log('a', meta)
  let i = conversation.messages.length - 1
  // let shiftItem /* = conversation.messages.at(-1) */
  while (meta?.[i] && !meta[i].show)
    i -= 1

  // getDictMeta
  const shiftItem = i >= 0 ? conversation.messages.at(i) : null

  function getModel() {
    if (!shiftItem)
      return QuotaModel.QUOTA_THIS_NORMAL_TURBO

    const inner = shiftItem.content[shiftItem.page]

    return inner?.model || QuotaModel.QUOTA_THIS_NORMAL_TURBO
  }

  const chatItem = $completion.emptyChatItem()
  const innerItem = $completion.emptyChatInnerItem({
    model: getModel(),
    value: [$completion.initInnerMeta('text', query)],
    meta: {
      temperature: 0,
    },
    timestamp: Date.now(),
    status: IChatItemStatus.AVAILABLE,
  })

  chatItem.content.push(innerItem)
  conversation.messages.push(chatItem)

  console.log('a', shiftItem, shiftItem?.page)

  const completion = await innerSend(conversation, chatItem, (shiftItem?.content.length ?? 1) - 1)

  completion.innerMsg.model = pageOptions.model

  completion.send()
}

provide('pageOptions', pageOptions)

function handleShare() {
  pageOptions.share.meta = chatRef.value.getDictMeta()

  pageOptions.share.selected.length = 0
  pageOptions.share.enable = !pageOptions.share.enable
}

function handleCancelReq() {

}

console.log('PO', pageOptions)

const mount = ref(false)
function mounter() {
  setTimeout(() => {
    mount.value = true
  }, 200)
}
onActivated(mounter)
onMounted(mounter)
</script>

<template>
  <div :class="{ expand: userConfig.pri_info.appearance.expand, empty: !pageOptions.conversation.messages.length }" class="PageContainer">
    <History
      v-model:select="pageOptions.select" class="PageContainer-History" @create="handleCreate"
      @delete="handleDelete"
    />

    <div class="PageContainer-Main">
      <ThChat
        ref="chatRef" v-model:messages="pageOptions.conversation" :status="pageOptions.status"
        @cancel="handleCancelReq" @retry="handleRetry"
      >
        <template #model>
          <ModelSelector v-if="mount" v-model="pageOptions.model" />
        </template>
      </ThChat>

      <ThInput
        v-model:input-property="pageOptions.inputProperty"
        :template-enable="!pageOptions.conversation.messages.length" :status="pageOptions.status"
        :hide="pageOptions.share.enable" @send="handleSend" @template="pageOptions.template = $event"
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

          <span
            v-if="!!pageOptions.conversation.messages.length"
            :class="pageOptions.share.enable ? 'warning shining' : ''" cursor-pointer class="tag" @click="handleShare"
          >
            <i i-carbon:share />分享对话
          </span>

          <span class="tag">
            <i i-carbon:time />0 mins
          </span>
        </template>
        <template #end>
          <ChatHeadTrSyncStatus
            v-if="!!pageOptions.conversation.messages.length"
            :status="pageOptions.conversation.sync" @upload="handleSync"
          />
        </template>
      </AigcChatStatusBar>

      <ShareSection
        v-if="pageOptions.conversation" :length="pageOptions.conversation.messages.length"
        :show="pageOptions.share.enable" :selected="pageOptions.share.selected"
      />

      <!-- 根据 发送消息超过10次 控制弹窗的显示 -->
      <FeedBack v-model:show="pageOptions.feedback.visible" />
    </div>
  </div>
</template>

<style lang="scss">
// .ModelSelector {
//   z-index: 10;
//   position: absolute;

//   top: 0.5rem;
//   right: 0.5rem;
// }

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
    // z-index: 2;
    position: relative;

    // flex: 1;
    width: 100%;
    max-width: 100%;
    height: 100%;

    overflow: hidden;
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
