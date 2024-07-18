<script setup lang="ts">
import Login from '~/components/chore/Login.vue'
import { appName } from '~/constants'
import 'element-plus/theme-chalk/dark/css-vars.css'

const color = useColorMode()

useHead({
  title: appName,
})

const pageOptions = reactive({
  model: {
    login: false,
  },
})

const font = reactive({
  color: 'rgba(0, 0, 0, .15)',
})

watch(
  color,
  () => {
    font.color = color.value === 'dark'
      ? 'rgba(255, 255, 255, .15)'
      : 'rgba(0, 0, 0, .15)'
  },
  {
    immediate: true,
  },
)

const content = computed(() => userStore.value.token ? [userStore.value.nickname, 'ThisAI Beta'] : ['Visitor', 'ThisAI Beta'])

provide('appOptions', pageOptions)
</script>

<template>
  <VitePwaManifest />
  <el-watermark :font="font" :z-index="10" class="watermark" :content="content as any">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </el-watermark>

  <Login v-model:show="pageOptions.model.login" />
</template>

<style>
.watermark {
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}

html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;

  overflow: hidden;
}

html.dark {
  background: #222;
  color: white;
}
</style>
