<script setup lang="ts">
import AnimateIcon from '../icon/AnimateIcon.vue'

const select = ref(0)
</script>

<template>
  <div class="IndexNavBar">
    <AnimateIcon :active="select === 0" @click="select = 0">
      <IconSvgChatSvg />
    </AnimateIcon>
    <AnimateIcon :active="select === 1" @click="select = 1">
      <IconSvgCaseSvg />
    </AnimateIcon>
    <AnimateIcon :active="select === 2" @click="select = 2">
      <IconSvgDocSvg />
    </AnimateIcon>
    <AnimateIcon v-if="userStore.isAdmin" @click="$router.push('/cms')">
      <IconSvgCopSvg />
    </AnimateIcon>
  </div>
</template>

<style lang="scss">
.IndexNavBar {
  display: flex;

  gap: 2rem;
  flex-direction: column;
}
</style>
