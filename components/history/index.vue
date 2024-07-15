<script setup lang="ts">
import dayjs from 'dayjs'
import type { DisplayHistory, ThHistory } from './history'

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
    title: '近7天',
    filter: (time: number) => Date.now() - time <= 7 * 24 * 3600 * 1000,
  },
  {
    title: '这个月',
    filter: (time: number) => dayjs(time).isSame(dayjs(Date.now()), 'month'),
  },
  {
    title: '以前',
    filter: () => true,
  },
]

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
</script>

<template>
  <div class="History">
    <teleport to="body">
      <div :class="{ expand }" class="History-Indicator" @click="expand = !expand" />
    </teleport>

    <div class="History-Title">
      <h1>This!AI.</h1>
    </div>

    <div class="History-Wrapper">
      <el-scrollbar>
        <div class="History-Content">
          <div class="History-Content-Item active" @click="emits('create')">
            新建聊天
          </div>
          <br>

          <HistorySection
            v-for="(section, index) in historyList"
            :key="index"
            v-model:selectIndex="selectIndex"
            :title="section.title"
            :history="section.children"
            @delete="handleDelete"
          />
        </div>
      </el-scrollbar>
    </div>

    <div class="History-Bottom">
      <DarkToggle />
      <!-- <CloseCheckbox v-model="expand" /> -->
    </div>
  </div>
</template>

<style lang="scss">
div.History {
  .el-scrollbar__bar.is-vertical {
    width: 3px;
  }
}

.History-Wrapper {
  &::before {
    z-index: 1;
    content: '';
    position: absolute;

    left: 0;
    bottom: 0px;

    width: 100%;
    height: 50px;

    background: linear-gradient(to top, var(--el-bg-color-page) 0%, #0000 100%);
  }
  position: relative;

  width: 100%;
  height: calc(100% - 50px);

  box-sizing: border-box;
}

.History-Indicator {
  &.expand {
    left: 270px;
  }
  &:hover {
    opacity: 0.75;
    height: 100px;

    cursor: pointer;
    transform: translateX(2px) translateY(-50%);
  }
  z-index: 2;
  position: absolute;

  top: 50%;
  left: 10px;

  width: 8px;
  height: 50px;

  opacity: 0.5;
  border-radius: 100px;
  transform: translateX(0px) translateY(-50%);
  background-color: var(--el-text-color-primary);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.History-Content {
  position: relative;
  display: flex;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 80px;
  padding-bottom: 2rem;
  flex-direction: column;

  gap: 0.5rem;
}

.History {
  &-Title {
    z-index: 2;
    position: absolute;
    padding: 1rem 0;
    font-size: 24px;

    width: 100%;
    height: 70px;

    font-weight: 600;
    text-align: center;

    background-size: 4px 4px;
    background-image: radial-gradient(transparent 1px, var(--el-bg-color) 1px);
    backdrop-filter: saturate(50%) blur(4px);
  }
  &-Bottom {
    position: absolute;
    padding: 0.5rem;
    display: flex;

    align-items: center;
    justify-content: center;

    bottom: 0;

    width: 100%;
    height: 50px;

    box-sizing: border-box;
    // backdrop-filter: blur(18px) saturate(180%);
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
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  transition:
    0.75s width cubic-bezier(0.785, 0.135, 0.15, 0.86),
    0.5s opacity cubic-bezier(0.785, 0.135, 0.15, 0.86),
    0.25s transform cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
</style>
