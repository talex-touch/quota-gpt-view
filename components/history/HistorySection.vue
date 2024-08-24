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

const route = useRoute()
const router = useRouter()

const { selectIndex } = useVModels(props, emits)
const _history = useVModel(props, 'history', emits)

watch(() => selectIndex.value, (ind) => {
  if (ind === -1)
    return router.push({ query: { index: '', id: '' } })

  const res = [..._history.value].find(item => item.index === ind)

  if (res)
    router.push({ query: { index: res.index, id: res.id } })
})

watch(() => route, () => {
  if (!route.query?.id)
    return

  const { id, index } = route.query
  if (!index || +index < 0)
    return

  const res = [..._history.value].find(item => item.index === +index! && item.id === id)
  if (!res) {
    router.push('/')

    return
  }

  selectIndex.value = +index!
}, { immediate: true })
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
.History-ContentHolder {
  padding: 0 1rem;
}

.HistorySection {
  p {
    z-index: 1;
    position: sticky;

    top: 70px;

    margin: 0.75rem 0 0.5rem;
    padding: 0.5rem 1.5rem;

    font-weight: 600;
    color: var(--el-text-color-primary);

    // background: var(--el-bg-color);
    background-size: 4px 4px;
    background-image: radial-gradient(
      transparent 1px,
      var(--wallpaper-color-light, var(--el-bg-color)) 1px
    );
    backdrop-filter: saturate(50%) blur(4px);

    .wallpaper & {
      background-image: none;

      backdrop-filter: blur(4px);
    }
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
    // opacity: 0.75;
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
      color: #fff;
      background-color: var(
        --wallpaper-color-light,
        var(--el-color-primary-light-5)
      );
    }
    &.active {
      color: var(--el-text-color-primary);
      background-color: var(
        --wallpaper-color-light,
        var(--el-color-primary-light-5)
      );
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
