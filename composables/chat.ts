import JSON5 from 'json5'
import { getConversations, postHistory } from './api/chat'
import { endHttp } from './api/axios'
import { globalOptions } from '~/constants'

import type { ThHistory } from '~/components/history/history-types'
import { inputProperty } from '~/components/input/input'

export enum QuotaModel {
  // 普通版本，纯问答（类豆包，普通联网）
  QUOTA_THIS_NORMAL = 'this-normal',

  // 普通版本+，联网+工具能力（类GPT，高级联网+工具）
  QUOTA_THIS_NORMAL_PLUS = 'this-normal-plus',

  // 中级模型，中级会员可用 （上下文更强，普通联网）
  QUOTA_THIS_NORMAL_TURBO = 'this-normal-turbo',

  // 中级模型，中级会员可用 （上下文更强，类GPT，高级联网+工具）
  QUOTA_THIS_NORMAL_TURBO_PLUS = 'this-normal-turbo-plus',

  // 高级模型，高级会员可用 （全功能，上下文更强，类GPT，高级联网+工具）
  QUOTA_THIS_NORMAL_ULTRA = 'this-normal-ultra',

  // 极速模型，高级会员可用 （全功能，上下文更强，类GPT，高级联网+工具）
  QUOTA_THIS_NORMAL_ULTRA_PLUS = 'this-normal-ultra-plus',
}

export interface ChatCompletionDto {
  model: QuotaModel

  temperature: number

  tools: boolean

  generateTitle: boolean

  generateSummary: number

  templateId: number
}

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
  model: QuotaModel
  _titleOptions?: {
    title: string
    status: Status
    streaming: boolean
    generating: boolean
  }
  status: Status
  templateId?: number
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
  content: string | string[]
  streaming?: boolean
  model?: string
  hide?: boolean
  status: Status
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
      return (options.status = Status.AVAILABLE)

    const text: string = res.data?.output
    if (!text)
      return

    for (; i < text.length; ++i) {
      if (i >= 14)
        break
      const code = text[i]

      setTimeout(() => {
        options.title += code

        options.title = options.title.replaceAll('**', '')
      }, i * 20)
    }
  }, {
    generateTitle: true,
    model: QuotaModel.QUOTA_THIS_NORMAL,
    temperature: 0.1,
  })

  return options
}

let lastSent = ''

async function handleExecutorItem(item: string, callback: (data: any) => void) {
  if (item === '[DONE]') {
    callback({
      done: true,
    })
  }
  else if (item.startsWith('请求频率过快')) {
    ElMessage.error(`${item}`)

    callback({
      done: true,
      error: true,
      frequentLimit: true,
    })
  }
  else {
    let data = item
    if (lastSent) {
      data = lastSent + item
      lastSent = ''
    }

    try {
      const json = JSON5.parse(item)

      if (json?.type === 'heartbeat') {
        callback({
          done: true,
          error: true,
        })
        return
      }

      if (json?.type === 'error')
        return ElMessage.error(json.message)

      callback({
        done: false,
        ...json,
      })
    }
    catch (e: any) {
      if (e.message.includes('invalid end of input')) {
        console.warn('Item Not Completed, continuing receiving ...', item)

        lastSent = data
        return
      }

      if (item.includes('message content must be less than 1024 tokens')) {
        ElMessage.error(`未登录时不允许发送长token！`)

        callback({
          done: true,
          error: true,
          frequentLimit: true,
        })

        return
      }

      console.log('item', item)
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

    const _value = value

    const arr = _value.split('\n')

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]

      if (item.startsWith('data: ')) { handleExecutorItem(item.slice(6), callback) }
      else {
        try {
          const data = JSON.parse(item)

          if (data.code === 1101)
            $handleUserLogout()

          if (data?.message && !data?.data)
            ElMessage.error(data.message)
        }
        catch (_ignored) {
          // console.error('error in chat', _ignored)
        }
      }
    }
  }
}

export async function useChatExecutor(context: ChatCompletion, callback: (data: any) => void, options: Partial<ChatCompletionDto>) {
  const _messages = context.messages.map((item) => {
    return {
      role: item.role,
      content: item.content,
    }
  })

  _messages.pop()

  const { promise, resolve } = Promise.withResolvers()

  function _callback() {
    let doComplete = false

    return (data: any) => {
      if (doComplete)
        return

      if (data?.done)
        doComplete = true

      callback(data)
    }
  }

  const wrappedCallback = _callback()

  async function _func() {
    try {
      let url = ''
      if (userStore.value.isLogin && (options.generateSummary !== undefined && options.generateSummary !== 0))
        url = `${globalOptions.getEndsUrl()}api/aigc/executor/completion?uid=${userStore.value.id}`
      else url = `${globalOptions.getEndsUrl()}api/aigc/executor${userStore.value.isLogin ? `/authorized?uid=${userStore.value.id}` : ''}`

      const res = await $fetch<ReadableStream>(url, {
        method: 'POST',
        responseType: 'stream',
        headers: {
          Accept: 'text/event-stream',
          Authorization: userStore.value.isLogin ? `Bearer ${userStore.value.token!.accessToken}` : '',
        },
        body: {
          ...options,
          messages: _messages,
        },
      })

      const reader = res.pipeThrough(new TextDecoderStream()).getReader()
      await handleExecutorResult(reader, wrappedCallback)
    }
    catch (e) {
      console.error(e)

      wrappedCallback({
        done: true,
        error: true,
        e,
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
  onFrequentLimit?: () => void
  onErrorHandler?: (error: Error) => void
}

export class ChatManager {
  originObj: ThHistory = {
    id: '',
    topic: '新的聊天',
    messages: [],
    lastUpdate: -1,
    model: QuotaModel.QUOTA_THIS_NORMAL,
    sync: false,
    syncing: false,
    status: Status.AVAILABLE,
  }

  messages = ref<ThHistory>(JSON.parse(JSON.stringify(this.originObj)))
  history = ref<ThHistory[]>([])
  loadingHistory = ref(false)
  historyCompleted = ref(false)

  currentLoadPage: number = 0

  constructor() {
    this.init()

    $event.on('USER_LOGOUT_SUCCESS', () => {
      this.history.value.length = 0
      this.messages.value = JSON.parse(JSON.stringify(this.originObj))
    })
    $event.on('USER_LOGIN_SUCCESS', async () => {
      await this.init()

      this.loadHistories()
    })
  }

  _scope: any
  async init() {
    this._scope?.()

    const localHistory = useLocalStorage<ThHistory[]>('chat-history', [])

    if (userStore.value.isLogin) {
      this.history.value.length = 0
      if (localHistory.value) {
        this.postLocalHistory(localHistory.value).then((leftHistory) => {
          this.history.value.push(...leftHistory)

          // 移除localHistory中所有sync true
          localHistory.value = this.history.value = this.history.value.filter((item: any) => !item.sync)

          console.warn('left histories', localHistory.value.length, this.history.value.length)

          // this.loadHistories()
        })
      }
    }
    else {
      this._scope = watchEffect(() => {
        this.history.value = localHistory.value
      })
    }
  }

  async loadHistories() {
    if (!userStore.value.isLogin)
      return

    this.loadingHistory.value = true

    this.currentLoadPage += 1

    const res: any = await getConversations({
      pageSize: 25,
      page: this.currentLoadPage,
    })

    this.loadingHistory.value = false

    if (res.code !== 200)
      return ElMessage.error('获取历史记录失败!所有操作不会被保存!')

    const totalPages = res.data.meta.totalPages
    if (totalPages <= this.currentLoadPage) {
      this.historyCompleted.value = true
      this.currentLoadPage -= 1
    }

    this.history.value = (res.data.items).map((item: any) => {
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
    })
  }

  async postTargetHistory(data: ThHistory): Promise<any> {
    data.syncing = true

    const meta: Record<string, any> = {
      sync: true,
      stat: data.stat,
      lastUpdate: data.lastUpdate,
      mask: data.mask,
      model: data.model,
      status: data.status,
      templateId: data.templateId,
    }

    Object.entries(meta).forEach(([key, value]) => {
      if (!value)
        delete meta[key]
    })

    const res: any = await postHistory({
      uid: data.id || (`${Date.now()}THIS_AI_STANDARD_QUOTA_WISH`),
      topic: data.topic,
      value: `${btoa(encodeURIComponent(JSON.stringify(data.messages)))}`,
      meta: JSON.stringify(meta),
    })

    data.syncing = false

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

      if (res.code === 200)
        return

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
      if (this.history.value.length >= 15) {
        ElMessageBox.alert('受限于浏览器限制，未登录最多可记录15段历史对话，登录后可享受数据云端穿梭能力。', '你需要登录来继续', {
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

  async sendMessage(obj: any, conversation: ThHistory, options: Partial<ChatCompletionDto>, callback: IMessageHandler) {
    function complete() {
      if (obj.agent?.actions?.length)
        obj.agent.actions = obj.agent.actions.filter((item: string) => typeof item !== 'string')

      setTimeout(() => {
        callback.onTriggerUpdate()

        callback?.onReqCompleted?.()
      }, 200)
    }

    // TODO: abort
    await useChatExecutor(
      conversation,
      (res) => {
        if (res.error) {
          obj.streaming = false
          callback.onTriggerStatus(Status.ERROR)

          if (res.frequentLimit)
            callback?.onFrequentLimit?.()
          else callback?.onErrorHandler?.(res.e)

          return
        }

        if (res.done) {
          obj.streaming = false
          callback.onTriggerStatus(Status.AVAILABLE)

          setTimeout(() => {
            callback.onTriggerUpdate()

            complete()
          }, 200)

          return
        }

        if (!conversation.id)
          conversation.id = res.id || res.run_id!

        const { event, name } = res
        if (event === 'on_chain_start') {
          if (name === 'Agent') {
            obj.status = Status.AVAILABLE

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
      {
        ...options,
        temperature: inputProperty.temperature / 100,
      },
    )
  }

  cancelCurrentReq() {
    if (!this.messages.value)
      return

    const msg = this.messages.value.messages.at(-2)

    this.messages.value.messages.splice(this.messages.value.messages.length - 1, 1)
    this.messages.value.messages.splice(this.messages.value.messages.length - 1, 1)

    this.messages.value.status = Status.AVAILABLE

    return msg
  }

  // TODO 撤销删除
  async deleteMessage(index: number) {
    if (userStore.value.isLogin) {
      const conversation: ThHistory = this.history.value[index]
      const res: any = await endHttp.del(`aigc/conversations/${conversation.id}`)
      if (res.code !== 200)
        return ElMessage.error(`删除失败(${res.message})`)
    }

    this.history.value.splice(index, 1)
  }

  setStatus(status: Status) {
    if (!this.messages.value)
      return

    this.messages.value.status = status
  }
}

export const chatManager = new ChatManager()

export interface ChatLogQueryDto extends Record<string, any> {
  message_type: number

  model: string

  status: string

  page: number

  pageSize: number
}

export enum ChatMsgType {
  GENERATE_TITLE,
  COMPLETION,
  GENERATE_IMAGE,
  GENERATE_VIDEO,
  GENERATE_AUDIO,
  GENERATE_DOCUMENT,
  COMPLETION_PROMPT_POLISH,
  COMPLETION_PROMPT_TRANSLATION,
}

export function deserializeMsgType(type: number) {
  switch (+type) {
    case ChatMsgType.GENERATE_TITLE:
      return '生成标题'
    case ChatMsgType.COMPLETION:
      return '生成文本'
    case ChatMsgType.GENERATE_IMAGE:
      return '生成图片'
    case ChatMsgType.GENERATE_VIDEO:
      return '生成视频'
    case ChatMsgType.GENERATE_AUDIO:
      return '生成音频'
    case ChatMsgType.GENERATE_DOCUMENT:
      return '生成文档'
    case ChatMsgType.COMPLETION_PROMPT_POLISH:
      return '润色提示词'
    case ChatMsgType.COMPLETION_PROMPT_TRANSLATION:
      return '翻译提示词'
    default:
      return '未知'
  }
}

export interface PromptQueryDto extends Record<string, any> {
  page?: number
  pageSize?: number
  /**
   * 标题
   */
  title?: string
}

export interface PromptEntityDto {
  /**
   * 提示词头像
   */
  avatar?: string
  /**
   * 提示文本
   */
  content?: string
  createdAt?: Date
  /**
   * 创建者
   */
  creator?: any
  id?: number
  /**
   * 提示词标题
   */
  title?: string
  description?: string
  keywords?: string | string[]
  updatedAt?: Date
  /**
   * 更新者
   */
  updater?: any
  /**
   * 使用记录
   */
  usages?: any[]
  audits?: any[]

  status?: number
  tags?: any[]
}

export class ChatAdminManager {
  list(query: ChatLogQueryDto) {
    return endHttp.get('aigc/chat_log', query)
  }

  consumption_statistics(startDate?: string, endDate?: string) {
    return endHttp.get('aigc/consumption_statistics', {
      startDate,
      endDate,
    })
  }

  statistics(startDate?: string, endDate?: string, userId?: number) {
    return endHttp.get('aigc/chat_log/statistics', {
      startDate,
      endDate,
      userId,
    })
  }

  async promptList(dto: PromptQueryDto) {
    return endHttp.post('aigc/prompts/list', dto)
  }

  async createTemplate(dto: PromptEntityDto) {
    return endHttp.post('aigc/prompts', dto)
  }

  async updateTemplate(id: string, dto: PromptEntityDto) {
    return endHttp.put(`aigc/prompts/${id}`, dto)
  }

  async auditTemplate(id: number, dto: { status: number, reason?: string }) {
    return endHttp.post(`aigc/prompts/audit/${id}`, {
      status: dto.status,
      reason: dto.reason,
    })
  }

  async publishTemplate(id: number, doPublish: boolean) {
    return endHttp.put(`aigc/prompts/status/${id}`, {
      online: doPublish,
    })
  }
}

export const chatAdminManager = new ChatAdminManager()
