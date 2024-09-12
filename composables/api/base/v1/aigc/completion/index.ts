import { endHttp } from '~/composables/api/axios'
import { type IChatConversation, type IChatInnerItem, type IChatItem, IChatItemStatus, IChatRole, type ICompletionHandler, QuotaModel } from '~/composables/api/base/v1/aigc/index.type.d.ts'

function mapStrStatus(str: string) {
  if (str === 'progress')
    return IChatItemStatus.GENERATING
  else if (str === 'start')
    return IChatItemStatus.WAITING
  else if (str === 'end')
    return IChatItemStatus.AVAILABLE

  console.error('unknown status', str)

  return IChatItemStatus.AVAILABLE
}

async function handleExecutorItem(item: string, callback: (data: any) => void) {
  if (item === '[DONE]') {
    callback({
      done: true,
    })
  }
  else {
    try {
      const json = JSON.parse(item)

      callback({
        done: false,
        ...json,
      })
    }
    catch (e: any) {
      // if (e.message.includes('invalid end of input')) {
      //   console.warn('Item Not Completed, continuing receiving ...', item)

      //   return
      // }

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

    const _value = value

    const arr = _value.split('\n')

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]

      if (item.startsWith('data: '))
        handleExecutorItem(item.slice(6), callback)
      // else {
      //   try {
      //     const data = JSON.parse(item)

      //     if (data.code === 1101)
      //       $handleUserLogout()

      //     if (data?.message && !data?.data)
      //       ElMessage.error(data.message)
      //   }
      //   catch (_ignored) {
      //     // console.error('error in chat', _ignored)
      //   }
      // }
    }
  }
}

async function useCompletionExecutor(body: any, callback: (data: any) => void, options: Partial<ChatCompletionDto>) {
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
      const res: ReadableStream = await endHttp.$http({
        url: 'aigc/executor',
        method: 'POST',
        data: {
          ...options,
          ...body,
        },
        params: {
          uid: userStore.value.id,
        },
        headers: {
          Accept: 'text/event-stream',
        },
        adapter: 'fetch',
        responseType: 'stream',
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

export const $completion = {
  emptyHistory() {
    return {
      id: '',
      topic: '新的聊天',
      messages: [],
      lastUpdate: -1,
      templateId: -1,
    } as IChatConversation
  },

  emptyChatItem(role: IChatRole = IChatRole.USER) {
    return {
      id: '',
      role,
      timestamp: Date.now(),
      content: [],
    } as IChatItem
  },

  emptyChatInnerItem({
    model,
    value,
    meta,
    status,
  }: IChatInnerItem = { model: QuotaModel.QUOTA_THIS_NORMAL, value: '', meta: {}, status: IChatItemStatus.AVAILABLE }) {
    return {
      model,
      value,
      status,
      meta,
    } as IChatInnerItem
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

  createCompletion(conversation: IChatConversation, curItem: IChatInnerItem) {
    let handler: ICompletionHandler = {}
    const tempMessage = reactive(this.emptyChatItem(IChatRole.ASSISTANT))
    const innerMsg = reactive(this.emptyChatInnerItem())

    tempMessage.content.push(innerMsg)

    watch(() => innerMsg.status, (status) => {
      handler.onTriggerStatus?.(status)
    })

    function complete() {
      setTimeout(() => {
        handler.onReqCompleted?.()
      }, 200)
    }

    return {
      tempMessage,
      innerMsg,
      registerHandler(_handler: ICompletionHandler = {}) {
        handler = _handler
      },
      send: async (options?: Partial<ChatCompletionDto>) => {
        const _conversation = JSON.parse(JSON.stringify(conversation))
        conversation.messages.push(tempMessage)
        innerMsg.status = IChatItemStatus.WAITING

        await sleep(2000)

        await useCompletionExecutor(
          {
            ..._conversation,
            index: 0,
            chat_id: '1',
            model: 'this-normal-turbo',
          },
          (res) => {
            if (res.error) {
              innerMsg.status = IChatItemStatus.ERROR

              if (res.frequentLimit)
                handler.onFrequentLimit?.()

              return
            }

            if (res.done) {
              innerMsg.status = IChatItemStatus.AVAILABLE
              complete()

              return
            }

            const { event, name } = res
            console.log('a', res, innerMsg.status)
            if (event === 'status_updated') {
              const mappedStatus = mapStrStatus(res.status)
              if (mappedStatus === IChatItemStatus.GENERATING && innerMsg.status !== IChatItemStatus.WAITING)
                return
              innerMsg.status = mappedStatus
              handler?.onTriggerStatus?.(mappedStatus)

              if (res.status === 'start')
                handler?.onCompletionStart?.(res.id)

              if (res.status === 'end')
                handler?.onChainEnd?.(res.id)
            }
            else if (event === 'on_tool_start') {
              const input = res.data.input.input
              handler.onToolStart?.(name, input)

              console.error('e', res)
            }
            else if (event === 'completion') {
              innerMsg.value += res.content

              handler.onCompletion?.(name, res.content)
            }
            else if (event === 'on_tool_end') {
              handler.onToolEnd?.(name, res.data.output)

              console.log('tool end', res)
            }
          },
          {
            ...(options || {}),
            temperature: curItem.meta.temperature,
          },
        )
      },
    }
  },
}
