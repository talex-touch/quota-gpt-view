import { endHttp } from './api/axios'

import { QuotaModel } from './api/base/v1/aigc/completion-types'
import type { ThHistory } from '~/components/history/history-types'

export interface ChatCompletionDto {
  model: QuotaModel

  temperature: number

  tools: boolean

  generateTitle: boolean

  generateSummary: number

  templateId: number
}

export enum Status {
  AVAILABLE,
  GENERATING,
  ERROR,
}

export interface ChatCompletion {
  id: string
  topic: string
  messages: any[]
  stat?: {
    tokenCount: number
    wordCount: number
    charCount: number
  }
  lastUpdate: number
  _titleOptions?: {
    title: string
    status: Status
    streaming: boolean
    generating: boolean
  }
  status: Status
  templateId?: number
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

export class ChatManager {
  originObj: ThHistory = {
    id: '',
    topic: '新的聊天',
    messages: [],
    lastUpdate: -1,
    // model: QuotaModel.QUOTA_THIS_NORMAL,
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

  }

  _scope: any

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

  // async sendMessage(obj: any, conversation: ThHistory, options: Partial<ChatCompletionDto>, callback: IMessageHandler) {
  // function complete() {
  //   if (obj.agent?.actions?.length)
  //     obj.agent.actions = obj.agent.actions.filter((item: string) => typeof item !== 'string')

  //   setTimeout(() => {
  //     callback.onTriggerUpdate()

  //     callback?.onReqCompleted?.()
  //   }, 200)
  // }

  // TODO: abort
  // await useChatExecutor(
  //   conversation,
  //   (res) => {
  //     if (res.error) {
  //       obj.streaming = false
  //       callback.onTriggerStatus(Status.ERROR)

  //       if (res.frequentLimit)
  //         callback?.onFrequentLimit?.()
  //       else callback?.onErrorHandler?.(res.e)

  //       return
  //     }

  //     if (res.done) {
  //       obj.streaming = false
  //       callback.onTriggerStatus(Status.AVAILABLE)

  //       setTimeout(() => {
  //         callback.onTriggerUpdate()

  //         complete()
  //       }, 200)

  //       return
  //     }

  //     if (!conversation.id)
  //       conversation.id = res.id || res.run_id!

  //     const { event, name } = res
  //     if (event === 'on_chain_start') {
  //       if (name === 'Agent') {
  //         obj.status = Status.AVAILABLE

  //         return (obj.agent = reactive({
  //           actions: ['正在分析信息...'],
  //         }))
  //       }
  //     }
  //     else if (
  //       event === 'on_chain_stream'
  //       || event === 'on_prompt_start'
  //       || event === 'on_prompt_end'
  //       || event === 'on_chat_model_start'
  //     ) {
  //       obj.streaming = false
  //     }
  //     else if (event === 'on_tool_start') {
  //       if (name === 'TavilySearchResults')
  //         return obj.agent.actions[0] = `正在广泛搜索 \`${res.data.input.input}\``
  //       if (name === 'SerpAPI')
  //         return obj.agent.actions[0] = `正在精确搜索 \`${res.data.input.input}\``
  //       if (name === 'Calculator')
  //         return obj.agent.actions[0] = `正在计算 \`${res.data.input.input}\``
  //       if (name === 'WebBrowser') {
  //         let input = res.data.input.input
  //         if (input.indexOf(','))
  //           input = input.split(',').at(-1)

  //         return obj.agent.actions[0] = `正在浏览 \`${input}\``
  //       }
  //       else if (name === 'QuotaSearchAPI' || name === 'QuotaSearchImagesAPI' || name === 'QuotaSearchVideosAPI') {
  //         return obj.agent.actions[0] = `Quota正在搜索 \`${res.data.input.input}\``
  //       }
  //       else if (name === 'QuotaDateAPI') {
  //         return obj.agent.actions[0] = `Quota正在分析日期`
  //       }

  //       console.error('e', res)
  //     }
  //     else if (event === 'on_chat_model_stream') {
  //       if (name === 'ChatOpenAI' || name === 'ChatVolc') {
  //         const text = res!.data?.chunk?.kwargs
  //         if (!text?.content)
  //           return

  //         obj.streaming = true
  //         obj.content += text!.content
  //         callback.onTriggerUpdate()
  //       }
  //       else {
  //         console.error('model stream', res)
  //       }
  //     }
  //     else if (event === 'on_tool_end') {
  //       if (name === 'TavilySearchResults') {
  //         const output = res.data.output

  //         const websites = JSON5.parse(output)

  //         for (let i = 0; i < websites.length; i++) {
  //           const website = websites[i]

  //           obj.agent.actions.push({
  //             type: 'url',
  //             data: website,
  //             title: `[${i + 1}] \`${website.title}\``,
  //           })
  //         }
  //       }
  //       else if (name === 'SerpAPI') {
  //         const output = res.data.output

  //         const _obj = JSON5.parse(output)

  //         obj.agent.actions.push({
  //           type: 'display',
  //           data: {
  //             ..._obj,
  //             _: res.data,
  //           },
  //         })
  //       }
  //       else if (name === 'QuotaSearchAPI') {
  //         const output = res.data.output

  //         const _obj = JSON5.parse(output)

  //         obj.agent.actions.push({
  //           type: 'display',
  //           data: {
  //             type: 'quota_search',
  //             ..._obj,
  //             _: res.data,
  //           },
  //         })
  //       }
  //       else if (name === 'QuotaSearchImagesAPI') {
  //         const output = res.data.output

  //         const _obj = JSON5.parse(output)

  //         obj.agent.actions.push({
  //           type: 'display',
  //           data: {
  //             type: 'quota_search_images',
  //             ..._obj,
  //             _: res.data,
  //           },
  //         })
  //       }
  //       else if (name === 'QuotaSearchVideosAPI') {
  //         const output = res.data.output

  //         const _obj = JSON5.parse(output)

  //         obj.agent.actions.push({
  //           type: 'display',
  //           data: {
  //             type: 'quota_search_videos',
  //             ..._obj,
  //             _: res.data,
  //           },
  //         })
  //       }
  //       else if (name === 'Calculator') {
  //         obj.agent.actions.push({
  //           type: 'display',
  //           data: {
  //             type: 'Calculator',
  //             ...res.data,
  //           },
  //         })
  //       }

  //       console.log('tool end', res)
  //     }
  //   },
  //   {
  //     ...options,
  //     temperature: 0,
  //   },
  // )
  // }

  cancelCurrentReq() {
    if (!this.messages.value)
      return

    const msg = this.messages.value.messages.at(-2)

    this.messages.value.messages.splice(this.messages.value.messages.length - 1, 1)
    this.messages.value.messages.splice(this.messages.value.messages.length - 1, 1)

    this.messages.value.status = Status.AVAILABLE

    return msg
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
