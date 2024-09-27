<script setup lang="ts">
import dayjs from 'dayjs'
import zhLocale from 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import RoundLoading from '../loaders/RoundLoading.vue'
import TextShaving from '../other/TextShaving.vue'
import ThWickCheckBox from '../checkbox/ThWickCheckBox.vue'
import ChatAttachment from './ChatAttachment.vue'
import ItemModelSelector from './addon/ItemModelSelector.vue'
import ErrorCard from './attachments/ErrorCard.vue'
import { type IChatInnerItem, type IChatItem, IChatItemStatus, IChatRole } from '~/composables/api/base/v1/aigc/completion-types'

interface IChatItemProp {
  item: IChatItem
  ind: number
  total: number
  share: boolean
  select: number[]

  // 表指应该渲染第几个顺序 由上一级决定
  meta: {
    dictIndex: number
    show: boolean
  }
}

const props = defineProps<IChatItemProp>()

const emits = defineEmits<{
  (e: 'select', index: number, checked: boolean): void
  (e: 'retry', innerItem: IChatInnerItem): void
  (e: 'update:item', data: IChatItem): void
  (e: 'update:meta', data: IChatItem): void
}>()

const msgItem = useVModel(props, 'item', emits)
const metaModel = useVModel(props, 'meta', emits)
const dom = ref()

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

const nullLen = computed(() => props.item.content?.filter(item => item === null).length || 0)
const innerItem = computed(() => props.item.content?.[msgItem.value.page + nullLen.value] || null)
const timeAgo = computed(() => innerItem.value ? dayjs(innerItem.value.timestamp).fromNow() : '-')
const isUser = computed(() => props.item.role === IChatRole.USER)

const endStatus = [IChatItemStatus.AVAILABLE, IChatItemStatus.BANNED, IChatItemStatus.CANCELLED, IChatItemStatus.ERROR, IChatItemStatus.REJECTED, IChatItemStatus.TIMEOUT, IChatItemStatus.TOOL_ERROR]
const isEnd = computed(() => endStatus.includes(innerItem.value?.status || 0))

// watch(() => reactive([innerItem.value, innerItem.value?.value, innerItem.value?.status]), () => {
//   const rootEl = dom.value?.querySelector('.RenderContent-Inner')
//   const cursor: HTMLElement = dom.value?.querySelector('.Generating-Dot')

//   console.log('update', rootEl, cursor)

//   if (rootEl && cursor)
//     setTimeout(() => handleGeneratingDotUpdate(rootEl, cursor), 0)
// })

const tools = reactive([
  {
    name: '复制',
    icon: 'i-carbon-copy',
    errorHide: true,
    trigger: () => {
      if (!props.item.content || tools[0].icon !== 'i-carbon-copy')
        return

      let content = ''
      innerItem.value!.value.forEach((item) => {
        if (item.type === 'markdown' || item.type === 'text')
          content += item.value
      })

      navigator.clipboard.writeText(content)

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

function filterTools(item: any) {
  return tools.filter((tool) => {
    if (item.status === 2 && tool.errorHide)
      return false

    return item.role === 'user'
      ? !tool.userIgnored
      : true
  })
}

function handleRetry() {
  emits('retry', innerItem.value!)

  msgItem.value.page = props.item.content?.length - 1
}

watchEffect(() => {
  if (isUser.value)
    return

  // const selfIndex = innerItem.value ? props.item.content.findIndex(_ => _?.timestamp === innerItem.value?.timestamp) : 0
  // console.log('refresh', selfIndex, innerItem.value, props)

  // 计算自己的content中有多少个null
  metaModel.value.show = !!innerItem.value && metaModel.value.dictIndex <= props.item.page + nullLen.value
})

// onMounted(() => {
//   const rootEl = dom.value?.querySelector('.RenderContent-Inner')
//   const cursor: HTMLElement = dom.value?.querySelector('.Generating-Dot')

//   if (rootEl && cursor)
//     setTimeout(() => handleGeneratingDotUpdate(rootEl, cursor), 0)
// })
</script>

<template>
  <!-- <span v-if="!isUser">{{ meta }} {{ item.page }} - {{ nullLen }}</span> -->
  <div v-if="metaModel.show" :class="{ check, share, user: isUser }" class="ChatItem">
    <div class="ChatItem-Select">
      <el-checkbox v-model="check" />
    </div>

    <div class="ChatItem-Avatar">
      <img src="/logo.png">
    </div>
    <!-- error: innerItem.status === IChatItemStatus.ERROR, -->
    <div v-if="innerItem" :class="{ settingVisible: settingMode.visible }" class="ChatItem-Wrapper">
      <div class="ChatItem-Content">
        <div v-if="innerItem.status === IChatItemStatus.WAITING" class="ChatItem-Generating">
          <div class="ChatItem-GeneratingWrapper">
            <RoundLoading />
          </div>
        </div>
        <div v-else-if="innerItem.value.length" ref="dom" class="ChatItem-Content-Inner">
          <!-- <span v-if="innerItem.status === IChatItemStatus.ERROR">
            错误 {{ item.content }}
          </span> -->
          <div v-for="(block, i) in innerItem.value" :key="i" class="ChatItem-Content-Inner-Block">
            <!-- <div > -->
            <pre v-if="block.type === 'text'" class="inner" v-text="block.value" />
            <!-- </div> -->

            <RenderContent
              v-else-if="block.type === 'markdown'" :dot-enable="!isEnd" :render="settingMode.render"
              readonly :data="block.value"
            />

            <div v-else-if="block.type === 'card'">
              Card: {{ block }}
            </div>

            <div v-else-if="block.type === 'tool'">
              <ChatAttachment :block="block" />
            </div>

            <div v-else-if="block.type === 'error'">
              <ErrorCard :block="block " />
            </div>
          </div>
        </div>
        <p v-else mt-3>
          <TextShaving :text="isEnd ? '分析失败' : '正在分析中'" />
          <br>
        </p>

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
          isEnd
            && !!item.content?.length
        " class="ChatItem-Mention" :class="{
          autoHide: isUser || total !== ind + 1,
        }"
      >
        <ChatAddonChatPageSelector
          v-if="!isUser && item.content.length - nullLen > 1" v-model="msgItem.page"
          :total-page="item.content.length - nullLen"
        />

        <span class="toolbox">
          <span v-for="tool in filterTools(item)" :key="tool.name" class="toolbox-item" @click="tool.trigger">
            <el-tooltip :content="tool.name">
              <i :class="tool.icon" />
            </el-tooltip>
          </span>
        </span>

        <!-- <ItemModelSelector v-if="!isUser && total === ind + 1" v-model="innerItem.model" @retry="handleRetry" /> -->

        <span class="info">
          <span class="date">{{ timeAgo }}</span>
          &nbsp;
          <span v-if="innerItem.value?.length > 30" class="length">{{ innerItem.value.length }} 字</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
div.ChatItem-Wrapper.error div.ChatItem-Content-Inner {
  box-shadow: var(--el-box-shadow-light);
  backdrop-filter: unset;
  background-color: var(--el-color-danger);
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
  user-select: none;
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
      padding: 0.25rem 0.5rem;
      flex-direction: row-reverse;

      left: unset;
      float: right;

      border-radius: 12px;
      box-shadow: var(--el-box-shadow);
      background-color: var(--wallpaper-color-lighter);
      backdrop-filter: blur(18px) saturate(180%);
      // background-color: var(--el-bg-color-page);
    }
    z-index: 2;
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

    width: 100%;

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
  // animation: join 0.35s ease-in-out;

  // background-color: #ff000010;
}
</style>
