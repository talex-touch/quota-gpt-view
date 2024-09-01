<script setup lang="ts">
import ThChat from '~/components/chat/ThChat.vue'
import ThInput from '~/components/input/ThInput.vue'
import History from '~/components/history/index.vue'
import type { ThHistory } from '~/components/history/history'
import { chatManager } from '~/composables/chat'
import ShareSection from '~/components/chat/ShareSection.vue'
import { inputProperty } from '~/components/input/input'
import { getTargetPrompt } from '~/composables/api/chat'
import { $chat } from '~/composables/aigc/completion'
import type { IChatConversation } from '~/composables/api/base/v1/chat.type.d.ts'

definePageMeta({
  layout: 'default',
  pageTransition: {
    name: 'slide',
  },
})

const chatOptions = reactive<{
  conversation: IChatConversation
}>({
  conversation: $chat.emptyHistory(),
})

function handleSend() {

}
</script>

<template>
  <div :class="{ expand: false }" class="PageContainer">
    <div class="PageContainer-Main">
      <AigcAiChat v-model="chatOptions.conversation" />

      <ThInput
        :template-enable="!chatOptions.conversation.messages.length"
        :status="Status.AVAILABLE"
        :hide="false"
        @send="handleSend"
      />

      <ChoreVersionBar />
    </div>
  </div>
</template>

<style lang="scss">
.PageContainer {
  &-Main {
    z-index: 2;
    position: relative;

    flex: 1;
    width: 100%;
    height: 100%;
  }

  &-History {
    &::before {
      z-index: -2;
      content: '';
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      opacity: 0.5;
      filter: blur(18px);
      background-size: cover;
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

    z-index: 3;
  }

  position: absolute;
  display: flex;

  width: 100%;
  height: 100%;

  top: 0;
  left: 0;

  overflow: hidden;

  // background-color: red;
}
</style>
