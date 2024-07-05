<script setup lang="ts">
import type { DisplayHistory } from './history'

const props = defineProps<{
  modelValue: DisplayHistory
}>()

const emits = defineEmits<{
  (e: 'delete', index: number): void
  (e: 'title', title: string): void
}>()

const updateConversationTopic: Function = inject('updateConversationTopic')!

const editMode = ref(false)
const input = ref()
const topic = ref()
watch(
  () => topic.value,
  (val) => {
    updateConversationTopic(props.modelValue.index, val)
  },
)
const menus = reactive([
  {
    name: '编辑标题',
    icon: 'i-carbon-edit',
    trigger: () => {
      topic.value = props.modelValue.topic
      editMode.value = true

      setTimeout(() => input.value?.focus())
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
    trigger: (ind: number) => {
      emits('delete', ind)
    },
  },
])
</script>

<template>
  <div class="HistoryItem" :class="{ edit: editMode }">
    <input
      v-if="editMode"
      ref="input"
      v-model="topic"
      @blur="editMode = false"
      @keydown.enter="editMode = false"
    >
    <span v-else class="content">{{ modelValue.topic }}</span>
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
              :class="{ danger: menu.danger }"
              class="History-Content-Menu-Item"
              @click.stop="menu.trigger(modelValue.index)"
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
