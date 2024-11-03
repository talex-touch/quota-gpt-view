<script setup lang="ts">
import HistoryItem from './HistoryItem.vue'
import type { IChatConversation } from '~/composables/api/base/v1/aigc/completion-types'

const props = defineProps<{
  title: string
  select: string
  history: IChatConversation[]
}>()

const emits = defineEmits<{
  (e: 'update:select', index: string): void
  (e: 'delete', index: string): void
}>()

const route = useRoute()
const router = useRouter()

const { select } = useVModels(props, emits)

watchEffect(() => {
  router.replace({
    query: {
      ...route.query,
      id: select.value || undefined,
    },
  })
})

watch(() => route, () => {
  if (!route.query?.id)
    return

  const { id } = route.query
  if (!id)
    return

  const res = [...props.history].find(item => item.id === id)
  if (!res) {
    // select.value = ''

    return
  }

  select.value = id as string
}, { immediate: true })
</script>

<template>
  <div class="HistorySection">
    <p>{{ title }}</p>

    <div class="History-ContentHolder">
      <div
        v-for="item in history"
        :key="item.id"
        v-wave
        :class="{ active: select === item.id }"
        class="History-Content-Item"
        @click="select = item.id"
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

    top: var(--history-title-height);

    margin: 0.75rem 0 0.5rem;
    padding: 0.5rem 1.5rem;

    font-weight: 600;
    color: var(--el-text-color-primary);

    // background: var(--el-bg-color);
    background-size: 4px 4px;
    background-image: radial-gradient(
      transparent 1px,
      var(--wallpaper-color-light, var(--el-bg-color-page)) 1px
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
  // background-color: var(--el-bg-color);
  // backdrop-filter: blur(18px) saturate(180%);
}
</style>
