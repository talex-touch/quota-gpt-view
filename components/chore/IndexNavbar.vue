<script setup lang="ts">
import AnimateIcon from '../icon/AnimateIcon.vue'

const route = useRoute()
const router = useRouter()

async function push(path: string) {
  await router.push(path)
  await router.push(path)
}
</script>

<template>
  <div class="IndexNavBar">
    <AnimateIcon :active="route.name === 'index'" @click="push('/')">
      <IconSvgChatSvg />
    </AnimateIcon>
    <AnimateIcon :active="route.name === 'prompt_role'" @click="push('/prompt_role')">
      <IconSvgCaseSvg />
    </AnimateIcon>
    <AnimateIcon :active="route.name === 'guide'" @click="push('/guide')">
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
