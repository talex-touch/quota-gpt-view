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
    _history.lastUpdate = Date.now()
    history.value.push(_history)

    initMessage(messages.value.messages)

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

      initMessage(messages.value.messages)

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
          obj.agent.actions[0] = `正在搜索 \`${res.data.input.input}\``

        return
      }
      else if (event === 'on_chat_model_stream') {
        if (name === 'ChatOpenAI') {
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
          obj.agent.actions.length = 0
          // const output = res.data.output

          // const websites = JSON5.parse(output)

          const websites = [
            {
              url:
                'https://www.accuweather.com/en/cn/chengdu/106774/august-weather/106774',
              title: 'August - Chengdu, Sichuan, China Monthly Weather | AccuWeather',
              content:
                'Get the monthly weather forecast for Chengdu, Sichuan, China, including ... 2024. 2023 2024 2025 · Daily. S. M. T. W. T. F. S. 28. 85°.',
              score: 0.98674,
              raw_content: null,
            },
            {
              title: 'Weather in Chengdu',
              url: 'https://www.weatherapi.com/',
              content:
                '{\'location\': {\'name\': \'Chengdu\', \'region\': \'Sichuan\', \'country\': \'China\', \'lat\': 30.67, \'lon\': 104.07, \'tz_id\': \'Asia/Shanghai\', \'localtime_epoch\': 1720452243, \'localtime\': \'2024-07-08 23:24\'}, \'current\': {\'last_updated_epoch\': 1720451700, \'last_updated\': \'2024-07-08 23:15\', \'temp_c\': 25.1, \'temp_f\': 77.2, \'is_day\': 0, \'condition\': {\'text\': \'Partly cloudy\', \'icon\': \'//cdn.weatherapi.com/weather/64x64/night/116.png\', \'code\': 1003}, \'wind_mph\': 6.9, \'wind_kph\': 11.2, \'wind_degree\': 360, \'wind_dir\': \'N\', \'pressure_mb\': 1003.0, \'pressure_in\': 29.62, \'precip_mm\': 0.5, \'precip_in\': 0.02, \'humidity\': 83, \'cloud\': 75, \'feelslike_c\': 28.4, \'feelslike_f\': 83.1, \'windchill_c\': 24.0, \'windchill_f\': 75.3, \'heatindex_c\': 26.7, \'heatindex_f\': 80.0, \'dewpoint_c\': 23.2, \'dewpoint_f\': 73.7, \'vis_km\': 10.0, \'vis_miles\': 6.0, \'uv\': 1.0, \'gust_mph\': 7.8, \'gust_kph\': 12.6}}',
              score: 0.98281,
              raw_content: null,
            },
            {
              url:
                'https://en.climate-data.org/asia/china/sichuan/chengdu-2239/t/august-8/',
              title: 'Weather Chengdu in August 2024 - Climate-Data.org',
              content:
                'Chengdu weather in August ; Temperature August, 25.8°C | 78.4°F ; Temperature August max. 29.6°C | 85.2°F ; Temperature August min. 22.4°C | 72.4°F ; Precipitation ...',
              score: 0.98277,
              raw_content: null,
            },
            {
              url:
                'https://www.weather25.com/asia/china/sichuan/chengdu?page=month&month=August',
              title: 'Chengdu weather in August 2024 - Weather25.com',
              content:
                'The weather in Chengdu in August is very hot. The average temperatures are between 73°F and 89°F, drinking water regularly is advisable.',
              score: 0.98073,
              raw_content: null,
            },
            {
              url: 'https://www.weather2travel.com/china/chengdu/august/',
              title: 'Chengdu weather in August 2024 | China: How hot?',
              content:
                'Expect 30°C daytime maximum temperatures in the shade with on average 6 hours of sunshine per day in Chengdu in August. Check more long-term weather averages ...',
              score: 0.97294,
              raw_content: null,
            },
          ]

          for (let i = 0; i < websites.length; i++) {
            const website = websites[i]

            obj.agent.actions.push({
              type: 'url',
              data: website,
              title: `[${i + 1}] \`${website.title}\``,
            })
          }
        }

        return
      }

      console.log('process item', res)
    },
    true,
  )

  // genTitle(pageOptions.select)
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
