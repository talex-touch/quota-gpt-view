<script setup lang="ts">
import dayjs from 'dayjs'
import IconButton from '../button/IconButton.vue'
import Logo from '../chore/Logo.vue'
import UserAvatar from '../personal/UserAvatar.vue'
import PremiumButton from '../button/PremiumButton.vue'
import { $historyManager, IHistoryStatus } from '~/composables/api/base/v1/aigc/history'
import type { IChatConversation } from '~/composables/api/base/v1/aigc/completion-types'

const props = defineProps<{
  // expand: boolean
  select: string
}>()

const emits = defineEmits<{
  (e: 'create'): void
  (e: 'update:select', index: string): void
  (e: 'delete', id: string): void
}>()

function handleDelete(id: string) {
  emits('delete', id)
}

const { select } = useVModels(props, emits)

const expand = computed({
  set(val: boolean) {
    userConfig.value.pri_info.appearance.expand = val
  },
  get() {
    return userConfig.value.pri_info.appearance.expand
  },
})

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
const searchedList = reactive<{
  enable: boolean
  loading: boolean
  select: string
  list: Array<IChatConversation>
}>({
  enable: false,
  loading: false,
  list: [],
  select: '',
})
const processedHistory = computed(() => [...($historyManager.options.list.values())].map((item, index) => ({
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
      $historyManager.loadHistories()
  }, {
    threshold: 0,
  })

  if (el instanceof Element)
    observer.observe(el)

  watch(() => $historyManager.options.status, (val) => {
    if (val === IHistoryStatus.COMPLETED)
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

const planProgress = computed(() => {
  if (!userStore.value.subscription)
    return null

  const { startDate, endDate } = userStore.value.subscription

  // 将 2024-08-03 转换成 date对象
  const startDateObj = dayjs(startDate)
  const endDateObj = dayjs(endDate)

  function calculateExpiry(expiryDate: Date) {
    const now = dayjs()
    const expiry = dayjs(expiryDate)
    const diff = expiry.diff(now)

    const years = expiry.diff(now, 'year')
    const months = expiry.diff(now, 'month') % 12
    const days = expiry.diff(now, 'day') % 30
    const hours = expiry.diff(now, 'hour') % 24
    const minutes = expiry.diff(now, 'minute') % 60

    if (diff > 0) {
      if (years > 0)
        return `${years}年 后到期`

      else if (months > 0)
        return `${months}月 后到期`

      else if (days > 0)
        return `${days}天 后到期`

      else if (hours > 0)
        return `${hours}小时 后到期`

      else
        return `${minutes}分钟 后到期`
    }
    else {
      return '已过期'
    }
  }

  const startTimeStamp = startDateObj.toDate().getTime()
  const endTimeStamp = endDateObj.toDate().getTime()

  const total = endTimeStamp - startTimeStamp
  const diff = Date.now() - startTimeStamp
  const progress = Math.round((diff / total) * 100)

  const text = calculateExpiry(endDateObj.toDate())

  return { text, progress }
})

async function handleSearchHistory(query: string) {
  if (!query) {
    searchedList.enable = false
    searchedList.list = []
    return
  }

  searchedList.enable = true
  searchedList.loading = true

  await sleep(200)

  const res = await $historyManager.searchHistories(query)

  searchedList.list = res.data.items

  searchedList.loading = false
}

const dispose = ref(false)
onDeactivated(() => dispose.value = true)
onActivated(() => dispose.value = false)
onBeforeUnmount(() => dispose.value = true)
</script>

<template>
  <div ref="dom" class="History" :class="{ plan: userStore.subscription, searchable: searchedList.enable }">
    <teleport :disabled="dispose" to="body">
      <div v-if="!dispose" :class="{ expand }" class="History-Indicator" @click="expand = !expand" />
    </teleport>

    <div class="History-Title">
      <div class="History-Title-Head" @click="emits('create')">
        <ButtonWavingButton v-wave flex items-center justify-between gap-2>
          <img src="/logo.png">
          <span>创建新对话</span>
          <div i-carbon-add mr-2 />
        </ButtonWavingButton>
      </div>

      <InputSearchable @search="handleSearchHistory" />
    </div>

    <div class="History-Wrapper">
      <div v-loader="searchedList.loading" class="History-SearchableContent">
        <el-scrollbar>
          <HistorySection
            v-model:select="searchedList.select"
            title="已搜索" :history="searchedList.list" @delete="handleDelete"
          />
        </el-scrollbar>
      </div>

      <el-scrollbar>
        <div class="History-Content">
          <HistorySection
            v-for="(section, index) in historyList" :key="index" v-model:select="select"
            :title="section.title" :history="section.children" @delete="handleDelete"
          />
        </div>

        <div
          v-if="$historyManager.options.status !== IHistoryStatus.COMPLETED" ref="loadMore"
          :class="{ show: $historyManager.options.status === IHistoryStatus.LOADING }" class="loadMore"
        >
          <LoadersEagleRoundLoading />
        </div>
      </el-scrollbar>
    </div>

    <div class="History-Bottom">
      <PremiumButton v-if="!userStore.subscription" @click="$router.push('/plan')" />
      <template v-else>
        <span v-if="planProgress && planProgress" class="plan">
          <span class="progress-bar" :style="`--w: ${100 - planProgress.progress}%`" />
          <span class="text" w-full flex items-center justify-center gap-2 text-sm>{{ planProgress.text }}<el-link
            v-if="planProgress.progress >= 30" type="primary"
          >立即续费</el-link></span>
        </span>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.History-SearchableContent {
  .searchable & {
    transform: translateX(0);
  }
  .HistorySection {
    --history-title-height: 0;
  }
  z-index: 2;
  position: absolute;
  padding: 0.5rem;

  top: var(--history-title-height);
  left: 0;

  width: 100%;
  height: calc(100% - var(--history-title-height));

  transform: translateX(-100%);
  background-color: var(--el-bg-color-page);

  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.History-Bottom {
  .plan {
    .progress-bar {
      &::before {
        content: '';
        position: absolute;
        display: block;

        top: 0;
        left: 0;

        height: 100%;
        width: 100%;

        opacity: 0.5;
        background-color: var(--plan-color);
      }

      &::after {
        content: '';
        position: absolute;
        display: block;

        top: 0;
        left: 0;

        height: 100%;
        width: var(--w);

        background-color: var(--plan-color);
      }

      position: absolute;
      display: block;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      overflow: hidden;
    }

    .text {
      z-index: 1;
    }

    position: relative;
    display: flex;

    width: 90%;
    height: 36px;

    overflow: hidden;
    text-align: center;
    border-radius: 16px;
  }
}

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

.History-Title-Head {
  &::before {
    z-index: -1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.125;
    overflow: hidden;
    border-radius: 16px;
    background-size: cover;
    background-position: 64px 0;
    filter: blur(18px) saturate(180%);
    background-image: var(--wallpaper);
  }

  &::after {
    z-index: -1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.75;
    border-radius: 16px;
    background-color: var(--el-bg-color);
  }
  position: relative;

  width: 100%;

  // overflow: hidden;
  // border-radius: 16px;

  img {
    width: 32px;
    height: 32px;
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
    height: 20px;

    opacity: 0.25;
    background: linear-gradient(
      to top,
      var(--wallpaper-color-lighter, var(--el-bg-color-page)) 0%,
      #0000 100%
    );
  }

  z-index: 2;
  position: relative;

  width: 100%;
  height: calc(100% - var(--history-title-height) + 70px);

  box-sizing: border-box;
}

.History-Indicator {
  &:hover {
    opacity: 1;

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
    left: 344px;

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
    height: 32px;

    border-radius: 4px;
    // box-shadow: var(--el-box-shadow);
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

  // .wallpaper &,
  // .dark & {
  //   mix-blend-mode: unset;
  // }

  z-index: 2;
  position: absolute;

  top: 50%;
  left: 74px;

  width: 8px;
  height: 50px;

  opacity: 0;
  // mix-blend-mode: difference;
  cursor: pointer;
  filter: drop-shadow(0 0 8px var(--el-mask-color-extra-light));
  transform: translateX(0px) translateY(-50%);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);

  animation: indicator_form 0.25s 1s forwards;
}

@keyframes indicator_form {
  from {
    opacity: 0;
  }

  to {
    opacity: 0.85;
  }
}

.History-Content {
  position: relative;
  display: flex;
  // padding-left: 0.5rem;
  // padding-right: 0.5rem;
  padding-top: calc(var(--history-title-height) + 30px);
  padding-bottom: 2rem;
  flex-direction: column;

  gap: 0.5rem;
}

.History {
  --history-title-height: 125px;

  &-Title {
    z-index: 3;
    position: absolute;
    display: flex;
    padding: 1rem 1rem;
    font-size: 24px;

    width: 100%;
    height: var(--history-title-height);

    gap: 1rem;
    font-weight: 600;
    text-align: center;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;

    .wallpaper & {
      background-image: none;

      background-color: #0000;
      backdrop-filter: blur(4px);
    }

    .searchable & {
      background-color: var(--el-bg-color-page);
    }

    // background-color: var(--el-bg-color-page);
    background-size: 4px 4px;
    background-image: radial-gradient(
      transparent 1px,
      var(--wallpaper-color-light, var(--el-bg-color-page)) 1px
    );
    backdrop-filter: saturate(50%) blur(4px);
  }

  &-Bottom {
    &::before {
      z-index: -1;
      content: '';
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      opacity: 0.25;
      background-size: cover;
      background-position: 64px 100%;
      filter: blur(18px) saturate(180%);
      background-image: var(--wallpaper);
    }

    &::after {
      z-index: -1;
      content: '';
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      opacity: 0.5;
      filter: blur(18px);
      background-color: var(--el-bg-color);
    }

    z-index: 2;
    position: absolute;
    padding: 0.5rem;
    display: flex;

    align-items: center;
    justify-content: center;

    bottom: 0;

    width: 100%;
    height: 70px;

    box-sizing: border-box;
    // border-top: 1px solid var(--el-border-color);

    background-color: var(--el-bg-color-page);
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
  background-color: var(--el-bg-color-page);

  // overflow: hidden;
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
