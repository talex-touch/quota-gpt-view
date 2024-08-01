<script setup lang="ts">
import Login from '~/components/chore/Login.vue'
import { appName, globalOptions } from '~/constants'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { setWallpaper, themeOptions, wallpapers } from '~/composables/theme/colors'

useHead({
  title: appName,
})

const pageOptions = reactive({
  model: {
    login: false,
  },
})

const globalOptionsStore = useLocalStorage('global-options', {
  url: '',
})

if (!globalOptionsStore.value.url)
  globalOptionsStore.value.url = globalOptions.getEndsUrl()

globalOptions.onUpdateUrl((url: string) => {
  globalOptionsStore.value.url = url
})

globalOptions.setEndsUrl(globalOptionsStore.value.url)

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

  <Login v-if="!userStore.token" v-model:show="pageOptions.model.login" />
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

  --theme-color: var(--wallpaper-color, var(--el-color-primary));
  --theme-color-light: var(
    --wallpaper-color-light,
    var(--el-color-primary-light-5)
  );
}

html.dark {
  background: #222;
  color: white;
}

::view-transition-new(root),
::view-transition-old(root) {
  animation: none;
}

.dark::view-transition-old(root) {
  z-index: 100;
}
</style>
