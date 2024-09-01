<script setup lang="ts">
import dayjs from 'dayjs'

const version = computed(() => {
  const time = dayjs(__BuildTime__).format('YY.MM.DD')
  const sha = __THISAI_VERSION__

  return `${time}-${sha}`
})
</script>

<template>
  <div class="VersionBar">
    <span>ThisAI 可能会犯错，生成的内容仅供参考。</span>
    <span float-right mr-4>
      {{ version }}
    </span>
  </div>
</template>

<style lang="scss">
.mobile .VersionBar {
  position: absolute;

  left: 50%;

  bottom: 1rem;

  transform: translateX(-50%) scale(0.75);
}

.VersionBar {
  z-index: 3;
  position: absolute;

  left: 50%;

  bottom: 0.5rem;
  width: 100%;

  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;
  transform: translateX(-50%);

  mix-blend-mode: difference;
  // background: var(--el-bg-color-page);
}
</style>
