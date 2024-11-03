<script setup lang="ts">
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/vue'
import PopoverComp from '../template/PopoverComp.vue'
import { type IChatConversation, PersistStatus } from '~/composables/api/base/v1/aigc/completion-types'
import { $historyManager } from '~/composables/api/base/v1/aigc/history'

const props = defineProps<{
  modelValue: IChatConversation
}>()

const emits = defineEmits<{
  (e: 'delete', index: string): void
}>()

const editMode = ref(false)
const input = ref()
const topic = ref()

const hover = ref(false)
const hoverMode = debouncedRef(hover, 50)
const reactiveConversation = computed(() => $historyManager.options.list.get(props.modelValue.id) || null)

watch(
  () => topic.value,
  (val) => {
    if (reactiveConversation.value) {
      reactiveConversation.value.topic = val
      reactiveConversation.value.sync = PersistStatus.MODIFIED
    }
  },
)
const menus = reactive([
  {
    name: '复制标题',
    icon: 'i-carbon-copy',
    trigger: () => {
      navigator.clipboard.writeText(props.modelValue.topic)

      ElMessage({
        message: '标题已成功复制到剪贴板！',
        grouping: true,
        type: 'success',
        plain: true,
      })
    },
  },
  {
    name: '编辑标题',
    icon: 'i-carbon-edit',
    trigger: () => {
      if (!reactiveConversation.value) {
        ElMessage({
          message: '无法修改目标记录!',
          grouping: true,
          type: 'error',
          plain: true,
        })
        return
      }

      topic.value = props.modelValue.topic
      editMode.value = true

      setTimeout(() => input.value?.focus(), 200)
    },
  },
  {
    name: '分享记录',
    icon: 'i-carbon-share',
    trigger: () => { },
  },
  {
    type: 'divider',
  },
  {
    name: '删除记录',
    icon: 'i-carbon-close',
    danger: true,
    trigger: (id: string) => {
      emits('delete', id)
    },
  },
])

const itemLine = ref()
const itemFloating = ref()

const { floatingStyles } = useFloating(itemLine, itemFloating, {
  middleware: [offset(10), flip()],
  whileElementsMounted: autoUpdate,
})
</script>

<template>
  <div
    class="HistoryItem" :class="{ edit: editMode }"
  >
    <div class="content-wrapper">
      <input v-if="editMode" ref="input" v-model="topic" @blur="editMode = false" @keydown.enter="editMode = false">
      <span v-else class="content">{{ modelValue.topic }}</span>
    </div>
    <div
      ref="itemLine" class="History-Content-Fixed" @mouseenter="hoverMode = hover = true"
      @mouseleave="hover = false"
    >
      <div class="i-carbon:overflow-menu-horizontal" />
    </div>
  </div>

  <teleport to="#teleports">
    <div
      ref="itemFloating" :class="{ hover: hoverMode }" :style="floatingStyles" class="History-Content-MenuWrapper"
      @mouseenter="hoverMode = hover = true" @mouseleave="hover = false"
    >
      <div class="History-Content-Menu fake-background">
        <div
          v-for="menu in menus" :key="menu.name" v-wave
          :class="{ divider: menu.type === 'divider', danger: menu.danger }" class="History-Content-Menu-Item"
          @click.stop="menu.trigger(modelValue.id)"
        >
          <template v-if="menu.type === 'divider'">
            <el-divider />
          </template>
          <template v-else>
            <div :class="menu.icon" />
            <span v-html="menu.name" />
          </template>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style lang="scss">
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
    .content-wrapper {
      display: flex;

      width: 85%;

      // 截断
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      .privacy & {
        filter: blur(5px);
      }
    }

    .privacy &:hover .content-wrapper {
      filter: blur(0);
    }

    input {
      width: 100%;
      background: #0000;

      &:focus-visible {
        border: none;
        outline: none;
      }
    }

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
    // display: flex;

    padding: 0.5rem 0.5rem;

    min-height: 32px;
    // width: 100%;

    font-size: 14px;
    cursor: pointer;
    border-radius: 12px;
    color: var(--el-text-color-regular);
    // background-color: var(--el-bg-color-page);
  }
}

.History-Content-MenuWrapper {
  z-index: 3;

  height: 165px;

  user-select: none;
}

.History-Content-Menu {
  .hover & {
    opacity: 1;
    pointer-events: all;
    transform: scale(1) translateY(0);
  }

  opacity: 0;
  transform: scale(0.9) translateY(10%);
  transition: cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.35s;
  transform-origin: center 10%;

  --fake-opacity: 0.5;
  pointer-events: none;
  background-color: transparent;
  backdrop-filter: blur(18px) saturate(180%);

  overflow: hidden;
}

.History-Content-Menu-Item.divider {
  padding: 0;
  height: auto;

  .el-divider--horizontal {
    margin: 0;
  }

  &:hover {
    background-color: none;
  }
}
</style>
