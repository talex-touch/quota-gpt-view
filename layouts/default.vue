<script setup lang="ts">
const online = useOnline()
</script>

<template>
  <Suspense>
    <ClientOnly>
      <main class="DefaultTemplate-Container">
        <slot />

        <div class="Offline" :class="{ display: online }">
          <div v-for="i in 4" :key="i" :class="`item-${i}`" class="item" />

          <div class="Mentions">
            请连接互联网使用！
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
 @keyframes shining {
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
    animation: shining 1s infinite linear;
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
  position: absolute;
  display: flex;

  align-items: center;
  flex-direction: column;
  justify-content: center;

  width: 100%;
  height: 100%;

  background-color: var(--el-bg-color);
}
</style>
