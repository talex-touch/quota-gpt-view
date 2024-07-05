<script setup lang="ts">
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import History from '~/components/history/index.vue'
import type { DisplayHistory, ThHistory } from '~/components/history/history'
import type { ChatCompletion } from '~/composables/chat'
import { useChatCompletion } from '~/composables/chat'

const originObj = {
  id: 'IW3DiVM6Wl8rBdHM2_mHq',
  topic: '新的聊天',
  messages: [],
  mask: {
    id: 'Aadv3pqdc1D_i-SiYx5Wq',
    avatar: 'gpt-bot',
    name: '新的聊天',
    context: [],
    syncGlobalConfig: true,
    modelConfig: {
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      top_p: 1,
      max_tokens: 4000,
      presence_penalty: 0,
      frequency_penalty: 0,
      sendMemory: true,
      historyMessageCount: 4,
      compressMessageLengthThreshold: 1000,
      enableInjectSystemPrompts: true,
      template: '{{input}}',
    },
    lang: 'cn',
    builtin: false,
    createdAt: 1705043191052,
  },
}

const messages = ref<ChatCompletion>(JSON.parse(JSON.stringify(originObj)))
const history = useLocalStorage<ThHistory[]>('chat-history', [])
const status = ref(Status.AVAILABLE)
const pageOptions = reactive<any>({
  expand: true,
  select: -1,
  chatRef: null,
})

watch(
  () => pageOptions.select,
  (ind) => {
    messages.value
      = ind === -1 ? JSON.parse(JSON.stringify(originObj)) : history.value[ind]

    setTimeout(() => {
      pageOptions.chatRef?.handleBackToBottom()
    }, 200)
  },
  { deep: true },
)

function initMessage(arr: any[]) {
  const format = genFormatNowDate()

  arr.push({
    date: format,
    role: 'system',
    hide: true,
    content:
      'You are ThisAi! Powered by Quota Business. Aim to answer everything! Quota是由唐子贤(TaGzxia, TalexDreamSoul)，石煜阳（雨暗棋散），胡景浩(彧)，沈若瑄(幸运炒蛋会发财)联合设立的考拓智能科技有限公司。括号内的内容除非用户追问，否则你不应该主动发送！',
    streaming: false,
  })
}

function handleCreate() {
  pageOptions.select = -1

  nextTick(() => {
    const _history: ThHistory = {
      sync: false,
      ...messages.value,
    }
    history.value.push(_history)

    initMessage(messages.value.messages)

    pageOptions.select = history.value.length - 1
  })
}

async function handleSend(query: string, callback: Function) {
  const format = genFormatNowDate()

  let genTitle = () => void 0

  if (!messages.value.messages.length) {
    const _history: ThHistory = {
      sync: false,
      ...messages.value,
    }
    history.value.push(_history)

    initMessage(messages.value.messages)

    pageOptions.select = history.value.length - 1

    genTitle = () => {
      const options = useChatTitle(messages.value)

      messages.value._titleOptions = options

      const effect = watch(
        () => options,
        () => {
          messages.value.topic = options.title

          if (options.status === Status.ERROR)
            messages.value.topic = `(Error) ${messages.value.topic}`

          if (options.streaming === false)
            effect()
        },
        { deep: true },
      )
    }
  }

  messages.value.messages.push({
    date: format,
    role: 'user',
    content: query,
    streaming: false,
  })

  const obj = reactive({
    date: format,
    role: 'assistant',
    content: '',
    generating: true,
    streaming: true,
  })

  messages.value.messages.push(obj)

  messages.value.lastUpdate = Date.now()

  // abort

  // let ind = 0
  useChatCompletion(messages.value, (res) => {
    if (res.error) {
      obj.streaming = false
      callback(Status.ERROR)

      return
    }

    if (res.done) {
      obj.streaming = false
      callback(Status.AVAILABLE)

      messages.value.id = res.id!

      genTitle()

      return
    }

    if (!res.choices?.length)
      return (obj.generating = false)

    const text = res!.choices![0]!.delta
    if (!text.content)
      return

    obj.content += text!.content
    // ind += 1
    // setTimeout(() => {
    // }, ind * 10)
  })
}

function handleClear() {
  messages.value.messages.length = 0
}

function handleCancel() {
  status.value = Status.AVAILABLE

  handleClear()
}

// TODO 撤销删除
function handleDelete(index: number) {
  if (index === pageOptions.select)
    pageOptions.select = -1

  history.value.splice(index, 1)
}

provide('updateConversationTopic', (index: number, topic: string) => {
  history.value[index].topic = topic
})
</script>

<template>
  <div :class="{ expand: pageOptions.expand }" class="PageContainer">
    <History
      v-model:selectIndex="pageOptions.select"
      v-model:expand="pageOptions.expand"
      class="PageContainer-History"
      :history="history"
      @create="handleCreate"
      @delete="handleDelete"
    />

    <div class="PageContainer-Main">
      <ThChat
        :ref="pageOptions.chatRef"
        :status="status"
        :messages="messages"
        @cancel="handleCancel"
      />
      <ThInput
        v-model:status="status"
        :shrink="messages.messages.length > 1"
        @clear="handleClear"
        @send="handleSend"
      />

      <div class="copyright">
        ThisAI. 可能会犯错，生成的内容仅供参考。
        <span class="business">考拓智能科技有限公司</span>
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
