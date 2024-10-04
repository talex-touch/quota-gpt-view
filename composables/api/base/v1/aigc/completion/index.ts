import { endHttp } from '~/composables/api/axios'
import { type IChatBody, type IChatConversation, type IChatInnerItem, type IChatItem, IChatItemStatus, IChatRole, type ICompletionHandler, type IInnerItemMeta, type IInnerItemType, PersistStatus, QuotaModel } from '~/composables/api/base/v1/aigc/completion-types'

function mapStrStatus(str: string) {
  if (str === 'progress')
    return IChatItemStatus.GENERATING
  else if (str === 'start')
    return IChatItemStatus.WAITING
  else if (str === 'end')
    return IChatItemStatus.AVAILABLE
  else if (str === 'calling')
    return IChatItemStatus.TOOL_CALLING
  else if (str === 'result')
    return IChatItemStatus.TOOL_RESULT
  else if (str === 'cancelled')
    return IChatItemStatus.CANCELLED
  else if (str === 'failed')
    return IChatItemStatus.ERROR

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

    // const regex = /id:\s*(\d+)\ndata:\s*(\{.*?\})(?:\n|$)/gs
    // const matches = _value.matchAll(regex)
    // if (!match) {
    //   console.error('Invalid format', _value)
    //   continue
    // }

    // for (const match of matches) {
    //   const [, id, dataValue] = match

    //   console.log('---', match, dataValue)
    // }

    const arr = _value.split('\n')

    // console.log('a', arr, _value)

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]

      if (item.startsWith('data: ')) { handleExecutorItem(item.slice(6), callback) }
      else {
        if (arr.length === 1) {
          handleExecutorItem(item, callback)

          continue
        }

        const prevItem = arr[1]

        if (!prevItem.startsWith('event: error'))
          continue

        const dataItem = arr[3]
        const v = dataItem.slice(6)

        try {
          continue
        }
        catch (_ignore) {
          callback({
            done: true,
            error: true,
            e: v,
          })
        }

        // try {
        //   const data = JSON.parse(item)

        //   if (data.code === 1101)
        //     $handleUserLogout()

        //   if (data?.message && !data?.data)
        //     ElMessage.error(data.message)
        // }
        // catch (_ignored) {
        //   console.error('error in chat', _ignored, item)

        //   callback({
        //     done: true,
        //     error: true,
        //     e: item,
        //   })
        // }
      }
    }
  }
}

function processContentEach(content: IChatInnerItem) {
  // const contents = item.content
  // const page = item.page

  // if (page >= contents.length)
  //   return

  // const content = contents[page]

  if (!content)
    throw new Error('content is empty')

  // let contentText = ''

  // content.value.forEach((_) => {
  //   if (_.type === 'markdown' || _.type === 'text')
  //     contentText += _.value
  // })

  // if (contentText) {
  //   // force ignored
  //   // item.content = content as any

  //   return contentText
  // }

  return content.value
}

function processMessageEach({ ques, ans }: { ques: IChatItem, ans: IChatItem }) {
  const quesContent = ques.content[ques.page]!
  const ansContent = ans.content[ans.page]!

  // 判断ans的状态不是 AVAILABLE 直接返回
  if (ansContent.status !== IChatItemStatus.AVAILABLE)
    return false

  if (!ansContent.value.length)
    return false

  const quesText = processContentEach(quesContent)
  const ansText = processContentEach(ansContent)

  return [quesText, ansText]
}

async function useCompletionExecutor(body: IChatBody, callback: (data: any) => void) {
  const msgList = body.messages
  const convertedMsgList: any = []

  msgList.pop()

  // 先将msgList按照2个划分为一组
  for (let i = 0; i < msgList.length - 2; i += 2) {
    const obj = {
      ques: msgList[i],
      ans: msgList[i + 1],
    }

    const res = processMessageEach(obj)

    if (!res)
      continue

    convertedMsgList.push({
      ...obj.ques,
      content: res[0],
    })

    convertedMsgList.push({
      ...obj.ans,
      content: res[1],
    })
  }

  const lastOne = msgList[msgList.length - 1]
  const lastContent = lastOne.content[lastOne.page]!

  convertedMsgList.push({
    ...lastOne,
    content: processContentEach(lastContent),
  })

  console.log('msgList', convertedMsgList)

  body.messages = convertedMsgList

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
        signal: body.signal || new AbortController().signal,
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
  initInnerMeta(type: IInnerItemType, value: string) {
    return {
      type,
      value,
    } as IInnerItemMeta
  },

  emptyChatInnerItem({
    model,
    value,
    meta,
    status,
    timestamp,
  }: IChatInnerItem = { model: QuotaModel.QUOTA_THIS_NORMAL, value: [], meta: {}, timestamp: Date.now(), status: IChatItemStatus.AVAILABLE }) {
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
          status: IChatItemStatus.AVAILABLE,
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

    console.log('cc', curItem, index)

    if (isAdd) {
      // 获得某一条消息的指定 innerItem
      const curInnerItem = curItem.content[index]
      innerMsg.meta = (curInnerItem || curItem.content[0])!.meta

      while (tempMessage.content.length < index - 1)
        tempMessage.content.push(null)

      tempMessage.content.push(innerMsg)

      conversation.messages.push(tempMessage)
    }

    watch(() => innerMsg.status, (status) => {
      handler.onTriggerStatus?.(status)
    })

    /**
     * 当全部解析结束之后，将所有没有返回的工具链设定为超时
     */
    function handleEndToolParser() {
      // innerMsg.value.push({
      //   type: 'tool',
      //   value: data,
      //   data: '',
      //   name,
      //   extra: {
      //     end: true,
      //   },
      // })
      console.log('parser', innerMsg)

      innerMsg.value.forEach((item) => {
        if (item.type !== 'tool')
          return

        // console.log('aaa', item)

        if (!item.extra?.end) {
          item.extra = {
            ...item.extra,
            error: {
              type: 'timeout',
              timestamp: Date.now(),
            },
            end: Date.now(),
          }
        }
      })
    }

    function complete() {
      handleEndToolParser()

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
      async getTitle() {
        const titleOptions = reactive({
          value: '',
          status: IChatItemStatus.AVAILABLE,
        })

        await useCompletionExecutor(
          {
            temperature: 0,
            templateId: -1,
            generateTitle: true,
            messages: JSON.parse(JSON.stringify(conversation.messages)),
            index: index === -1 ? 0 : index,
            chat_id: conversation.id,
            model: QuotaModel.QUOTA_THIS_TITLE,
          },
          (res) => {
            if (res.error) {
              titleOptions.status = IChatItemStatus.ERROR

              if (res.frequentLimit)
                handler.onFrequentLimit?.()

              return
            }

            if (res.done) {
              titleOptions.status = IChatItemStatus.AVAILABLE

              return
            }

            const { event } = res
            if (event === 'status_updated') {
              const mappedStatus = mapStrStatus(res.status)
              if (mappedStatus === IChatItemStatus.GENERATING && innerMsg.status !== IChatItemStatus.WAITING)
                return
              titleOptions.status = mappedStatus
            }
            else if (event === 'completion') {
              if (res.completed)
                return
              titleOptions.value += res.content

              conversation.topic = titleOptions.value

              // 截取前12位
              conversation.topic = conversation.topic.slice(0, 12)
            }
          },
        )

        return titleOptions
      },
      send: (options?: Partial<ChatCompletionDto>): AbortController => {
        innerMsg.status = IChatItemStatus.WAITING

        const signal = new AbortController()

        // signal.signal.addEventListener('abort', () => {
        //   innerMsg.status = IChatItemStatus.CANCELLED
        // })

        useCompletionExecutor(
          {
            ...options || {},
            temperature: innerMsg.meta.temperature || 0,
            templateId: -1,
            messages: JSON.parse(JSON.stringify(conversation.messages)),
            index: index === -1 ? 0 : index,
            chat_id: conversation.id,
            model: innerMsg.model,
            signal: signal.signal,
          },
          (res) => {
            if (res?.code === 401) {
              res.error = true
              res.e = res.message
            }

            if (res.error) {
              console.log('res', res)

              innerMsg.status = IChatItemStatus.ERROR

              if (res.frequentLimit)
                handler.onFrequentLimit?.()

              if (signal.signal.aborted)
                innerMsg.status = IChatItemStatus.CANCELLED

              innerMsg.value.push({
                type: 'error',
                value: res.e.message || res.e,
              })

              complete()

              return
            }

            if (res.done) {
              innerMsg.status = IChatItemStatus.AVAILABLE
              complete()

              return
            }

            const { event, name, data } = res
            // console.log('RES', res, res.event)
            if (event === 'status_updated') {
              const mappedStatus = mapStrStatus(res.status)
              // if (mappedStatus === IChatItemStatus.GENERATING && innerMsg.status !== IChatItemStatus.WAITING)
              //   return
              innerMsg.status = mappedStatus
              handler?.onTriggerStatus?.(mappedStatus)

              if (res.status === 'start')
                handler?.onCompletionStart?.(res.id)

              if (res.status === 'end')
                handler?.onChainEnd?.(res.id)

              if (mappedStatus === IChatItemStatus.TOOL_CALLING) {
                handler.onToolStart?.(name, data)
                console.log('tool calling', res)

                innerMsg.value.push({
                  type: 'tool',
                  value: '',
                  data,
                  name,
                  extra: {
                    start: Date.now(),
                  },
                })
              }
              else if (mappedStatus === IChatItemStatus.TOOL_RESULT) {
                handler.onToolEnd?.(name, data)
                console.log('tool result', res)

                // 从最后一个往前找 name 相同的 meta
                for (let i = innerMsg.value.length - 1; i >= 0; i--) {
                  const meta = innerMsg.value[i]
                  if (meta.name === name) {
                    meta.value = data
                    meta.extra = {
                      ...meta.extra,
                      end: Date.now(),
                    }
                    return
                  }
                }

                // 找不到就新增一个 (算是有bug 不过先这样)
                innerMsg.value.push({
                  type: 'tool',
                  value: data,
                  data: '',
                  name,
                  extra: {
                    end: Date.now(),
                  },
                })
              }
            }
            else if (event === 'completion') {
              const innerMeta = innerMsg.value.at(-1)

              if (innerMeta?.type === 'markdown') {
                innerMeta.value += res.content
                if (res.completed)
                  innerMeta.value = res.content
              }
              else {
                innerMsg.value.push({
                  type: 'markdown',
                  value: res.content,
                })
              }

              handler.onCompletion?.(name, res.content)
            }
            else if (event === 'suggest') {
              innerMsg.value.push({
                data: 'suggest',
                type: res.content_type as any,
                value: res.content,
              })
            }
            else if (event === 'error') {
              handler.onError?.()

              const mappedStatus = mapStrStatus(res.status)
              if (mappedStatus === IChatItemStatus.ERROR) {
                console.log('a12312', res)

                const message: string = res.message

                innerMsg.value.push({
                  type: 'error',
                  value: message,
                })

                if (message.includes('状态不可用'))
                  innerMsg.status = IChatItemStatus.BANNED
                else if (message.includes('额度已用尽'))
                  innerMsg.status = IChatItemStatus.REJECTED
                else
                  innerMsg.status = IChatItemStatus.ERROR
              }
              else {
                innerMsg.status = mappedStatus
              }
            }
          },
        )

        return signal
      },
    }
  },
}
