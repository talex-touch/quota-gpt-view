<script setup lang="ts">
import dayjs from 'dayjs'
import zhLocale from 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import RoundLoading from '../loaders/RoundLoading.vue'
import TextShaving from '../other/TextShaving.vue'

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
        <span>
          <span class="date">{{ timeAgo }}</span>
          &nbsp;
          <span v-if="item.content.length > 30" class="length">{{ item.content.length }} long</span>
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

      <div tag="div" class="ChatItem-Reference">
        <ChatAttachment :agent="item.agent" />

        <template v-if="item.agent && !!item.content.length && !item.streaming">
          <ChatQueryCollapse v-if="item?.agent?.actions?.length">
            <template #Header>
              <div i-carbon-link />
              参考
              <span class="text-primary">({{
                item.agent.actions.filter((action: any) => action?.type === "url").length
              }})</span>
            </template>
            <span
              v-for="(action, index) in item.agent.actions"
              :key="action"
              :style="`--i: ${(index + 1) * 0.125}s`"
              class="ChatItem-ReferenceList"
            >
              <a v-if="action?.type === 'url'" target="_blank" :href="action.data.url">{{
                action.title
              }}</a>
            </span>
          </ChatQueryCollapse>
        </template>
      </div>
      <!-- </div> -->
    </div>
  </div>
</template>

<style lang="scss">
@keyframes reference-join {
  from {
    opacity: 0;
    transform: translateY(10%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ChatItem-ReferenceList {
  display: flex;
  flex-direction: column;

  gap: 0.25rem;
  a {
    &:hover {
      opacity: 0.75;
    }
    opacity: 0.5;

    cursor: pointer;
  }

  opacity: 0;
  animation: 0.25s var(--i) cubic-bezier(0.075, 0.82, 0.165, 1) reference-join
    forwards;
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

    .ChatItem-Agent {
      margin-top: 0px;
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

    // width: max-content;
    // max-width: 70%;
    min-width: 48px;
    height: max-content;

    border-radius: 8px 16px 16px 16px;
    box-shadow: var(--el-box-shadow);
    background-color: var(--el-bg-color);
    transition: 0.5s;
  }
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
      margin-bottom: 0px;
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
    position: relative;
    margin-top: 5px;
    margin-bottom: -20px;
    padding: 0 1rem;
    display: flex;

    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    flex-direction: row-reverse;

    width: 100%;
    min-width: 280px;

    left: 0;

    opacity: 0;
    font-size: 12px;
    box-sizing: border-box;
    transition: 0.25s;
  }

  position: relative;
  // padding: 0.5rem 1rem;

  // width: max-content;
  // max-width: 70%;
  // min-width: 48px;
  // height: max-content;

  // border-radius: 8px 16px 16px 16px;
  // box-shadow: var(--el-box-shadow);
  // background-color: var(--el-bg-color);
}

.ChatItem-Reference {
  padding-left: 0.5rem;
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
    // margin-top: -10px;

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
