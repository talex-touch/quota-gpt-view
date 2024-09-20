<script setup lang="ts">
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
    trigger: () => {},
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
</script>

<template>
  <div class="HistoryItem" :class="{ edit: editMode }">
    <span class="content-wrapper">
      <input
        v-if="editMode"
        ref="input"
        v-model="topic"
        @blur="editMode = false"
        @keydown.enter="editMode = false"
      >
      <span v-else class="content">{{ modelValue.topic }}</span></span>
    <div class="History-Content-Fixed">
      <el-popover
        transition="th-zoom"
        :show-arrow="false"
        popper-class="History-Content-MenuWrapper"
        placement="bottom-start"
        :width="200"
        trigger="hover"
      >
        <template #reference>
          <div class="i-carbon:overflow-menu-horizontal" />
        </template>
        <div class="History-Content-MenuWrapper">
          <div class="History-Content-Menu">
            <div
              v-for="menu in menus"
              :key="menu.name"
              v-wave
              :class="{ danger: menu.danger }"
              class="History-Content-Menu-Item"
              @click.stop="menu.trigger(modelValue.id)"
            >
              <div :class="menu.icon" />
              <span v-html="menu.name" />
            </div>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<style lang="scss">
.HistoryItem {
  .content-wrapper {
    // &::after {
    //   content: '';
    //   position: absolute;

    //   top: 10%;
    //   right: calc(32px + 0.25rem);

    //   height: 80%;
    //   width: 80px;

    //   background: linear-gradient(to left, #0000, #0000);
    // }
    // &:hover::after {
    //   background: linear-gradient(
    //     to left,
    //     var(--wallpaper-color-light, var(--el-bg-color)),
    //     #0000
    //   );
    // }
    // .active &::after {
    //   --wallpaper-color-light: #0000;

    //   background: linear-gradient(
    //     to left,
    //     var(--wallpaper-color-light, var(--el-color-primary-light-5)),
    //     #0000
    //   );
    // }

    display: block;

    width: 85%;

    // 截断
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  input {
    width: 100%;
    background: #0000;

    &:focus-visible {
      border: none;
      outline: none;
    }
  }
}
</style>
