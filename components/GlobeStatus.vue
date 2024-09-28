<script setup lang="ts">
import { $endApi } from '~/composables/api/base'

const online = useOnline()
const status = ref(true)

// 检测后端接口 如果无法使用则直接提示
async function detectEndStatus() {
  if (!online.value)
    return status.value = false

  // 为了避免每次弹窗打扰用户使用
  status.value = true

  const res = await $endApi.v1.common.status()

  status.value = res?.data?.message === 'OK'
}

let lastSave = ''

function saveConfig() {
  if (!userStore.value.isLogin)
    return

  const obj = JSON.stringify(userStore.value)

  if (obj !== lastSave) {
    lastSave = obj
    saveUserConfig()

    console.log('save user config')
  }
}

onMounted(() => {
  detectEndStatus()

  /* const { pause, resume, isActive } =  */useIntervalFn(saveUserConfig, 15000)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden')
      saveConfig()
  })
})
watch(() => online.value, detectEndStatus)
</script>

<template>
  <div class="GlobeStatus" :class="{ display: status }">
    <div v-for="i in 4" :key="i" :class="`item-${i}`" class="item" />

    <div class="Mentions">
      <span v-if="online">
        系统服务器正在维护中，请关注官方QQ群了解更多：635268678
      </span>
      <span v-else>
        请连接互联网使用！
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.GlobeStatus {
  .Mentions {
    z-index: 100;
    position: absolute;

    top: 50%;
    left: 50%;

    width: max-content;
    height: 100px;

    font-size: 24px;
    font-weight: 600;
    color: var(--el-color-danger);
    transition: 0.25s;
    transform: translate(-50%, -50%) scale(1);
    animation: q_shining 1s infinite linear;
  }

  &.display {
    .Mentions {
      transform: translate(-50%, -50%) scale(0);
    }

    .item-1 {
      right: -100%;
      bottom: -100%;
    }

    .item-2 {
      top: -100%;
      right: -100%;
    }

    .item-3 {
      left: -100%;
      bottom: -100%;
    }

    .item-4 {
      top: -100%;
      left: -100%;
    }

    pointer-events: none;
    backdrop-filter: blur(0);
  }

  .item-1 {
    right: 0;
    bottom: 0;
  }

  .item-2 {
    top: 0;
    right: 0;
  }

  .item-3 {
    left: 0;
    bottom: 0;
  }

  .item-4 {
    top: 0;
    left: 0;
  }

  .item {
    position: absolute;

    width: 50%;
    height: 50%;

    opacity: 0.75;
    background-color: var(--el-bg-color-overlay);
    transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  z-index: 1000;
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  // color: var(--el-color-danger);
  backdrop-filter: blur(18px);
  transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
</style>
