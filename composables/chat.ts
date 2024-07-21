import JSON5 from 'json5'
import { getConversations, postHistory } from './api/chat'
import { ENDS_URL, EndNormalUrl } from '~/constants'

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
  status?: Status
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

  let i = 0
  useChatExecutor(_context, (res) => {
    if (res.error) {
      options.streaming = false
      options.status = Status.ERROR

      return
    }

    if (res.done) {
      console.log('done')

      setTimeout(() => {
        options.streaming = false
        options.status = Status.AVAILABLE
      }, (i + 2) * 100)

      return
    }

    const { event, name } = res
    if (event !== 'on_chain_end' || name !== 'RunnableWithMessageHistory')
      return

    if (!res.data?.output?.length)
      return (options.generating = false)

    const text: string = res.data?.output
    if (!text)
      return

    for (; i < text.length; ++i) {
      const code = text[i]

      setTimeout(() => {
        options.title += code

        options.title = options.title.replaceAll('**', '')
      }, i * 20)
    }
  }, true)

  return options
}

async function handleExecutorItem(item: any, callback: (data: any) => void) {
  if (item === '[DONE]') {
    callback({
      done: true,
    })
  }
  else {
    try {
      const json = JSON5.parse(item)

      if (json?.type === 'heartbeat')
        return

      callback({
        done: false,
        ...json,
      })
    }
    catch (e) {
      console.log('error', item)
      console.error(e)

      callback({
        done: true,
        error: true,
      })
    }
  }
}

async function handleExecutorResult(reader: ReadableStreamDefaultReader<string>, callback: (data: any) => void) {
  // const lastData = ''

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      callback({
        done: true,
      })

      break
    }

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

export async function useChatExecutor(context: ChatCompletion, callback: (data: any) => void, generateTitle: boolean = false) {
  const _messages = context.messages.map((item) => {
    return {
      role: item.role,
      content: item.content,
    }
  })

  _messages.pop()

  const { promise, resolve } = Promise.withResolvers()

  async function _func() {
    try {
      const res = await $fetch<ReadableStream>(`${EndNormalUrl}api/aigc/executor${userStore.value.token ? '/authorized' : ''}`, {
        method: 'POST',
        responseType: 'stream',
        headers: {
          Accept: 'text/event-stream',
        },
        body: {
          generateTitle,
          messages: _messages,
        },
      })

      const reader = res.pipeThrough(new TextDecoderStream()).getReader()
      await handleExecutorResult(reader, callback)
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

export interface IMessageHandler {
  onTriggerStatus: (status: Status) => void
  onTriggerUpdate: () => void
  onReqCompleted?: () => void
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
  history: any

  currentLoadPage: number = 0

  constructor() {
    const localHistory = useLocalStorage<ThHistory[]>('chat-history', [])

    if (userStore.value.token) {
      this.history = ref([])
      if (localHistory.value) {
        this.postLocalHistory(localHistory.value).then((leftHistory) => {
          this.history.value.push(...leftHistory)

          // 移除localHistory中所有sync true
          this.history.value = this.history.value.filter((item: any) => !item.sync)

          console.warn('left histories', localHistory.value.length, this.history.value.length)

          this.loadHistories()
        })
      }
      else { this.loadHistories() }
    }
    else { this.history = localHistory }
  }

  async loadHistories() {
    this.currentLoadPage += 1

    const res: any = await getConversations({
      pageSize: 10,
      page: this.currentLoadPage,
    })

    if (res.code !== 200)
      return ElMessage.error('获取历史记录失败!所有操作不会被保存!')

    this.history.value.push(...(res.data.items).map((item: any) => {
      const option = {
        ...item,
        id: item.uid,
        meta: JSON.parse(item.meta),
        messages: JSON.parse(decodeURIComponent(atob(item.value))),
      }

      return {
        ...option,
        ...option.meta,
      }
    }))
  }

  async postTargetHistory(data: ThHistory): Promise<any> {
    const meta: Record<string, any> = {
      sync: data.sync,
      stat: data.stat,
      lastUpdate: data.lastUpdate,
      mask: data.mask,
      model: data.model,
    }

    Object.entries(meta).forEach(([key, value]) => {
      if (!value)
        delete meta[key]
    })

    const res: any = await postHistory({
      uid: data.id || (`${Date.now()}DJLASKFJOEJ-INTERNAL_TEST`),
      topic: data.topic,
      value: `${btoa(encodeURIComponent(JSON.stringify(data.messages)))}`,
      meta: JSON.stringify(meta),
    })

    if (res.code !== 200) {
      console.error('Upload err', res)

      if (res.code === 429) {
        await sleep(3000)

        return await this.postTargetHistory(data)
      }
    }
    else {
      data.sync = true
    }

    return res
  }

  async postLocalHistory(data: ThHistory[]) {
    const histories: Array<ThHistory> = []

    const upload = async (_data: any) => {
      const res = await this.postTargetHistory(_data)

      histories.push(_data)

      ElMessage({
        message: `上传历史记录失败，请重试(${res.message})`,
        type: 'error',
      })

      await sleep(3000)
    }

    for (const _data of data) {
      // TODO
      if (_data.sync)
        continue

      await upload(_data)
    }

    return histories
  }

  createMessage() {
    if (!userStore.value.token) {
      if (this.history.value.length >= 5) {
        ElMessageBox.alert('受限于浏览器限制，未登录最多可记录5段历史对话，登录后可享受数据云端穿梭能力。', '你需要登录来继续', {
          confirmButtonText: '了解',
        })

        return false
      }
    }

    const _history: ThHistory = {
      sync: false,
      ...JSON.parse(JSON.stringify(this.originObj)),
    }
    _history.lastUpdate = Date.now()
    this.history.value.push(_history)

    return true
  }

  genConversationTitle(conversation: ChatCompletion) {
    return new Promise((resolve) => {
      const options = useChatTitle(conversation)

      conversation._titleOptions = options
      conversation.lastUpdate = Date.now()

      const effect = watch(
        () => options,
        () => {
          conversation.topic = options.title

          if (options.status === Status.ERROR)
            conversation.topic = `(Error) ${conversation.topic}`

          if (options.streaming === false) {
            effect()

            resolve(void 0)
          }
        },
        { deep: true },
      )
    })
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
        }
        else if (
          event === 'on_chain_stream'
          || event === 'on_prompt_start'
          || event === 'on_prompt_end'
          || event === 'on_chat_model_start'
        ) {
          obj.streaming = false
        }
        else if (event === 'on_chain_end') {
          if (name === 'Agent') {
            obj.agent.actions.shift()
            callback.onTriggerStatus(Status.AVAILABLE)

            setTimeout(() => {
              callback.onTriggerUpdate()

              callback?.onReqCompleted?.()
            }, 200)
          }
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
          else if (name === 'QuotaDateAPI') {
            return obj.agent.actions[0] = `Quota正在分析日期`
          }

          console.error('e', res)
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
            console.error('model stream', res)
          }
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
        }
      },
    )
  }

  cancelCurrentReq() {
    const msg = this.messages.value.messages.at(-2)

    this.messages.value.messages.splice(this.messages.value.messages.length - 1, 1)
    this.messages.value.messages.splice(this.messages.value.messages.length - 1, 1)

    return msg
  }

  // TODO 撤销删除
  deleteMessage(index: number) {
    this.history.value.splice(index, 1)
  }
}

export const chatManager = new ChatManager()
