<script setup lang="ts">
import HistoryItem from './HistoryItem.vue'
import type { DisplayHistory, ThHistory } from './history'

const props = defineProps<{
  title: string
  selectIndex: number
  history: DisplayHistory[]
}>()

const emits = defineEmits<{
  (e: 'select', index: number): void
  (e: 'delete', index: number): void
}>()

const { selectIndex } = useVModels(props, emits)

const _history = useVModel(props, 'history', emits)
</script>

<template>
  <div class="HistorySection">
    <p>{{ title }}</p>

    <div class="History-ContentHolder">
      <div
        v-for="item in _history"
        :key="item.id"
        v-wave
        :class="{ active: selectIndex === item.index }"
        class="History-Content-Item"
        @click="selectIndex = item.index"
      >
        <HistoryItem :model-value="item" @delete="emits('delete', $event)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.HistorySection {
  p {
    margin: 0.75rem 0 0.5rem;
    padding: 0 0.5rem;

    font-weight: 600;
    color: var(--el-text-color-secondary);
  }
}

.History-ContentHolder {
  display: flex;
  flex-direction: column;

  gap: 0.5rem;
}

.th-zoom-enter-from,
.th-zoom-leave-to {
  transform: scale(0);
}

.History-Content-MenuWrapper {
  &.el-popover.el-popper {
    box-shadow: none !important;
    background: none !important;
    border: none !important;
  }

  user-select: none;
  // transform: scale(0);

  transform-origin: left top;

  transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
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

    cursor: pointer;
    user-select: none;
  }
  position: absolute;
  padding: 0.5rem;
  display: flex;

  flex-direction: column;

  gap: 0.5rem;
  top: 0;
  left: 0;

  width: max-content;
  height: max-content;

  border-radius: 16px;
  box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
  // backdrop-filter: blur(18px) saturate(180%);
}

.History-Content {
  &-Fixed {
    &:hover {
      background-color: #ffffff30;
    }
    z-index: 20;
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
      color: var(--el-text-color-primary);
      background-color: var(--el-color-primary-light-5);
    }
    position: relative;
    padding: 0.5rem 0.5rem;

    min-height: 32px;

    font-size: 14px;
    cursor: pointer;
    border-radius: 12px;
    color: var(--el-text-color-regular);
    // background-color: var(--el-bg-color-page);
  }
}
</style>
