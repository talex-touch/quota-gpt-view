<script setup lang="ts">
import type { IBannerGroup } from '~/composables/api/base/index.type'

const props = defineProps<{
  modelValue: IBannerGroup[]
  select: number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: IBannerGroup[]): void
  (e: 'update:select', data: number): void
}>()

const _select = useVModel(props, 'select', emits)
const bannerList = useVModel(props, 'modelValue', emits)
</script>

<template>
  <div class="BannerList">
    <div v-wave class="BannerList-Item active">
      <div i-carbon:plus />新增横幅组
    </div>

    <div
      v-for="banner in bannerList" :key="banner.id" v-wave :class="{ active: _select === banner.id }"
      class="BannerList-Item" @click="_select = banner.id!"
    >
      {{ banner.name }}
    </div>
  </div>
</template>

<style lang="scss">
.BannerList {
  display: flex;
  padding: 1rem;

  gap: 1rem;
  flex-direction: column;

  &-Item {
    &.active {
      color: #fff;
      background-color: var(--el-color-primary);
    }
    padding: 0.5rem;

    cursor: pointer;
    font-size: 18px;
    user-select: none;
    border-radius: 12px;
    background-color: var(--el-bg-color);
  }
}
</style>
