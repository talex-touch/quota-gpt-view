<script setup lang="ts">
import AnimateIcon from '~/components/icon/AnimateIcon.vue'
import UserAccountAvatar from '~/components/personal/UserAccountAvatar.vue'
import IndexNavbar from '~/components/chore/IndexNavbar.vue'
import { $endApi } from '~/composables/api/base'

const online = useOnline()
const status = ref(false)

// 检测后端接口 如果无法使用则直接提示
async function detectEndStatus() {
  if (!online.value)
    return status.value = false

  // 为了避免每次弹窗打扰用户使用
  status.value = true

  const res = await $endApi.v1.common.status()

  status.value = res?.data?.message === 'OK'
}

onMounted(detectEndStatus)
watch(() => online.value, detectEndStatus)

// const content = computed(() => {
//   if (userStore.value.isLogin) {
//     return [
//       'ThisAI Beta',
//       `${userStore.value.nickname}`,
//     ]
//   }
//   return ['ThisAI Beta',
//   ]
// })
</script>

<template>
  <!-- 包裹可能异步加载的内容，并定义加载时的备选UI。 -->
  <Suspense>
    <ClientOnly>
      <main class="DefaultTemplate-Container">
        <el-aside>
          <div class="Navbar-Header">
            <div class="LogoContainer">
              <ChoreLogo />
              <span>科塔智爱</span>
            </div>

            <IndexNavbar my-4 />
          </div>

          <div class="Navbar-Footer">
            <AnimateIcon>
              <IconSvgQuesSvg />
            </AnimateIcon>
            <AnimateIcon style="color: #D8A972">
              <IconSvgStartSvg />
            </AnimateIcon>

            <UserAccountAvatar mt-4 />
          </div>
        </el-aside>
        <el-main>
          <router-view v-slot="{ Component }">
            <transition name="slide">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>

        <div class="Offline" :class="{ display: status }">
          <div v-for="i in 4" :key="i" :class="`item-${i}`" class="item" />

          <div class="Mentions">
            <span v-if="online">
              无法连接至远程服务器！
            </span>
            <span v-else>
              请连接互联网使用！
            </span>
          </div>
        </div>
      </main>
    </ClientOnly>
    <template #fallback>
      <div italic op50>
        <span animate-pulse>Loading...</span>
      </div>
    </template>
  </Suspense>
</template>

<style lang="scss">
.slide-enter-active,
.slide-leave-active {
  position: absolute;

  width: 100%;

  transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.slide-enter-active {
  z-index: 10;

  transition: 0.5s 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
}

.slide-enter-from {
  position: absolute !important;

  opacity: 0;

  width: 100%;

  transform: translateY(-1%);
}

.slide-leave-to {
  position: absolute !important;

  opacity: 0;

  transform: translateY(1%);
}

.Navbar-Header,
.Navbar-Footer {
  display: flex;
  flex-direction: column;

  gap: 1rem;
  align-items: center;

  .el-avatar {
    box-shadow: 0 0 12px 2px var(--plan-color);

    animation: shining_shadow 5s infinite linear;
  }
}

@keyframes shining_shadow {
  0%,
  100% {
    box-shadow: 0 0 4px 2px var(--plan-color);
  }

  50% {
    box-shadow: 0 0 16px 4px var(--plan-color);
  }
}

.LogoContainer {
  span {
    position: absolute;

    font-size: 12px;
    bottom: 1.25rem;

    font-weight: 600;
    transform: scale(0.9);
  }

  position: relative;
  padding: 1rem 0;
  display: flex;

  height: calc(65px + 2rem);

  flex-direction: column;

  border-bottom: 1px solid var(--el-border-color);
}

@keyframes q_shining {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

.Offline {
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

.DefaultTemplate-Container {
  & > .el-aside {
    &::before {
      z-index: -2;
      content: '';
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      // opacity: 0.5;
      background-size: cover;
      filter: blur(18px) saturate(180%);
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

      opacity: 0.85;
      background-color: var(--el-bg-color);
    }

    position: relative;
    padding: 1rem 0.5rem;
    z-index: 2;
    display: flex;

    align-items: center;
    flex-direction: column;
    justify-content: space-between;

    width: 64px;
    height: 100%;

    overflow: hidden;
    box-sizing: border-box;
    background-color: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color);
  }

  & > .el-main {
    z-index: 1;
    position: relative;
    display: flex;

    flex: 1;

    width: 100%;
    height: 100%;

    align-items: center;
    flex-direction: column;
    justify-content: center;

    overflow: hidden;
  }

  position: absolute;
  display: flex;

  width: 100%;
  height: 100%;

  background-color: var(--el-bg-color);
}
</style>
