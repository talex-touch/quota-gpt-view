<script setup lang="ts">
import dayjs from 'dayjs'
import zhLocale from 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import RoundLoading from '../loaders/RoundLoading.vue'

const props = defineProps<{
  item: any
  ind: number
  total: number
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
  { name: '翻译', icon: 'i-carbon-translate' },
  { name: '朗读', icon: 'i-carbon-user-speaker' },
  { name: '重新生成', userIgnored: true, lastShow: true, icon: 'i-carbon-restart' },
])

const timeAgo = computed(() => dayjs(props.item.date, 'YYYY/M/D HH:mm:ss').fromNow())
</script>

<template>
  <div :class="{ user: item.role === 'user' }" class="ChatItem">
    <div class="ChatItem-Avatar">
      <img src="/logo.png">
    </div>
    <div class="ChatItem-Wrapper">
      <div class="ChatItem-Content">
        <div v-if="item.generating" class="ChatItem-Generating">
          <div class="ChatItem-GeneratingWrapper">
            <RoundLoading />
          </div>
        </div>
        <RenderContent v-else readonly :data="item.content" />
      </div>

      <div v-if="!item.generating" class="ChatItem-Mention">
        <span>
          <span class="date">{{ timeAgo }}</span>
          &nbsp;
          <span class="costs">{{ item.content.length * 5.25 }} tokens</span>
        </span>

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
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.ChatItem-Generating {
  .ChatItem-GeneratingWrapper {
    position: absolute;

    height: 100%;

    opacity: 0.25;
    background-color: rgba(255, 255, 255, 0.5);
  }
  height: 28px;

  position: relative;
}

@keyframes join {
  from {
    transform: translateY(20%) scale(0.75);
  }

  to {
    transform: translateY(0) scale(1);
  }
}
.ChatItem-Wrapper {
  &:hover {
    .ChatItem-Mention {
      opacity: 0.75;
    }

    // background-color: var(--el-bg-color-page);
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
    position: absolute;
    padding: 0 1rem;
    display: flex;

    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    flex-direction: row-reverse;

    width: 100%;
    min-width: 280px;

    left: 0;
    bottom: -25px;

    opacity: 0;
    font-size: 12px;
    box-sizing: border-box;
    transition: 0.25s;
  }

  .user & {
    border-radius: 16px;
  }
  position: relative;
  padding: 0.5rem 1rem;

  // width: max-content;
  // max-width: 70%;
  min-width: 48px;
  height: max-content;

  border-radius: 8px 16px 16px 16px;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
}

.ChatItem {
  &.user {
    .ChatItem-Mention {
      flex-direction: row;

      left: unset;
      right: 0 !important;
    }
    .ChatItem-Avatar {
      display: none;
    }
    align-self: flex-end;
  }
  .ChatItem-Avatar {
    margin-top: -20px;

    min-width: 48px;
    width: 48px;
  }
  z-index: 2;
  display: flex;
  margin-top: 0.5rem;
  margin-bottom: 30px;

  width: max-content;
  max-width: 70%;
  // min-width: 48px;
  // height: max-content;

  gap: 0.5rem;

  animation: join 0.35s ease-in-out;
}
</style>
