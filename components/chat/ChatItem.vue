<script setup lang="ts">
import dayjs from 'dayjs'
import zhLocale from 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import RoundLoading from '../loaders/RoundLoading.vue'
import TextShaving from '../other/TextShaving.vue'
import ThCheckBox from '../checkbox/ThCheckBox.vue'

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
  // { name: '翻译', icon: 'i-carbon-translate' },
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
</script>

<template>
  <div :class="{ check, share, user: item.role === 'user' }" class="ChatItem">
    <div class="ChatItem-Select">
      <el-checkbox v-model="check" />
    </div>

    <div class="ChatItem-Avatar">
      <img src="/logo.png">
    </div>
    <div :class="{ agent: item.agent }" class="ChatItem-Wrapper">
      <div class="ChatItem-Agent">
        <template v-if="item.agent">
          <span
            v-for="action in item.agent.actions"
            :key="action"
            class="ChatItem-AgentList"
          >
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
        <div
          v-else
          :class="{ display: !!item.content.length }"
          class="ChatItem-Content-Inner"
        >
          <RenderContent readonly :data="item.content" />
        </div>
      </div>

      <div
        v-if="
          !item.generating
            && item.role !== 'user'
            && !!item.content.length
            && !item.streaming
        "
        class="ChatItem-Mention"
      >
        <span class="toolbox">
          <span
            v-for="tool in tools"
            :key="tool.name"
            class="toolbox-item"
            @click="tool.trigger"
          >
            <el-tooltip
              v-if="
                item.role === 'user'
                  ? !tool.userIgnored
                  : tool.lastShow
                    ? total === ind + 1
                    : true
              "
              :content="tool.name"
            >
              <i :class="tool.icon" />
            </el-tooltip>
          </span>
        </span>

        <span>
          <span class="date">{{ timeAgo }}</span>
          &nbsp;
          <span v-if="item.content.length > 30" class="length">{{ item.content.length }} long</span>
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
.ChatItem.share {
  div.ChatItem-Mention {
    margin-bottom: -20px;
    opacity: 0;
  }

  .ChatItem-Select {
    opacity: 1;
  }

  margin-left: 1rem;

  left: 25%;
  width: 50%;

  &.check {
    padding: 0.5rem;

    background: var(--el-bg-color);
    border-radius: 16px;
  }
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
      &.display {
        box-shadow: var(--el-box-shadow);
        background-color: var(--el-bg-color);
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
    background-color: var(--el-bg-color);
    transition: 0.5s;
  }

  &:hover {
    .ChatItem-Mention {
      margin-bottom: 0px;
      opacity: 0.75;
    }
  }

  .ChatItem-Mention {
    .toolbox {
      i {
        display: block;
      }
      display: flex;

      gap: 0.5rem;
      align-items: center;

      height: 12px;
      width: max-content;

      cursor: pointer;
    }
    position: relative;
    margin-top: 5px;
    margin-bottom: -20px;
    padding: 0 1rem;
    display: flex;

    gap: 0.5rem;
    align-items: center;
    justify-content: flex-start;

    width: 100%;

    left: 0;

    opacity: 0;
    font-size: 12px;
    box-sizing: border-box;
    transition: 0.25s;
  }

  position: relative;

  width: max-content;
  max-width: 70%;
  min-width: 48px;
  height: max-content;
}

.ChatItem {
  &.user {
    .ChatItem-Avatar {
      display: none;
    }
    justify-content: flex-end;
  }

  .ChatItem-Avatar {
    width: 48px;
  }
  z-index: 2;
  position: relative;
  display: flex;
  margin: 1rem 0;

  width: 100%;
  height: max-content;

  gap: 0.5rem;

  transition: 0.25s;
  box-sizing: border-box;
  animation: join 0.35s ease-in-out;
}
</style>
