<script setup lang="ts">
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import type { ChatCompletion } from '~/composables/chat'
import { useChatCompletion } from '~/composables/chat'

const messages = ref<ChatCompletion>({
  id: 'IW3DiVM6Wl8rBdHM2_mHq',
  topic: '新的聊天',
  memoryPrompt:
    '在本次对话中，我们讨论了在C语言中创建链表的操作。我们提供了多个示例代码，涵盖了使用`malloc`函数动态分配内存、使用静态分配方式创建链表节点以及尽量减少使用指针的方法。我们还讨论了如何使用`scanf`函数从用户输入中获取节点的数据，并通过遍历链表将数据打印出来。希望这些示例代码和讨论对您有所帮助。',
  messages: [],
  stat: {
    tokenCount: 0,
    wordCount: 0,
    charCount: 14744,
  },
  lastUpdate: 1705048066496,
  lastSummarizeIndex: 38,
  mask: {
    id: 'Aadv3pqdc1D_i-SiYx5Wq',
    avatar: 'gpt-bot',
    name: '新的聊天',
    context: [],
    syncGlobalConfig: true,
    modelConfig: {
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      top_p: 1,
      max_tokens: 4000,
      presence_penalty: 0,
      frequency_penalty: 0,
      sendMemory: true,
      historyMessageCount: 4,
      compressMessageLengthThreshold: 1000,
      enableInjectSystemPrompts: true,
      template: '{{input}}',
    },
    lang: 'cn',
    builtin: false,
    createdAt: 1705043191052,
  },
})

const status = ref(Status.AVAILABLE)

async function handleSend(query: string, callback: Function) {
  const _date = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`
  }

  // now date: YYYY/M/D HH:mm:ss
  const date = new Date()
  const format = _date(date)

  messages.value.messages.push({
    date: format,
    role: 'user',
    content: query,
    streaming: false,
  })

  const obj = reactive({
    date: format,
    role: 'assistant',
    content: '',
    generating: true,
    streaming: true,
  })

  messages.value.messages.push(obj)

  // let ind = 0
  useChatCompletion(messages.value, (res) => {
    if (res.error) {
      obj.streaming = false
      callback(Status.ERROR)

      return
    }

    if (res.done) {
      obj.streaming = false
      callback(Status.AVAILABLE)

      return
    }

    if (!res.choices?.length)
      return (obj.generating = false)

    const text = res!.choices![0]!.delta
    if (!text.content)
      return

    obj.content += text!.content
    // ind += 1
    // setTimeout(() => {
    // }, ind * 10)
  })
}

function handleClear() {
  messages.value.messages.length = 0
}
</script>

<template>
  <div>
    <ThChat :status="status" :messages="messages" />
    <ThInput
      v-model:status="status"
      :shrink="!!messages.messages.length"
      @clear="handleClear"
      @send="handleSend"
    />
    <div class="a">
      <DarkToggle />
    </div>

    <div class="copyright">
      ThisAI. 可能会犯错，生成的内容仅供参考。
      <span class="business">考拓智能科技有限公司</span>
    </div>
  </div>
</template>

<style>
.copyright {
  position: absolute;

  left: 50%;

  bottom: 0;

  opacity: 0.5;
  font-size: 14px;
  transform: translateX(-50%);
}

.a {
  position: absolute;

  top: 0;
  left: 0;
}
</style>
