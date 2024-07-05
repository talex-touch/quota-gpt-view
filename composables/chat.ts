import { ENDS_URL } from '~/constants'

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
  memoryPrompt: string
  messages: ChatItem[]
  stat: {
    tokenCount: number
    wordCount: number
    charCount: number
  }
  lastUpdate: number
  lastSummarizeIndex: number
  mask: Mask
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

  _context.messages.splice(0, 1)

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

export async function useChatCompletion(context: ChatCompletion, callback: (data: CompletionItem) => void) {
  const _messages = context.messages.map((item) => {
    return {
      role: item.role,
      content: item.content,
    }
  })

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
