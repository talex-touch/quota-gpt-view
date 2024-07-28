<script setup lang="ts">
import ShiningButton from '~/components/button/ShiningButton.vue'
import TextShaving from '~/components/other/TextShaving.vue'

definePageMeta({
  layout: 'personal',
})
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <p class="title">
        外观设置
      </p>
    </div>

    <div class="ProfileWrapper-Main" />

    <div class="ProfileWrapper-Footer">
      <TextShaving text="外观自定义需要高级订阅来启用" />

      <ShiningButton>
        立即订阅 PRO
      </ShiningButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
div.ProfileWrapper-Footer {
  display: flex;

  justify-content: space-between;
}

.title {
  &::before {
    z-index: -1;
    content: 'APPEARANCE';
    position: absolute;

    opacity: 0.5;

    letter-spacing: 1rem;
    font-size: 1.5rem;

    transform: translate(5rem, -0.25rem);
  }
}
</style>
