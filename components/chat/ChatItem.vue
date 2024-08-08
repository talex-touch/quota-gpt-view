<script setup lang="ts">
import dayjs from 'dayjs'
import zhLocale from 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import RoundLoading from '../loaders/RoundLoading.vue'
import TextShaving from '../other/TextShaving.vue'
import ThWickCheckBox from '../checkbox/ThWickCheckBox.vue'

const props = defineProps<{
  item: any
  ind: number
  total: number
  share: boolean
  select: number[]
}>()

const emits = defineEmits<{
  (e: 'select', index: number, checked: boolean): void
}>()

const dom = ref()

let timer: any

const completed = ref(true)

function handleGeneratingDotUpdate(rootEl: HTMLElement, cursor: HTMLElement) {
  if (props.ind !== props.total - 1)
    return

  completed.value = false
  cursor.style.opacity = '1'
  timer && clearTimeout(timer)
  timer = setTimeout(() => {
    if (props.item.generating)
      return

    cursor.style.opacity = '0'
    completed.value = true
  }, 500)

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

watch(() => props.item?.content, () => {
  const rootEl = dom.value?.querySelector('.RenderContent-Inner')
  const cursor: HTMLElement = dom.value.querySelector('.Generating-Dot')!

  if (rootEl && cursor)
    setTimeout(() => handleGeneratingDotUpdate(rootEl, cursor), 0)
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

const tools = reactive([
  {
    name: '复制',
    icon: 'i-carbon-copy',
    trigger: () => {
      if (!props.item.content || tools[0].icon !== 'i-carbon-copy')
        return

      navigator.clipboard.writeText(props.item.content)

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
    trigger: () => {
      settingMode.visible = !settingMode.visible
    },
  },
  // { name: '朗读', icon: 'i-carbon-user-speaker' },
  { name: '重新生成', userIgnored: true, lastShow: true, icon: 'i-carbon-restart' },
])

const check = ref(false)
const timeAgo = computed(() => dayjs(props.item.date, 'YYYY/M/D HH:mm:ss').fromNow())

watch(() => check.value, (val) => {
  emits('select', props.ind, val)
})

watch(() => props.select, (val) => {
  check.value = val.includes(props.ind)
})

function filterTools(item: any, total: number, ind: number) {
  return tools.filter((tool) => {
    return item.role === 'user'
      ? !tool.userIgnored
      : tool.lastShow
        ? total === ind + 1
        : true
  })
}
</script>

<template>
  <div :class="{ check, share, user: item.role === 'user' }" class="ChatItem">
    <div class="ChatItem-Select">
      <el-checkbox v-model="check" />
    </div>

    <div class="ChatItem-Avatar">
      <img src="/logo.png">
    </div>
    <div :class="{ agent: item.agent, settingVisible: settingMode.visible }" class="ChatItem-Wrapper">
      <div class="ChatItem-Agent">
        <template v-if="item.agent">
          <span v-for="action in item.agent.actions" :key="action" class="ChatItem-AgentList">
            <TextShaving v-if="typeof action === 'string'" :text="action" />
          </span>
        </template>
      </div>

      <div class="ChatItem-Content">
        <div v-if="item.generating" class="ChatItem-Generating">
          <div class="ChatItem-GeneratingWrapper">
            <RoundLoading />
          </div>
        </div>
        <div v-else ref="dom" :class="{ completed, display: !!item.content.length }" class="ChatItem-Content-Inner">
          <span v-if="item.role === 'user'">
            <pre v-text="item.content" />
          </span>
          <RenderContent v-else :render="settingMode.render" readonly :data="item.content" />
          <!-- v-if="generating && !!item.content.length" -->
          <div v-if="props.ind === props.total - 1" class="Generating-Dot" />
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
          !item.generating
            && !!item.content.length
            && !item.streaming
        " class="ChatItem-Mention"
      >
        <span class="toolbox">
          <span
            v-for="tool in filterTools(item, total, ind)" :key="tool.name" class="toolbox-item"
            @click="tool.trigger"
          >
            <el-tooltip :content="tool.name">
              <i :class="tool.icon" />
            </el-tooltip>
          </span>
        </span>

        <span>
          <span class="date">{{ timeAgo }}</span>
          &nbsp;
          <span v-if="item.content.length > 30" class="length">{{ item.content.length }} 字</span>
          <!-- &nbsp;
          <span class="costs">{{ item.content.length * 2.25 }} tokens</span> -->
        </span>
      </div>

      <div tag="div" class="ChatItem-Reference">
        <ChatAttachment :agent="item.agent" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.Generating-Dot {
  position: absolute;

  top: 0;
  left: 0;

  width: 20px;
  height: 20px;

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
  bottom: -20px;

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
  &.agent {
    .ChatItem-Content-Inner {
      pre {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans',
          Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
      }

      &.display {
        padding-bottom: 24px;
      }

      &.display.completed {
        padding-bottom: 0.5rem;
        box-shadow: var(--el-box-shadow);
        background-color: var(--el-bg-color);
        // background-color: var(--el-bg-color);
      }

      box-shadow: none;
      background-color: #0000;

      margin-top: 30px;
    }

    .ChatItem-AgentList {
      margin-bottom: 10px;
    }

    .ChatItem-Agent {
      margin-top: 0px;
      margin-bottom: -10px;
      top: 10px;

      opacity: 1;
    }
  }

  .ChatItem-Agent {
    position: relative;
    padding-left: 1rem;
    // margin-top: -30px;

    top: 0;

    opacity: 0;
    transition: 0.25s;
  }

  .ChatItem-Content-Inner {
    .user & {
      border-radius: 16px;
    }

    pre {
      max-width: 100%;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;

      font-variant-ligatures: no-common-ligatures;
      font-family: 'Helvetica Neue', 'Luxi Sans', 'DejaVu Sans',
        'Hiragino Sans GB', 'Microsoft Yahei', sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji',
        'EmojiSymbols';
    }

    position: relative;
    margin-top: 20px;
    padding: 0.5rem 1rem;

    top: 0;

    width: max-content;
    max-width: 100%;
    min-width: 48px;
    height: fit-content;

    border-radius: 8px 16px 16px 16px;
    box-shadow: var(--el-box-shadow);
    // background-color: var(--el-bg-color);
    background-color: var(--wallpaper-color-lighter);
    backdrop-filter: blur(18px) saturate(180%);
    transition: 0.5s;
  }

  &:hover,
  &.settingVisible {
    .ChatItem-Mention {
      opacity: 0.75;
    }
  }

  .ChatItem-Mention {
    & > span {
      flex: 1;
    }

    .toolbox {
      i {
        display: block;
      }

      display: flex;

      gap: 0.5rem;
      align-items: center;

      height: 12px;
      width: fit-content;

      flex: 0;
      cursor: pointer;
    }

    .user & {
      flex-direction: row-reverse;

      left: unset;
      float: right;
      right: 10px !important;
    }

    z-index: 1;
    position: relative;
    margin-bottom: -15px;
    padding: 0.25rem 0.5rem;
    display: flex;

    gap: 0.5rem;
    align-items: center;
    justify-content: flex-start;

    // height: 32px;
    width: max-content;

    left: 10px;
    bottom: 10px;

    opacity: 0;
    font-size: 12px;
    box-sizing: border-box;
    border-radius: 12px;
    box-shadow: var(--el-box-shadow);
    background-color: var(--el-bg-color-page);
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
}
</style>
