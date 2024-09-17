<script setup lang="ts">
import dayjs from 'dayjs'

const version = computed(() => {
  const time = dayjs(__BuildTime__).format('YY.MM.DD')
  const sha = __THISAI_VERSION__

  return `${time}-${sha}`
})
</script>

<template>
  <span class="VersionBar">
    <!-- <span float-right mr-4> -->
    {{ version }}
    <!-- </span> -->
  </span>
</template>

<style lang="scss">
// .mobile .VersionBar {
//   position: absolute;

//   left: 50%;

//   bottom: 1rem;

//   transform: translateX(-50%) scale(0.75);
// }

.VersionBar {
  display: flex;

  align-items: center;

  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;

  // mix-blend-mode: difference;
  // background: var(--el-bg-color-page);
}
</style>
