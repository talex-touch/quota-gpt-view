<script setup lang="ts">
import Login from '~/components/chore/Login.vue'
import { appName } from '~/constants'
import 'element-plus/theme-chalk/dark/css-vars.css'

useHead({
  title: appName,
})

const pageOptions = reactive({
  model: {
    login: false,
  },
})

provide('pageOptions', pageOptions)
</script>

<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <Login v-model:show="pageOptions.model.login" />
</template>

<style>
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
