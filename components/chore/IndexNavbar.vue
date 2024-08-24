<script setup lang="ts">
import AnimateIcon from '../icon/AnimateIcon.vue'

const route = useRoute()
</script>

<template>
  <div class="IndexNavBar">
    <AnimateIcon :active="route.name === 'index'" @click="$router.push('/')">
      <IconSvgChatSvg />
    </AnimateIcon>
    <AnimateIcon :active="route.name === 'prompt_role'" @click="$router.push('/prompt_role')">
      <IconSvgCaseSvg />
    </AnimateIcon>
    <AnimateIcon :active="route.name === 'guide'" @click="$router.push('/guide')">
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
