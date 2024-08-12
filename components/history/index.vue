<script setup lang="ts">
import dayjs from 'dayjs'
import IconButton from '../button/IconButton.vue'
import Logo from '../chore/Logo.vue'
import type { ThHistory } from './history'

const props = defineProps<{
  expand: boolean
  selectIndex: number
  history: ThHistory[]
}>()

const emits = defineEmits<{
  (e: 'create'): void
  (e: 'select', index: number): void
  (e: 'delete', index: number): void
}>()

function handleDelete(index: number) {
  emits('delete', index)
}

const { expand, selectIndex } = useVModels(props, emits)

const categories = [
  {
    title: '今天',
    filter: (time: number) => dayjs(time).isSame(dayjs(Date.now()), 'day'),
  },
  {
    title: '昨天',
    filter: (time: number) => new Date().getDate() - dayjs(time).toDate().getDate() === 1,
  },
  {
    title: '近7天',
    filter: (time: number) => Date.now() - time <= 7 * 24 * 3600 * 1000,
  },
  {
    title: '这个月',
    filter: (time: number) => dayjs(time).isSame(dayjs(Date.now()), 'month'),
  },
  {
    title: '上个月',
    filter: (time: number) => new Date().getMonth() - dayjs(time).toDate().getMonth() === 1,
  },
  {
    title: '以前',
    filter: () => true,
  },
]

const loadMore = ref()
const processedHistory = computed(() =>
  [...props.history].map((item, index) => ({
    index,
    ...item,
  })),
)
const historyList = computed(() => {
  const used: number[] = []

  return categories
    .map(category => ({
      title: category.title,
      children: [...processedHistory.value]
        .filter((item) => {
          if (used.includes(item.index))
            return false

          const res = category.filter(item.lastUpdate)
          if (res) {
            used.push(item.index)
            return true
          }

          return false
        })
        .sort((a, b) => b.lastUpdate - a.lastUpdate),
    }))
    .filter(category => category.children.length)
})

onMounted(() => {
  const el = loadMore.value
  if (!el)
    return

  // observer
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting)
      chatManager.loadHistories()
  }, {
    threshold: 0,
  })

  if (el instanceof Element)
    observer.observe(el)

  watch(() => chatManager.historyCompleted.value, (val) => {
    if (val)
      observer.unobserve(el)
  }, { immediate: true })

  setTimeout(() => {
    // 判断如果是移动端，那么从左向右滑动就要打开
    if (document.body.classList.contains('mobile'))
      mobileSlideProcess()
  })
})

const dom = ref()

async function mobileSlideProcess() {
  expand.value = false

  const el = dom.value

  let down = false
  let startX = 0

  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0]
    const { clientX, clientY } = touch
    const { left, top } = el.getBoundingClientRect()

    const screenWidth = window.innerWidth
    const percent = screenWidth * 0.3

    if (clientX < left + percent && clientY > top + 20) {
      startX = clientX

      down = true
    }
    else if (expand.value) {
      if (clientX > left + 20 && clientY > top + 20) {
        startX = clientX

        down = true
      }
    }
  })

  document.addEventListener('touchend', (e: TouchEvent) => {
    if (!down)
      return

    const diff = startX - e.changedTouches[0].clientX

    if (Math.abs(diff) >= window.innerWidth * 0.1)
      expand.value = diff < 0

    down = false
  })
}
</script>

<template>
  <div ref="dom" class="History">
    <teleport to="body">
      <div :class="{ expand }" class="History-Indicator" @click="expand = !expand" />
    </teleport>

    <div class="History-Title">
      <div flex items-center gap-2>
        <Logo />
        <h1>科塔智爱</h1>
      </div>
      <IconButton @click="emits('create')">
        +
      </IconButton>
    </div>

    <div class="History-Wrapper">
      <el-scrollbar>
        <div class="History-Content">
          <!-- <div style="margin: 0 0.5rem" class="History-Content-Item active" @click="emits('create')">
            新建聊天
          </div>
          <br> -->

          <HistorySection
            v-for="(section, index) in historyList" :key="index" v-model:selectIndex="selectIndex"
            :title="section.title" :history="section.children" @delete="handleDelete"
          />
        </div>

        <div
          v-if="!chatManager.historyCompleted.value" ref="loadMore"
          :class="{ show: chatManager.loadingHistory.value }" class="loadMore"
        >
          <LoadersEagleRoundLoading />
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss">
div.History {
  .el-scrollbar__bar.is-vertical {
    width: 3px;
  }

  .loadMore {
    &.show {
      opacity: 1;
    }

    position: relative;
    display: flex;

    margin: 0 auto;

    align-items: center;
    justify-content: center;

    width: 100px;
    height: 100px;

    opacity: 0;
  }
}

.History-Wrapper {
  &::before {
    z-index: 2;
    content: '';
    position: absolute;

    left: 0;
    bottom: 0px;

    width: 100%;
    height: 10px;

    background: linear-gradient(
      to top,
      var(--wallpaper-color-lighter, var(--el-bg-color)) 0%,
      #0000 100%
    );
  }
  z-index: 2;
  position: relative;

  width: 100%;
  height: 100%;

  box-sizing: border-box;
}

.History-Indicator {
  &:hover {
    opacity: 0.75;

    cursor: pointer;
    transform: translateX(2px) translateY(-50%);

    &::before {
      width: 5px;
      height: 16px;
      transform: translate(-50%, -50%) translateY(5px) rotate(30deg);
    }

    &::after {
      width: 5px;
      height: 16px;
      transform: translate(-50%, -50%) translateY(-5px) rotate(-30deg);
    }
  }

  &.expand {
    left: 270px;

    &:hover {
      &::before {
        width: 5px;
        height: 16px;
        transform: translate(-50%, -50%) translateY(5px) rotate(-30deg);
      }

      &::after {
        width: 5px;
        height: 16px;
        transform: translate(-50%, -50%) translateY(-5px) rotate(30deg);
      }
    }
  }

  &::before,
  &::after {
    content: '';
    position: absolute;

    top: 50%;
    left: 50%;

    width: 8px;
    height: 28px;

    border-radius: 4px;
    background-color: var(--el-text-color-primary);
    transform: translate(-50%, -50%);
    transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  &::before {
    transform: translate(-50%, -50%) translateY(10px) rotate(0);
  }

  &::after {
    transform: translate(-50%, -50%) translateY(-10px) rotate(0);
  }

  z-index: 2;
  position: absolute;

  top: 50%;
  left: 10px;

  width: 8px;
  height: 50px;

  opacity: 0.5;
  cursor: pointer;
  transform: translateX(0px) translateY(-50%);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.History-Content {
  position: relative;
  display: flex;
  // padding-left: 0.5rem;
  // padding-right: 0.5rem;
  padding-top: 80px;
  padding-bottom: 2rem;
  flex-direction: column;

  gap: 0.5rem;
}

.History {
  &-Title {
    z-index: 3;
    position: absolute;
    display: flex;
    padding: 1rem 1rem;
    font-size: 24px;

    width: 100%;
    height: 70px;

    font-weight: 600;
    text-align: center;
    align-items: center;
    justify-content: space-between;

    .wallpaper & {
      background-image: none;

      backdrop-filter: blur(4px);
    }

    background-size: 4px 4px;
    background-image: radial-gradient(
      transparent 1px,
      var(--wallpaper-color-light, var(--el-bg-color)) 1px
    );
    backdrop-filter: saturate(50%) blur(4px);
  }

  .expand & {
    margin-left: 0;

    width: 260px;

    opacity: 1;
    transform: translateX(0);

    pointer-events: all;
    transition:
      0.5s width cubic-bezier(0.785, 0.135, 0.15, 0.86),
      0.75s opacity cubic-bezier(0.785, 0.135, 0.15, 0.86),
      0.75s transform cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  z-index: 10;
  position: relative;
  margin-left: -1px;

  width: 0;

  height: 100%;

  opacity: 0;
  pointer-events: none;
  transform: translateX(-100%);
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  transition:
    0.75s width cubic-bezier(0.785, 0.135, 0.15, 0.86),
    0.5s opacity cubic-bezier(0.785, 0.135, 0.15, 0.86),
    0.25s transform cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.mobile .History {
  position: absolute;

  padding-top: 1rem;
}
</style>
