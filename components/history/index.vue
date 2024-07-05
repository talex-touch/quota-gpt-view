<script setup lang="ts">
import CloseCheckbox from '../button/CloseCheckbox.vue'
import type { ThHistory } from './history'

const props = defineProps<{
  expand: boolean
  selectIndex: number
  history: ThHistory[]
}>()

const emits = defineEmits<{
  (e: 'select', index: number): void
  (e: 'delete', index: number): void
}>()

const menus = reactive([
  {
    name: '编辑标题',
    icon: 'i-carbon-edit',
    trigger: () => {

    },
  },
  {
    name: '分享记录',
    icon: 'i-carbon-share',
    trigger: () => {

    },
  },
  {
    name: '删除记录',
    icon: 'i-carbon-close',
    danger: true,
    trigger: () => {

    },
  },
])

const { expand, selectIndex } = useVModels(props, emits)
const historyList = computed(() =>
  [...props.history]
    .map((item, ind) => ({
      ind,
      ...item,
    }))
    .sort((a, b) => b.lastUpdate - a.lastUpdate),
)
</script>

<template>
  <div class="History">
    <teleport to="body">
      <div :class="{ expand }" class="History-Indicator" @click="expand = !expand" />
    </teleport>

    <div class="History-Title">
      <h1>This!AI.</h1>
    </div>

    <div class="History-Content">
      <div
        v-for="(item, index) in historyList"
        :key="index"
        :class="{ active: selectIndex === item.ind }"
        class="History-Content-Item"
        @click="selectIndex = item.ind"
      >
        {{ item.topic }}
        <div class="History-Content-Fixed">
          <div class="i-carbon:overflow-menu-horizontal" />

          <div class="History-Content-Menu">
            <div v-for="menu in menus" :key="menu.name" :class="{ danger: menu.danger }" class="History-Content-Menu-Item" @click="menu.trigger">
              <div :class="menu.icon" />
              <span v-html="menu.name" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="History-Bottom">
      {{ expand }}
      <DarkToggle />
      <CloseCheckbox v-model="expand" />
    </div>
  </div>
</template>

<style lang="scss">
.History-Indicator {
  &.expand {
    left: 260px;
  }
  &:hover {
    opacity: 0.75;
    height: 100px;

    cursor: pointer;
    transform: translateX(2px) translateY(-50%);
  }
  z-index: 10;
  position: absolute;

  top: 50%;
  left: 5px;

  width: 5px;
  height: 50px;

  opacity: 0.5;
  border-radius: 100px;
  transform: translateX(0px) translateY(-50%);
  background-color: var(--el-text-color-primary);
  transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.History-Content {
  &-Fixed {
    &:hover {
      .History-Content-Menu {
        transform: scale(1);
      }
    }
    .History-Content-Menu {
      &-Item {
        &:hover {
          opacity: 1;
          background: var(--el-bg-color-page);
        }
        &.danger {
          color: var(--el-color-danger);
        }
        display: flex;
        padding: 0.25rem 0.5rem;

        gap: 0.5rem;
        opacity: 0.75;
        font-size: 14px;
        align-items: center;
        border-radius: 8px;
      }
      position: absolute;
      padding: 0.5rem;
      display: flex;

      flex-direction: column;

      gap: 0.5rem;
      top: 2.5rem;
      left: 0;

      width: max-content;
      height: max-content;

      transform: scale(0);
      border-radius: 16px;
      transform-origin: left top;
      box-shadow: var(--el-box-shadow);
      background-color: var(--el-bg-color);
      transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    }

    &:hover {
      background-color: #ffffff30;
    }
    position: absolute;
    display: flex;

    align-items: center;
    justify-content: center;

    top: 50%;
    right: 1%;

    width: 32px;
    height: 32px;
    font-size: 20px;

    opacity: 0;
    border-radius: 12px;
    transform: translate(0, -50%);
    transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  &-Item {
    &:hover {
      .History-Content-Fixed {
        opacity: 1;
      }
      background-color: var(--el-bg-color-page);
    }
    &.active {
      opacity: 1;
      background-color: var(--el-color-primary-light-5);
    }
    position: relative;
    padding: 0.5rem 0.5rem;

    opacity: 0.75;
    font-size: 14px;
    cursor: pointer;
    border-radius: 12px;
    // background-color: var(--el-bg-color-page);
  }
  position: relative;
  display: flex;
  padding: 0.5rem 1rem;
  flex-direction: column;

  gap: 0.5rem;
}

.History {
  &-Title {
    padding: 1rem 0;
    font-size: 24px;

    font-weight: 600;
    text-align: center;
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
    background-color: var(--el-bg-color-page);
  }

  .expand & {
    margin-left: 0;

    width: 260px;

    opacity: 1;
    transform: translateX(0);
  }
  z-index: 10;
  position: relative;
  margin-left: -1px;

  width: 0;

  height: 100%;

  opacity: 0;
  transform: translateX(-100%);
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  transition:
    0.5s width cubic-bezier(0.785, 0.135, 0.15, 0.86),
    0.5s opacity cubic-bezier(0.785, 0.135, 0.15, 0.86),
    0.25s transform cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
</style>
