import type { ThHistory } from '~/components/history/history-types'
import { inputProperty } from '~/components/input/input'

export enum CompletionQuotaModel {
  QUOTA_THIS_NORMAL = 'this-normal',
  QUOTA_THIS_NORMAL_TURBO = 'this-normal-turbo',
  QUOTA_THIS_NORMAL_ULTRA = 'this-normal-ultra',
}

export enum CompletionStatus {
  AVAILABLE,
  GENERATING,
  ERROR,
}

export interface ICompletionHandler {
  onTriggerStatus?: (status: CompletionStatus) => void
  onReqCompleted?: () => void
  onFrequentLimit?: () => void
  // return true to deny auto add
  onCompletion?: (name: string, text: string) => boolean
  onCompletionStart?: (name: string) => void
  onChainEnd?: (name: string) => void
  onToolStart?: (name: string, input?: string) => void
  onToolEnd?: (name: string, output?: string) => void
  onError?: () => void
}

export interface IToolHandler {
  onToolStart: (name: string, input?: string) => void
  onToolEnd: (name: string, output?: string) => void
}

export const $completion = {
  v1: {
    createEmptyHistory() {
      return {
        id: '',
        topic: '新的聊天',
        messages: [],
        lastUpdate: -1,
        model: QuotaModel.QUOTA_THIS_NORMAL,
        sync: false,
        syncing: false,
        status: Status.AVAILABLE,
      } as ThHistory
    },

    createEmptyHistoryWithInput(input: string) {
      const history = this.createEmptyHistory()

      return {
        ...history,
        messages: [
          {
            date: formatDate(Date.now()),
            role: 'user',
            content: input,
            status: Status.AVAILABLE,
          },
        ],
      }
    },

    createCompletion(conversation: ThHistory) {
      let handler: ICompletionHandler = {}
      const tempMessage = reactive({
        date: formatDate(Date.now()),
        role: 'assistant',
        content: '',
        status: CompletionStatus.AVAILABLE,
        agent: {
          actions: [],
        },
      })

      conversation.messages.push(tempMessage)

      watch(() => tempMessage.status, (status) => {
        handler.onTriggerStatus?.(status)
      })

      function complete() {
        if (tempMessage.agent?.actions?.length)
          tempMessage.agent.actions = tempMessage.agent.actions.filter((item: string) => typeof item !== 'string')

        setTimeout(() => {
          handler.onReqCompleted?.()
        }, 200)
      }

      return {
        tempMessage,
        registerHandler(_handler: ICompletionHandler = {}) {
          handler = _handler
        },
        send: async (options?: Partial<ChatCompletionDto>) => {
          await useChatExecutor(
            conversation,
            (res) => {
              if (res.error) {
                tempMessage.status = CompletionStatus.ERROR

                if (res.frequentLimit)
                  handler.onFrequentLimit?.()

                return
              }

              if (res.done) {
                tempMessage.status = CompletionStatus.AVAILABLE
                complete()

                return
              }

              if (!conversation.id)
                conversation.id = res.id || res.run_id!

              const { event, name } = res
              if (event === 'on_chain_start') {
                handler.onCompletionStart?.(name)
              }
              else if (event === 'on_chain_end') {
                handler.onChainEnd?.(name)
              }
              else if (event === 'on_tool_start') {
                const input = res.data.input.input
                handler.onToolStart?.(name, input)

                console.error('e', res)
              }
              else if (event === 'on_chat_model_stream') {
                const text = res!.data?.chunk?.kwargs
                if (!text?.content)
                  return

                if (!handler.onCompletion?.(name, text.content)) {
                  if (name === 'ChatOpenAI' || name === 'ChatVolc')
                    tempMessage.content += text!.content
                }
              }
              else if (event === 'on_tool_end') {
                handler.onToolEnd?.(name, res.data.output)

                console.log('tool end', res)
              }
            },
            {
              ...(options || {}),
              temperature: inputProperty.temperature / 100,
            },
          )
        },
      }
    },
  },
}
