import type { ThHistory } from '~/components/history/history-types'
import { inputProperty } from '~/components/input/input'
import { type IChatConversation, type IChatInnerItem, IChatRole } from '~/composables/api/base/v1/chat.type.d.ts'

export const $chat = {
  emptyHistory() {
    return {
      id: '',
      topic: '新的聊天',
      messages: [],
      lastUpdate: -1,
      templateId: -1,
    } as IChatConversation
  },

  emptyChatItem() {
    return {
      id: '',
      timestamp: Date.now(),
      content: [],
    }
  },

  emptyChatInnerItem({
    role,
    model,
    value,
    meta,
  }: IChatInnerItem) {
    if (!role)
      role = IChatRole.USER

    if (!model)
      model = QuotaModel.QUOTA_THIS_NORMAL

    return {
      role,
      model,
      value,
      meta,
    }
  },

  emptyHistoryWithInput(input: string) {
    const history = this.emptyHistory()

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
}
