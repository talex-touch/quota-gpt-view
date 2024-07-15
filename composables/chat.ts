import JSON5 from 'json5'
import { ENDS_URL } from '~/constants'

import type { ThHistory } from '~/components/history/history'

export interface CompletionItem {
  done: boolean
  error?: boolean
  choices?: {
    delta: any
    finish_reason: string
    index: number
  }[]
  created?: number
  id?: string
  model?: string
  object?: string
}

export enum Status {
  AVAILABLE,
  GENERATING,
  ERROR,
}

export interface ChatCompletion {
  id: string
  topic: string
  messages: ChatItem[]
  stat?: {
    tokenCount: number
    wordCount: number
    charCount: number
  }
  lastUpdate: number
  // lastSummarizeIndex: number
  mask?: Mask
  model: string
  _titleOptions?: {
    title: string
    status: Status
    streaming: boolean
    generating: boolean
  }
}

export interface Mask {
  id: string
  avatar: string
  name: string
  context: any
  syncGlobalConfig: boolean
  modelConfig: {
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    presence_penalty: number
    frequency_penalty: number
    sendMemory: boolean
    historyMessageCount: number
    compressMessageLengthThreshold: number
    enableInjectSystemPrompts: boolean
    template: string
  }
  lang: string
  builtin: boolean
  createdAt: number
}

export interface ChatItem {
  id?: string
  date: string
  role: string
  content: string
  streaming?: boolean
  model?: string
  hide?: boolean
}

export interface ChatMessage { role: 'system' | 'user' | 'assistant', content: string }

export interface EventExecutor {
  event: 'on_tool_end' | 'on_tool_start' | 'on_chain_end' | 'on_parser_end' | 'on_parser_start' | 'on_chat_model_end'
  | 'on_chat_model_stream' | 'on_chat_model_start' | 'on_chain_start' | 'on_chain_stream' | 'on_chain_end' | 'on_prompt_start' | 'on_prompt_end'
  data: any
  name: 'ChatOpenAI' | 'ChatPromptTemplate' | 'Agent' | 'OpenAIFunctionsAgent' | 'RunnableAssign' | 'RunnableMap' | 'RunnableLambda'
  tags: string[]
  run_id: string
  metadata: {
    [key: string]: any
  }
}

/**
 * Generate chat title in conversation
 */
export function useChatTitle(context: ChatCompletion) {
  const options = reactive({
    status: Status.GENERATING,
    streaming: true,
    generating: true,
    title: '',
  })

  const _context: ChatCompletion = JSON.parse(JSON.stringify(context))

  _context.messages.push({
    date: genFormatNowDate(),
    role: 'user',
    content: 'Give me a title above, should be between 2-6 words.(Use the language of the previous message)',
    streaming: false,
  })

  _context.messages.push({
    date: genFormatNowDate(),
    role: 'user',
    content: 'Give me a title above, should be between 2-6 words.(Use the language of the previous message)',
    streaming: false,
  })

  let ind = 0
  useChatCompletion(_context, (res) => {
    if (res.error) {
      console.error(res)

      options.streaming = false
      options.status = Status.ERROR

      return
    }

    if (res.done) {
      setTimeout(() => {
        options.streaming = false
        options.status = Status.AVAILABLE
      }, (ind + 2) * 100)

      return
    }

    if (!res.choices?.length)
      return (options.generating = false)

    const text = res!.choices![0]!.delta
    if (!text.content)
      return

    ind += 1
    setTimeout(() => {
      options.title += text!.content

      options.title.replace('"', '')
    }, ind * 100)
  })

  return options
}

async function handleExecutorItem(item: any, callback: (data: any) => void) {
  if (item === '[DONE]') {
    callback({
      done: true,
    })
  }
  else {
    const json = JSON5.parse(item)

    if (json?.type === 'heartbeat')
      return

    callback({
      done: false,
      ...json,
    })
  }
}

async function handleExecutorResult(reader: ReadableStreamDefaultReader<string>, callback: (data: any) => void) {
  // const lastData = ''

  while (true) {
    const { value, done } = await reader.read()

    if (done)
      break

    if (!value.length)
      continue

    if (value.includes('data: 请求超时'))
      continue

    const _value = /* lastData + */ value

    // if (!_value.endsWith(' ') && !_value.endsWith('}') && !_value.endsWith('\n')) {
    //   lastData = _value

    //   continue
    // }

    // console.log('v', _value)

    const arr = _value.split('\n')
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]

      if (item.startsWith('data: '))
        handleExecutorItem(item.slice(6), callback)
    }
  }
}

export async function useChatExecutor(context: ChatCompletion, callback: (data: any) => void, simulate: boolean = false) {
  const _messages = context.messages.map((item) => {
    return {
      role: item.role,
      content: item.content,
    }
  })

  _messages.pop()

  // https://api.aiskt.com/v1/chat/completions
  // http://localhost:7001/api/aigc/executor
  const res = simulate
    ? null
    : await $fetch<ReadableStream>(`https://quota.api.tagzxia.com/api/aigc/executor`, {
      method: 'POST',
      responseType: 'stream',
      headers: {
        Accept: 'text/event-stream',
      },
      body: {
        messages: _messages,
      },
    })

  const { promise, resolve } = Promise.withResolvers()

  async function _func() {
    try {
      if (!res) {
        console.log('[SIMULATING MODE]')

        const res = await simulateExecutor()

        for await (const chunk of res)
          await handleExecutorItem(chunk, callback)
      }
      else {
        const reader = res.pipeThrough(new TextDecoderStream()).getReader()
        await handleExecutorResult(reader, callback)
      }
    }
    catch (e) {
      console.error(e)

      callback({
        done: true,
        error: true,
      })
    }

    resolve(void 0)
  }

  _func()

  return promise
}

export async function useChatCompletion(context: ChatCompletion, callback: (data: CompletionItem) => void) {
  const _messages = context.messages.map((item) => {
    return {
      role: item.role,
      content: item.content,
    }
  })

  // remove last one
  _messages.pop()

  const res = await $fetch<ReadableStream>(`https://api.aiskt.com/v1/chat/completions`, {
    method: 'POST',
    responseType: 'stream',
    headers: {
      Accept: 'text/event-stream',
      Authorization: 'Bearer sk-u1RFUsfnnyHAZyQQ56114c02606640Ab8b0a23Ab3dF516Eb',
    },
    body: {
      messages: _messages,
      model: context.mask.modelConfig.model,
      temperature: context.mask.modelConfig.temperature,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 1,
      stream: true,
    },
  })

  return new Promise(async (resolve) => {
    const reader = res.pipeThrough(new TextDecoderStream()).getReader()

    while (true) {
      const { value, done } = await reader.read()

      if (done)
        break

      if (!value.length)
        continue

      try {
        const arr = value.split('\n')
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i]

          if (item.startsWith('data: ')) {
            const data = item.slice(6)
            if (data === '[DONE]') {
              callback({
                done: true,
              })
              break
            }
            else {
              const json = JSON.parse(data)

              callback({
                done: false,
                ...json,
              })
            }
          }
        }
      }
      catch (e) {
        callback({
          done: true,
          error: true,
        })
      }
    }

    resolve(void 0)
  })
}

export interface IMessageHandler {
  onTriggerStatus: (status: Status) => void
  onTriggerUpdate: () => void
}

export class ChatManager {
  originObj: ChatCompletion = {
    id: '',
    topic: '新的聊天',
    messages: [],
    lastUpdate: -1,
    model: 'gpt-3.5-turbo',
  }

  messages = ref<ChatCompletion>(JSON.parse(JSON.stringify(this.originObj)))
  history = useLocalStorage<ThHistory[]>('chat-history', [])
  status = ref(Status.AVAILABLE)

  createMessage() {
    const _history: ThHistory = {
      sync: false,
      ...this.messages.value,
    }
    _history.lastUpdate = Date.now()
    this.history.value.push(_history)
  }

  genConversationTitle(conversation: ChatCompletion) {
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

  async sendMessage(obj: any, conversation: any, callback: IMessageHandler) {
    // TODO: abort
    await useChatExecutor(
      conversation,
      (res) => {
        if (res.error) {
          obj.streaming = false
          callback.onTriggerStatus(Status.ERROR)

          return
        }

        if (res.done) {
          obj.streaming = false
          callback.onTriggerStatus(Status.AVAILABLE)

          setTimeout(() => {
            callback.onTriggerUpdate()
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
            callback.onTriggerStatus(Status.AVAILABLE)

            setTimeout(() => {
              callback.onTriggerUpdate()
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
          else if (name === 'QuotaSearchAPI' || name === 'QuotaSearchImagesAPI' || name === 'QuotaSearchVideosAPI') {
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
            callback.onTriggerUpdate()
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
          else if (name === 'QuotaSearchImagesAPI') {
            const output = res.data.output

            const _obj = JSON5.parse(output)

            obj.agent.actions.push({
              type: 'display',
              data: {
                type: 'quota_search_images',
                ..._obj,
                _: res.data,
              },
            })
          }
          else if (name === 'QuotaSearchVideosAPI') {
            const output = res.data.output

            const _obj = JSON5.parse(output)

            obj.agent.actions.push({
              type: 'display',
              data: {
                type: 'quota_search_videos',
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
  }

  cancelCurrentReq() {
    const msg = this.messages.value.messages.at(-2)

    this.messages.value.messages.splice(this.messages.value.messages.length - 1, 2)

    this.status.value = Status.AVAILABLE

    return msg
  }

  // TODO 撤销删除
  deleteMessage(index: number) {
    this.history.value.splice(index, 1)
  }
}

export const chatManager = new ChatManager()
