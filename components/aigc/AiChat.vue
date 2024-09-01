<script setup lang="ts">
import EmptyGuide from '../chat/EmptyGuide.vue'
import type { IChatConversation } from '~/composables/api/base/index.type'

const props = defineProps<{
  modelValue: IChatConversation
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: IChatConversation): void
}>()

const scrollbar = ref()
const conversation = useVModel(props, 'modelValue', emits)
</script>

<template>
  <div class="MainChat">
    <div class="MainChat-Container">
      <el-scrollbar ref="scrollbar">
        <div v-if="false" class="ThChat-Container-Wrapper">
          <ChatItem
            v-for="(message, ind) in messageBubbles" :key="message.id" :ind="ind"
            :total="messages.messages.length" :item="message" :share="options.share.enable"
            :select="options.share.selected" @select="handleSelectShareItem"
          />

          <div v-if="!options.share.enable && roundLimit" class="TrChat-RateLimit">
            为了避免恶意使用，你需要登录来解锁聊天限制！
          </div>
        </div>

        <EmptyGuide :show="!!conversation.messages?.length" />

        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
      </el-scrollbar>
    </div>
    <slot />
  </div>
</template>

<style lang="scss">
.MainChat-Container {
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}

.MainChat {
  &::before {
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.5;
    background-size: cover;
    background-image: var(--wallpaper);
  }

  &::after {
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.25;
    background-color: var(--el-bg-color-page);
  }

  position: relative;
  padding: 1rem 1.25rem;

  top: 0%;
  left: 0%;

  width: 100%;
  height: 100%;
  overflow: hidden;

  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
}
</style>
