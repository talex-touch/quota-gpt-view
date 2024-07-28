<script setup lang="ts">
import Login from '~/components/chore/Login.vue'
import { appName } from '~/constants'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { setWallpaper, themeOptions, wallpapers } from './composables/theme/colors'

useHead({
  title: appName,
})

const pageOptions = reactive({
  model: {
    login: false,
  },
})

onMounted(() => {
  if (themeOptions.value.theme) {
    const wallpaper = wallpapers.find((item: any) => item.id === themeOptions.value.theme)

    wallpaper && setWallpaper(wallpaper)
  }
})

provide('appOptions', pageOptions)
</script>

<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

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
