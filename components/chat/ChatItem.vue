<script setup lang="ts">
import dayjs from 'dayjs'
import zhLocale from 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import RoundLoading from '../loaders/RoundLoading.vue'
import TextShaving from '../other/TextShaving.vue'
import ThWickCheckBox from '../checkbox/ThWickCheckBox.vue'
import ItemModelSelector from './addon/ItemModelSelector.vue'
import { type IChatItem, IChatItemStatus, IChatRole } from '~/composables/api/base/v1/aigc/index.type.d.ts'

interface IChatItemProp {
  item: IChatItem
  ind: number
  total: number
  share: boolean
  select: number[]

  // 表指应该渲染第几个顺序 由上一级决定 （暂时统一为0）
  dictIndex: number
}

const props = defineProps<IChatItemProp>()

const emits = defineEmits<{
  (e: 'select', index: number, checked: boolean): void
  (e: 'update:dictIndex', page: number): void
}>()

const page = ref(0)
const dom = ref()

let timer: any

watch(() => props.dictIndex, () => {
  page.value = props.dictIndex
})

watch(() => page.value, () => {
  if (props.dictIndex === page.value)
    return

  emits('update:dictIndex', page.value)
})

const settingMode = reactive({
  visible: false,
  render: {
    enable: true,
    media: true,
  },
})
dayjs.locale(zhLocale)
dayjs.extend(relativeTime)

const check = ref(false)

watch(() => check.value, (val) => {
  emits('select', props.ind, val)
})

watch(() => props.select, (val) => {
  check.value = val.includes(props.ind)
})

function filterTools(item: any) {
  return tools.filter((tool) => {
    if (item.status === 2 && tool.errorHide)
      return false

    return item.role === 'user'
      ? !tool.userIgnored
      : true
  })
}

const innerItem = computed(() => props.item.content?.[page.value] || null)
const timeAgo = computed(() => dayjs(props.item.timestamp, 'YYYY/M/D HH:mm:ss').fromNow())
const isUser = computed(() => props.item.role === IChatRole.USER)

function handleGeneratingDotUpdate(rootEl: HTMLElement, cursor: HTMLElement) {
  if (props.ind !== props.total - 1)
    return

  cursor.style.opacity = '1'
  timer && clearTimeout(timer)
  timer = setTimeout(() => {
    if (innerItem.value.status === IChatItemStatus.GENERATING)
      return

    cursor.style.opacity = '0'
  }, 200)

  const textNode = getLastTextNode(rootEl)

  const tempNode = document.createTextNode('|')
  if (textNode)
    textNode.after(tempNode)
  else
    rootEl.appendChild(tempNode)

  const range = document.createRange()
  range.setStart(tempNode, 0)
  range.setEnd(tempNode, 1)
  const rect = range.getBoundingClientRect()
  const textRect = dom.value!.getBoundingClientRect()

  const top = textRect.top - rect.top
  const left = textRect.left - rect.left

  Object.assign(cursor!.style, {
    top: `${-top}px`,
    left: `${-left}px`,
  })

  tempNode.remove()
  // setTimeout(() => handleGeneratingDotUpdate(rootEl, cursor), 20)
}

watch(() => [innerItem.value?.value, innerItem.value?.status], () => {
  const rootEl = dom.value?.querySelector('.RenderContent-Inner')
  const cursor: HTMLElement = dom.value?.querySelector('.Generating-Dot')

  if (rootEl && cursor)
    setTimeout(() => handleGeneratingDotUpdate(rootEl, cursor), 0)
})

const tools = reactive([
  {
    name: '复制',
    icon: 'i-carbon-copy',
    errorHide: true,
    trigger: () => {
      if (!props.item.content || tools[0].icon !== 'i-carbon-copy')
        return

      navigator.clipboard.writeText(innerItem.value.value)

      tools[0].icon = 'i-carbon-checkmark'

      setTimeout(() => {
        tools[0].icon = 'i-carbon-copy'
      }, 1200)
    },
  },
  {
    name: '属性',
    icon: 'i-carbon-settings-adjust',
    userIgnored: true,
    errorHide: true,
    trigger: () => {
      settingMode.visible = !settingMode.visible
    },
  },
  // { name: '朗读', icon: 'i-carbon-user-speaker' },
])
</script>

<template>
  <div :class="{ check, share, user: isUser }" class="ChatItem">
    <div class="ChatItem-Select">
      <el-checkbox v-model="check" />
    </div>

    <div class="ChatItem-Avatar">
      <img src="/logo.png">
    </div>
    <div
      :class="{ error: innerItem.status === IChatItemStatus.ERROR, settingVisible: settingMode.visible }"
      class="ChatItem-Wrapper"
    >
      <div class="ChatItem-Agent">
        <!-- <template v-if="item.agent">
          <span v-for="action in item.agent.actions" :key="action" class="ChatItem-AgentList">
            <TextShaving v-if="typeof action === 'string'" :text="action" />
          </span>
        </template> -->
      </div>

      <div class="ChatItem-Content">
        <div v-if="innerItem.status === IChatItemStatus.WAITING" class="ChatItem-Generating">
          <div class="ChatItem-GeneratingWrapper">
            <RoundLoading />
          </div>
        </div>
        <div v-else ref="dom" class="ChatItem-Content-Inner">
          <span v-if="item.role === 'user'">
            <pre class="inner" v-text="innerItem.value" />
          </span>
          <span v-else-if="innerItem.status === IChatItemStatus.ERROR">
            错误 {{ item.content }}
          </span>
          <RenderContent
            v-else-if="item.content?.length" :render="settingMode.render" readonly
            :data="innerItem.value"
          />
          <!-- v-if="generating && !!item.content.length" -->
          <div v-if="!isUser" class="Generating-Dot" />
        </div>

        <div class="ChatItem-Setting">
          <ThWickCheckBox v-model="settingMode.render.enable">
            启用渲染
          </ThWickCheckBox>

          <template v-if="settingMode.render.enable">
            <ThWickCheckBox v-model="settingMode.render.media">
              渲染视频
            </ThWickCheckBox>
          </template>
        </div>
      </div>

      <div
        v-if="
          innerItem.status !== IChatItemStatus.GENERATING
            && !!item.content?.length
            && innerItem.status !== IChatItemStatus.WAITING
        " class="ChatItem-Mention"
        :class="{
          autoHide: isUser || total !== ind + 1,
        }"
      >
        <ChatAddonChatPageSelector
          v-if="!isUser && item.content.length > 1" v-model="page"
          :total-page="item.content.length"
        />

        <span class="toolbox">
          <span
            v-for="tool in filterTools(item)" :key="tool.name" class="toolbox-item"
            @click="tool.trigger"
          >
            <el-tooltip :content="tool.name">
              <i :class="tool.icon" />
            </el-tooltip>
          </span>
        </span>

        <ItemModelSelector v-model="innerItem.model" />

        <span class="info">
          <span class="date">{{ timeAgo }}</span>
          &nbsp;
          <span v-if="innerItem.value?.length > 30" class="length">{{ innerItem.value.length }} 字</span>
          <!-- &nbsp;
          <span class="costs">{{ item.content.length * 2.25 }} tokens</span> -->
        </span>
      </div>

      <!-- <div tag="div" class="ChatItem-Reference">
        <ChatAttachment :agent="item.agent" />
      </div> -->
    </div>
  </div>
</template>

<style lang="scss">
div.ChatItem-Wrapper.error div.ChatItem-Content-Inner {
  box-shadow: var(--el-box-shadow-light);
  backdrop-filter: unset;
  background-color: var(--el-color-danger);
}

.Generating-Dot {
  position: absolute;

  top: 0;
  left: 0;

  width: 6px;
  height: 6px;

  opacity: 0;
  border-radius: 50%;
  pointer-events: none;
  background-color: var(--el-text-color-primary);
}

.ChatItem.share {
  div.ChatItem-Mention {
    opacity: 0;
  }

  .ChatItem-Select {
    opacity: 1;
  }

  margin-left: 1rem;

  left: 10%;
  width: 80%;

  &.check {
    padding: 0.5rem;

    background: var(--el-bg-color);
    border-radius: 16px;
  }
}

.ChatItem-Setting {
  .settingVisible & {
    transform: translateY(100%) scale(1);
  }

  z-index: 10;
  position: absolute;
  padding: 0.5rem 1rem;

  left: 0;
  bottom: -30px;

  width: 125px;
  height: 70px;
  // display: flex;

  transition: 0.25s;
  border-radius: 18px;
  transform-origin: left top;
  box-shadow: var(--el-box-shadow);
  transform: translateY(100%) scale(0);
  background-color: var(--el-bg-color);
}

.ChatItem-Select {
  position: absolute;

  top: 0.5rem;
  left: -1.5rem;

  opacity: 0;
  transition: 0.25s;
}

.ChatItem-Generating {
  .ChatItem-GeneratingWrapper {
    position: absolute;

    height: 100%;

    opacity: 0.25;
    background-color: rgba(255, 255, 255, 0.5);
  }

  height: 28px;

  position: relative;
  top: 20px;
  left: 10px;
}

@keyframes join {
  from {
    transform: translateY(20%) scale(0.75);
  }

  to {
    transform: translateY(0) scale(1);
  }
}

.ChatItem-Reference {
  padding-left: 0.5rem;
}

.ChatItem-Wrapper {
  .ChatItem-AgentList {
    margin-bottom: 10px;
  }

  .ChatItem-Agent {
    position: relative;
    padding-left: 1rem;

    top: 0;

    opacity: 1;
    transition: 0.25s;
  }

  .ChatItem-Content-Inner {
    pre {
      margin: 0;
      padding: 0;

      max-width: 100%;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;

      color: var(--el-text-color-primary);
      border: none #000;
      background-color: #0000;

      font-variant-ligatures: no-common-ligatures;
      font-family: 'Helvetica Neue', 'Luxi Sans', 'DejaVu Sans',
        'Hiragino Sans GB', 'Microsoft Yahei', sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji',
        'EmojiSymbols';
    }

    .user & {
      padding: 0.5rem 1rem;

      border-radius: 16px 8px 16px 16px;
      box-shadow: var(--el-box-shadow);
      // background-color: var(--el-bg-color);
      background-color: var(--wallpaper-color-lighter);
      backdrop-filter: blur(18px) saturate(180%);
    }

    position: relative;
    margin-top: 12px;

    top: 0;
    right: 0;

    width: max-content;
    max-width: 100%;
    min-width: 48px;
    height: fit-content;

    transition: 0.5s;
  }

  &:hover {
    .ChatItem-Mention {
      opacity: 1 !important;
      .toolbox,
      .info {
        opacity: 0.5 !important;
      }

      .ItemModelSelector {
        opacity: 1 !important;
      }
    }
  }

  .ChatItem-Mention {
    &.autoHide {
      .ItemModelSelector,
      .toolbox,
      .info {
        opacity: 0;
      }
    }

    .user & {
      opacity: 0;
    }

    .toolbox {
      &-item {
        &:hover {
          border-radius: 8px;
          background-color: var(--el-bg-color-page);
        }
        padding: 0.25rem;

        transition: 0.25s;
      }
      i {
        display: block;
      }

      display: flex;

      gap: 0.5rem;
      align-items: center;

      height: 12px;
      width: fit-content;

      flex: 0;
      opacity: 0.5;
      cursor: pointer;
      transition: 0.25s;
    }

    .info {
      opacity: 0.5;
      transition: 0.25s;
    }

    .user & {
      flex-direction: row-reverse;

      left: unset;
      float: right;

      border-radius: 12px;
      box-shadow: var(--el-box-shadow);
      background-color: var(--el-bg-color-page);
    }

    z-index: 1;
    position: relative;
    margin: 0.25rem 0;
    display: flex;

    gap: 0.5rem;
    align-items: center;
    justify-content: flex-start;

    // height: 32px;
    width: max-content;

    left: 0;
    bottom: 0;

    font-size: 14px;
    box-sizing: border-box;
    transition: 0.25s;
  }

  position: relative;

  width: max-content;
  max-width: 70%;
  min-width: 48px;
  height: max-content;

  .mobile & {
    max-width: 80%;
  }
}

.ChatItem {
  &.user {
    z-index: 2;

    .ChatItem-Avatar {
      display: none;
    }

    justify-content: flex-end;
  }

  .ChatItem-Avatar {
    width: 48px;
  }

  &-Content {
    position: relative;
    display: flex;

    .user & {
      position: relative;

      justify-content: flex-end;
    }
  }

  z-index: 3;
  position: relative;
  display: flex;
  margin: 1rem 0;

  left: 0;

  width: 100%;
  height: max-content;

  gap: 0.5rem;

  transition: 0.25s;
  box-sizing: border-box;
  animation: join 0.35s ease-in-out;

  // background-color: #ff000010;
}
</style>
