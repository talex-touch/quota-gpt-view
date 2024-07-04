<script setup lang="ts">
const online = useOnline()
</script>

<template>
  <Suspense>
    <ClientOnly>
      <main v-if="online" class="DefaultTemplate-Container">
        <slot />
      </main>
      <div v-else text-gray:80>
        你已经离线了！
      </div>
    </ClientOnly>
    <template #fallback>
      <div italic op50>
        <span animate-pulse>Loading...</span>
      </div>
    </template>
  </Suspense>
</template>

<style lang="scss">
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
