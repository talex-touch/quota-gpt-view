<script setup lang="ts">
import JSON5 from 'json5'
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import History from '~/components/history/index.vue'
import type { ThHistory } from '~/components/history/history'
import type { ChatCompletion } from '~/composables/chat'
import { useChatExecutor } from '~/composables/chat'

const originObj = {
  id: 'IW3DiVM6Wl8rBdHM2_mHq',
  topic: '新的聊天',
  messages: [],
  lastUpdate: Date.now(),
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

const chatRef = ref()
const messages = ref<ChatCompletion>(JSON.parse(JSON.stringify(originObj)))
const history = useLocalStorage<ThHistory[]>('chat-history', [])
const status = ref(Status.AVAILABLE)
const pageOptions = reactive<any>({
  expand: true,
  select: -1,
})

watch(
  () => pageOptions.select,
  (ind) => {
    messages.value
      = ind === -1 ? JSON.parse(JSON.stringify(originObj)) : history.value[ind]

    setTimeout(() => {
      chatRef.value?.handleBackToBottom(false)
    }, 200)
  },
  { deep: true },
)

function handleCreate() {
  pageOptions.select = -1

  nextTick(() => {
    const _history: ThHistory = {
      sync: false,
      ...messages.value,
    }
    _history.lastUpdate = Date.now()
    history.value.push(_history)

    pageOptions.select = history.value.length - 1
  })
}

async function handleSend(query: string, callback: Function) {
  const format = genFormatNowDate()

  let genTitle = (_index: number) => void 0

  if (messages.value.messages.length < 2) {
    if (pageOptions.select === -1) {
      const _history: ThHistory = {
        sync: false,
        ...messages.value,
      }
      history.value.push(_history)

      pageOptions.select = history.value.length - 1
    }

    genTitle = (index: number) => {
      const conversation = history.value[index]
      const options = useChatTitle(conversation)

      conversation._titleOptions = options
      conversation.lastUpdate = Date.now()

      const effect = watch(
        () => options,
        () => {
          conversation.topic = options.title

          if (options.status === Status.ERROR)
            conversation.topic = `(Error) ${conversation.topic}`

          if (options.streaming === false)
            effect()
        },
        { deep: true },
      )
    }
  }
  const conversation = history.value[pageOptions.select]

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

  // abort
  await useChatExecutor(
    conversation,
    (res) => {
      if (res.error) {
        obj.streaming = false
        callback(Status.ERROR)

        return
      }

      if (res.done) {
        obj.streaming = false
        callback(Status.AVAILABLE)

        setTimeout(() => {
          chatRef.value?.generateScroll()
        }, 200)

        return
      }

      conversation.id = res.id || res.run_id!

      const { event, name } = res
      if (event === 'on_chain_start') {
        if (name === 'Agent') {
          obj.generating = false

          return (obj.agent = reactive({
            actions: ['正在分析信息...'],
          }))
        }
        else if (
          name === 'OpenAIFunctionsAgent'
          || name === 'RunnableAssign'
          || name === 'RunnableMap'
          || name === 'RunnableLambda'
        ) {
          return
        }
      }
      else if (
        event === 'on_chain_stream'
        || event === 'on_prompt_start'
        || event === 'on_prompt_end'
        || event === 'on_chat_model_start'
      ) {
        obj.streaming = false
        return
      }
      else if (event === 'on_chat_model_end') {
        return
      }
      else if (event === 'on_chain_end') {
        if (name === 'Agent') {
          obj.agent.actions.shift()
          callback(Status.AVAILABLE)

          setTimeout(() => {
            chatRef.value?.generateScroll()
          }, 200)
          return
        }

        return
      }
      else if (event === 'on_tool_start') {
        if (name === 'TavilySearchResults')
          return obj.agent.actions[0] = `正在广泛搜索 \`${res.data.input.input}\``
        if (name === 'SerpAPI')
          return obj.agent.actions[0] = `正在精确搜索 \`${res.data.input.input}\``
        if (name === 'Calculator')
          return obj.agent.actions[0] = `正在计算 \`${res.data.input.input}\``
        if (name === 'WebBrowser') {
          let input = res.data.input.input
          if (input.indexOf(','))
            input = input.split(',').at(-1)

          return obj.agent.actions[0] = `正在浏览 \`${input}\``
        }
        else if (name === 'QuotaSearchAPI') {
          return obj.agent.actions[0] = `Quota正在搜索 \`${res.data.input.input}\``
        }

        console.log('e', res)

        return
      }
      else if (event === 'on_chat_model_stream') {
        if (name === 'ChatOpenAI' || name === 'ChatVolc') {
          const text = res!.data?.chunk?.kwargs
          if (!text?.content)
            return

          obj.streaming = true
          obj.content += text!.content
          chatRef.value?.generateScroll()
        }
        else {
          console.log('model stream', res)
        }

        return
      }
      else if (event === 'on_tool_end') {
        if (name === 'TavilySearchResults') {
          const output = res.data.output

          const websites = JSON5.parse(output)

          for (let i = 0; i < websites.length; i++) {
            const website = websites[i]

            obj.agent.actions.push({
              type: 'url',
              data: website,
              title: `[${i + 1}] \`${website.title}\``,
            })
          }
        }
        else if (name === 'SerpAPI') {
          const output = res.data.output

          const _obj = JSON5.parse(output)

          obj.agent.actions.push({
            type: 'display',
            data: {
              ..._obj,
              _: res.data,
            },
          })
        }
        else if (name === 'QuotaSearchAPI') {
          const output = res.data.output

          const _obj = JSON5.parse(output)

          obj.agent.actions.push({
            type: 'display',
            data: {
              type: 'quota_search',
              ..._obj,
              _: res.data,
            },
          })
        }
        else if (name === 'Calculator') {
          obj.agent.actions.push({
            type: 'display',
            data: {
              type: 'Calculator',
              ...res.data,
            },
          })
        }

        console.log('tool end', res)

        return
      }

      console.log('process item', res)
    },
  )

  genTitle(pageOptions.select)
}

function handleClear() {
  messages.value.messages.length = 0
}

function handleCancel() {
  // remove last one
  messages.value.messages.splice(messages.value.messages.length - 1, 1)

  status.value = Status.AVAILABLE
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
        ref="chatRef"
        v-model:messages="messages"
        :status="status"
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
