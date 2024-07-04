import { ENDS_URL } from '~/constants'

export async function useChatCompletion(context: ChatCompletion, callback: (data: CompletionItem) => void) {
  const _messages = context.messages.map((item) => {
    return {
      role: item.role,
      content: item.content,
    }
  })

  const res = await $fetch<ReadableStream>(`${ENDS_URL.dev}/api/aigc`, {
    method: 'POST',
    responseType: 'stream',
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
          if (data === 'data: DONE') {
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
}
