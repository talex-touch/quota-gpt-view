import { endHttp } from '~/composables/api/axios'
import { type IChatBody, type IChatConversation, type IChatInnerItem, type IChatItem, IChatItemStatus, IChatRole, type ICompletionHandler, PersistStatus, QuotaModel } from '~/composables/api/base/v1/aigc/completion-types'

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

let lastReceive = ''
async function handleExecutorItem(item: string, callback: (data: any) => void) {
  if (item === '[DONE]') {
    callback({
      done: true,
    })
  }
  else {
    try {
      let _item = item

      if (lastReceive) {
        _item = lastReceive + item
        lastReceive = ''
      }

      const json = JSON.parse(_item)

      callback({
        done: false,
        ...json,
      })
    }
    catch (e: any) {
      if (e.message.includes('in JSON') || e instanceof SyntaxError) {
        lastReceive = item

        console.warn('Item Not Completed, continuing receiving ...', item)

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

async function useCompletionExecutor(body: IChatBody, callback: (data: any) => void, options: Partial<ChatCompletionDto>) {
  body.messages.pop()

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
  randomUUID(type: 'Chat' | 'Item') {
    // 获取最后的时间戳6位
    const last6 = Date.now().toString().slice(-6)

    return `${type}-${randomStr(6)}-${last6}-${randomStr(6)}`
  },

  emptyHistory() {
    return {
      id: this.randomUUID('Chat'),
      topic: '新的聊天',
      messages: [],
      lastUpdate: Date.now(),
      templateId: -1,
      sync: PersistStatus.SUCCESS,
    } as IChatConversation
  },

  emptyChatItem(role: IChatRole = IChatRole.USER) {
    return {
      id: this.randomUUID('Item'),
      role,
      page: 0,
      content: [],
    } as IChatItem
  },

  emptyChatInnerItem({
    model,
    value,
    meta,
    status,
    timestamp,
  }: IChatInnerItem = { model: QuotaModel.QUOTA_THIS_NORMAL, value: '', meta: {}, timestamp: Date.now(), status: IChatItemStatus.AVAILABLE }) {
    return {
      model,
      value,
      status,
      meta,
      timestamp,
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

  createCompletion(conversation: IChatConversation, curItem: IChatItem, index: number) {
    const itemIndex = conversation.messages.findIndex(item => item.id === curItem.id)

    if (itemIndex === -1)
      throw new Error('item not found')

    // 因为传入的curItem一定是（规范）role:User 如果User是最后一个 那么就是新增
    // 还有一种情况 用户重新生成最后一个 所以还要判断messages是不是odd
    const isAdd = itemIndex === conversation.messages.length - 1 && conversation.messages.length % 2 === 1

    let handler: ICompletionHandler = {}
    const tempMessage = reactive(isAdd ? this.emptyChatItem(IChatRole.ASSISTANT) : conversation.messages[itemIndex])
    const innerMsg = reactive(isAdd ? this.emptyChatInnerItem() : curItem.content[index]!)

    if (isAdd) {
      innerMsg.meta = curItem.content[0]!.meta

      while (tempMessage.content.length < index - 1)
        tempMessage.content.push(null)

      tempMessage.content.push(innerMsg)

      conversation.messages.push(tempMessage)
    }

    // 获得某一条消息的指定 innerItem
    const curInnerItem = curItem.content[index]

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
        innerMsg.status = IChatItemStatus.WAITING

        await useCompletionExecutor(
          {
            temperature: innerMsg.meta.temperature || 0,
            templateId: -1,
            messages: JSON.parse(JSON.stringify(conversation.messages)),
            index: index === -1 ? 0 : index,
            chat_id: conversation.id,
            model: QuotaModel.QUOTA_THIS_NORMAL_TURBO, // TODO
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
            temperature: curInnerItem?.meta?.temperature || 0,
          },
        )
      },
    }
  },
}
