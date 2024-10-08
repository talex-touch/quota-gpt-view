<script name="ThInput" setup lang="ts">
import { encode } from 'gpt-tokenizer'
import ThInputPlus from './ThInputPlus.vue'
import type { InputPlusProperty } from './input'
import InputHeaderFiles from './addon/InputHeaderFiles.vue'
import { IChatItemStatus, type IInnerItemMeta, type IInnerItemType } from '~/composables/api/base/v1/aigc/completion-types'
import { $endApi } from '~/composables/api/base'
import { globalOptions } from '~/constants'

const props = defineProps<{
  status: IChatItemStatus
  hide: boolean
  templateEnable: boolean
}>()
const emits = defineEmits<{
  (name: 'template', data: any): void
  (name: 'send', data: IInnerItemMeta[], meta: InputPlusProperty): void
}>()

const inputProperty = ref<InputPlusProperty>({
  internet: false,
  temperature: 0,
})

const input = ref<{
  text: string
  files: IInnerItemMeta[]
}>({
  text: '',
  files: [],
})
// const textInput = computed(() => input.value.filter((item: IInnerItemMeta) => item.type === 'text').map(item => item.value).join(''))
const template = ref<any>({})
const nonPlusMode = computed(() => props.templateEnable && !template.value?.title && (input.value.text.startsWith('/') || input.value.text.startsWith('@')))

const inputHistories = useLocalStorage<string[]>('inputHistories', [])
const inputHistoryIndex = ref(inputHistories.value.length - 1)
const showSend = computed(() => input.value.text?.length || input.value.files?.length)

// function appendValue(value: string) {
//   // 倒着找最后一个文本
//   const lastText = [ ...input.value ].filter(item => item.type === 'text').pop()

//   if (lastText) {
//     lastText.value += value
//   }
//   else {
//     input.value.push({
//       type: 'text',
//       value,
//     })
//   }
// }

function handleSend(event: Event) {
  if (!showSend.value)
    return

  if (props.status !== IChatItemStatus.AVAILABLE && props.status !== IChatItemStatus.CANCELLED)
    return

  if (input.value.text.startsWith('@'))
    return

  event.preventDefault()

  const el = document.getElementById('main-input')!

  el!.style.height = ''

  inputHistories.value.push(input.value.text)
  inputHistories.value = inputHistories.value.slice(-15)

  inputHistoryIndex.value = inputHistories.value.length - 1

  // 将文件列表转换 （去除多余的内容）
  const files: IInnerItemMeta[] = input.value.files.map(item => ({
    ...item,
    extra: undefined,
  }))

  const textMeta: IInnerItemMeta = {
    type: 'text',
    value: input.value.text,
  }

  const inputMeta: IInnerItemMeta[] = [
    textMeta,
    ...files,
  ].filter(item => item.value)

  emits('send', inputMeta, inputProperty.value, /* {
    template: template.value?.id || -1,
  } */)

  input.value = {
    text: '',
    files: [],
  }
  template.value = {}
}

function handleInputKeydown(event: KeyboardEvent) {
  if (!template.value?.title && input.value.text.startsWith('@'))
    return

  if (event.key === 'Backspace') {
    if (template.value && !input.value.text)
      template.value = {}
    if (!input.value.text && input.value.files.length) {
      if (event.ctrlKey)
        input.value.files = []
      else input.value.files.pop()
    }
  }

  if (event.key === 'Enter') {
    event.preventDefault()

    if (event.shiftKey) {
      event.stopPropagation()

      if (input.value.text.endsWith('\n'))
        input.value.text += ' '
      else
        input.value.text += '\n'
    }
    else { handleSend(event) }

    return
  }

  if (inputHistories.value.length < 1)
    return

  const isLastOne = inputHistoryIndex.value === inputHistories.value.length - 1

  const { key, ctrlKey } = event
  if (ctrlKey && key === 'ArrowUp') {
    if (inputHistoryIndex.value !== 0 && isLastOne)
      input.value.text && inputHistories.value.push(input.value.text)

    if (!isLastOne)
      inputHistoryIndex.value -= 1
    if (inputHistoryIndex.value < 0)
      inputHistoryIndex.value = 0
  }
  else if (ctrlKey && key === 'ArrowDown') {
    if (isLastOne)
      return (input.value = { files: [], text: '' })

    inputHistoryIndex.value = inputHistoryIndex.value + 1

    if (inputHistoryIndex.value > inputHistories.value.length - 1)
      inputHistoryIndex.value = inputHistories.value.length - 1
  }
  else {
    return
  }

  input.value = { files: [], text: inputHistories.value[inputHistoryIndex.value] }
}

function triggerUpdateInput() {
  const el = document.getElementById('main-input')!

  el!.style.height = ''
  el!.style.height = `${el.scrollHeight}px`
}

const len = ref(0)

watch(
  () => input.value.text,
  (_, oldVal) => {
    nextTick(() => {
      setTimeout(triggerUpdateInput)

      len.value = encode(input.value.text).length

      const limit = userStore.value.isLogin ? 8192 : 256
      if (len.value > limit)
        input.value.text = oldVal!
    })
  },
  { immediate: true },
)

onMounted(() => {
  const el = document.getElementById('main-input')

  setTimeout(() => {
    el?.focus()
  })
})

function handleTemplateSelect(data: any) {
  template.value = data

  input.value.text = ''
  input.value.files = []
}

watch(() => template.value, (val) => {
  emits('template', val)
})

const tokenLimit = computed(() => userStore.value.isLogin ? 8192 : 256)

function handlePaste(e: ClipboardEvent) {
  if (!e.clipboardData)
    return

  e.preventDefault()

  const { items } = e.clipboardData

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (item.type.startsWith('text')) {
      item.getAsString((data) => {
        input.value.text += data
      })
    }
    else if (item.type.startsWith('image')) {
      const file = item.getAsFile()
      if (!file)
        continue

      const obj = reactive<any>({
        sync: false,
        width: 0,
        height: 0,
        syncing: false,
        error: '',
        url: '',
        img: null,
        file,
      })

      const meta = reactive({
        type: 'image',
        value: '',
        extra: obj,
      }) as any

      input.value.files.push(meta)

      const reader = new FileReader()

      reader.onload = function (e) {
        const dataUrl = e.target?.result as string

        const img = new Image()

        img.onload = function () {
          obj.width = img.width
          obj.height = img.height
        }

        obj.img = img
        obj.url = dataUrl

        // 多余10M的图片不允许传
        if (file.size > 10 * 1024 * 1024) {
          obj.error = '文件太大，无法上传'

          return
        }

        setTimeout(async () => {
          obj.syncing = true

          const res = await $endApi.v1.common.upload(file)

          obj.syncing = false

          if (res.code === 200) {
            let endsUrl = globalOptions.getEndsUrl()

            // 去除endsUrl的最后一个/
            if (endsUrl.endsWith('/'))
              endsUrl = endsUrl.slice(0, -1)

            const url = new URL(`${endsUrl}${res.data.filename}`)

            obj.url = meta.value = url.href
            obj.sync = true
          }
          else {
            obj.error = res.message
          }
        })
      }

      reader.readAsDataURL(file)
    }
    else {
      console.warn('unhandled clipboard data type:', item.type)

      ElMessage({
        message: '暂时不支持文件分析',
        type: 'warning',
        plain: true,
        grouping: true,
        duration: 2000,
        showClose: true,
      })
    }
    // else if (item.type.startsWith('image')) {
    //   const blob= item.getAsFile()
    // }
  }

  // e.preventDefault()
}

function handleDeleteFile(index: number) {
  input.value.files.splice(index, 1)
}
</script>

<template>
  <!-- error: status === Status.ERROR, -->
  <div
    :class="{
      disabled: hide,
      collapse: nonPlusMode,
      showSend,
      generating: status === 2,

    }"
    class="ThInput" @paste="handlePaste" @keydown.enter="handleSend"
  >
    <div :class="{ show: tokenLimit - len <= tokenLimit * 0.25 }" class="ThInput-Float">
      <div class="ThInput-Float-End">
        即将达到内容框极限 <span class="tag">{{ len }}/
          {{ tokenLimit }}
        </span>
      </div>
    </div>

    <InputAddonThInputAt
      v-if="templateEnable"
      :input="input.text" :show="!template?.title && input.text.startsWith('@')"
      @select="handleTemplateSelect"
    />

    <ThInputPlus v-if="!template?.title" v-model="inputProperty" />

    <div flex class="ThInput-Input">
      <div v-if="template.content || input.files?.length" class="ThInput-InputHeader">
        <el-scrollbar>
          <InputHeaderFiles :files="input.files" @delete="handleDeleteFile" />
          <div class="ThInput-InputHeader-Main">
            {{ template.content }}
          </div>
        </el-scrollbar>
      </div>

      <div flex items-center class="ThInput-InputMain">
        <template v-if="template?.title">
          <span flex class="template-tag">@{{ template.title }}</span>
        </template>
        <textarea
          id="main-input" v-model="input.text" autofocus
          autocomplete="off" placeholder="Shift + Enter换行" @keydown="handleInputKeydown"
        />
      </div>
    </div>

    <div class="ThInput-Send" @click="handleSend">
      <div i-carbon:send-alt />
      <span v-if="status === 2" mr-4 text-lg text-black font-bold op-75>生成中</span>
    </div>

    <div class="ThInput-StatusBar" />
  </div>
</template>

<style lang="scss" scoped>
.template-tag {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;

  width: max-content;

  opacity: 0.75;
  flex-shrink: 0;
  font-size: 14px;
  border-radius: 8px;
  align-self: flex-end;
  background-color: var(--theme-color);
}

.ThInput-Float {
  span.tag {
    // z-index: -1;
    // position: relative;
    // padding: 0.25rem 0.5rem;

    // top: 0;
    // left: 0;

    // font-size: 14px;

    // border-radius: 8px;
    // box-shadow: var(--el-box-shadow);
    // background: var(--el-bg-color);
    margin: 0 4px;

    opacity: 0.75;
    font-weight: 600;
    color: var(--el-color-danger);
  }

  &::before {
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.25;
    filter: blur(10px) brightness(120%);
    background: var(--el-bg-color-page);
  }

  & > div {
    display: flex;

    gap: 0.25rem;

    transform: scale(0.85);
  }

  z-index: -1;
  position: absolute;
  // padding: 0 1rem;
  display: flex;

  // gap: 0.5rem;
  align-items: center;
  justify-content: space-between;

  top: -2.5rem;
  left: 50%;

  height: 40px;

  border-radius: 14px;
  transition: 0.25s;

  opacity: 0;
  filter: blur(10px) drop-shadow(0 0 10px var(--el-bg-color-page));
  pointer-events: none;
  transform: translateX(-50%);
  text-shadow: 0 0 10px var(--el-bg-color);
  // box-shadow: var(--el-box-shadow);
  // backdrop-filter: blur(18px);
  // background: var(--el-bg-color-page);
  &.show {
    opacity: 1;
    filter: blur(0) drop-shadow(0 0 5px var(--el-bg-color-page));
  }
}

.ThInput {
  &.collapse,
  &.generating {
    .ThInput-Plus {
      display: none;
    }

    .ThInput-Float {
      opacity: 0;
    }
  }

  &.disabled {
    .ThInput-Float,
    .ThInput-Input,
    .ThInput-Send,
    .ThInput-Plus {
      opacity: 0;
    }

    .ThInput-Float {
      transform: translateY(100%) scale(0);
    }

    width: 0 !important;

    opacity: 0;
    pointer-events: none;

    transition:
      opacity 0.125s 0.375s,
      width 0.5s;
  }

  &.error {
    padding: 0;
  }

  > span {
    position: absolute;

    top: 50%;
    left: 50%;

    width: max-content;

    transform: translate(-50%, -50%);
  }

  z-index: 3;
  position: absolute;
  padding: 0.5rem 0.75rem;
  display: flex;

  gap: 0.5rem;
  align-items: flex-end;

  left: 50%;
  bottom: 2.5rem;

  width: min(70%, 1080px);
  min-height: 50px;

  &.generating {
    width: 20%;
    height: 50px;

    transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  box-sizing: border-box;
  border-radius: 16px;
  transform: translateX(-50%);
  box-shadow: var(--el-box-shadow);
  // background-color: var(--el-bg-color);
  backdrop-filter: blur(18px) saturate(180%);
  background-color: var(--el-mask-color-extra-light);
  transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);

  // transition:
  //   opacity 0.25s,
  //   width 0.75s;
}

.ThInput-Input {
  .error &,
  .generating & {
    opacity: 0;

    pointer-events: none;
  }

  textarea {
    &:focus-visible {
      outline: none;
      border: none;
    }
    &::placeholder {
      color: var(--el-text-color-regular);
    }

    position: relative;

    top: 0;

    width: calc(100% - 20px - 1.5rem);
    max-height: 330px;
    height: 32px;
    line-height: 32px;
    min-height: 32px;
    overflow: visible;

    resize: none;
    box-sizing: border-box;
    // transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    background-color: transparent;
  }

  .ThInput-InputHeader {
    :deep(.el-scrollbar__bar.is-vertical) {
      width: 3px;
    }
    .ThInput-InputHeader-Main {
      &::before {
        z-index: -1;
        content: '';
        position: absolute;

        top: 0;
        left: 0;

        width: 100%;
        height: 100%;

        opacity: 0.35;
        border-radius: 12px 12px 8px 8px;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color);
      }
      position: relative;
      padding-right: 0.5rem;

      max-height: 100px;
    }
    position: relative;
    padding: 0.5rem 0.5rem;

    width: 100%;

    // overflow: hidden;
    // border-radius: 12px 12px 0 0;
  }

  .ThInput-InputMain {
    width: calc(100% - 40px);
  }
  position: relative;
  z-index: 10;
  flex: 1;
  flex-direction: column;

  align-items: flex-start;

  overflow: hidden;
}

.ThInput-Send {
  .error & {
    div {
      opacity: 0;
    }

    transform: scale(1);

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
    border-radius: 16px;
    background: var(--el-color-danger);
    box-shadow: none;
    box-shadow: 0 0 8px 2px var(--el-color-danger);
  }

  &::before {
    z-index: -1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0;
    border-radius: 16px;
    animation: animate 1.5s linear infinite;
    transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    background: linear-gradient(135deg, #14ffe9, #ffeb3b, #ff00e0);
  }

  &::after {
    z-index: -2;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0;
    border-radius: 16px;
    transform: scale(1.025);
    animation: animate 1.5s linear infinite;
    transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    background: linear-gradient(135deg, #14ffe9, #ffeb3b, #ff00e0);
  }

  .showSend & {
    transform: scale(1);
  }

  .generating & {
    &::before {
      opacity: 0.75;
    }

    &::after {
      opacity: 0.5;
    }

    div {
      opacity: 0;
    }

    transform: scale(1);

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
    border-radius: 16px;
    background: transparent;
  }

  &:hover {
    background-color: var(--el-color-primary);
    box-shadow: 0 0 2px 4px var(--el-color-primary-light-5);
  }

  &:active {
    transform: scale(0.95);
  }
  z-index: 12;
  position: absolute;
  display: flex;

  color: #fff;
  font-size: 1.25rem;
  align-items: center;
  justify-content: center;

  bottom: 10px;
  right: 0.75rem;

  width: 30px;
  height: 30px;

  font-size: 16px;

  cursor: pointer;
  transition:
    transform 0.5s,
    border-radius 0.25s,
    left 0.25s,
    width 0.25s;
  transform: scale(0);
  border-radius: 16px;
  background-color: var(--el-color-primary-light-3);
  box-shadow: 0 0 2px 4px var(--el-color-primary-light-7);
}

@keyframes animate {
  0% {
    filter: blur(10px) hue-rotate(0deg);
  }

  50% {
    filter: blur(20px) hue-rotate(180deg);
  }

  100% {
    filter: blur(10px) hue-rotate(360deg);
  }
}

.mobile .ThInput {
  bottom: 3rem;

  width: 90%;
}
</style>
