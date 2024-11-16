<script setup lang="ts">
import { models } from './model'

const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const model = useVModel(props, 'modelValue', emits)

const curSelect = computed(() => models.find(item => item.key === model.value))
</script>

<template>
  <div class="ModelSelector">
    <span class="model-name" :class="[curSelect!.key]">
      <img :src="curSelect!.img">{{ curSelect!.name }}
      <div i-carbon-chevron-up />
    </span>

    <div class="ModelSelector-Selections">
      <p m-4 mb-0 class="title">
        模型差异
      </p>

      <ModelInner v-model="model" />
    </div>
  </div>
</template>

<style lang="scss">
.ModelSelector {
  &::before {
    z-index: -1;
    content: '';
    position: absolute;

    top: -100vh;
    left: -100vw;

    width: 200vw;
    height: 200vh;

    opacity: 0;

    transition: 0.25s 0.5s;
    transform: scale(0);
    background-color: var(--el-overlay-color);
  }

  &:hover {
    .model-name div {
      transform: rotate(180deg);
    }

    cursor: pointer;
  }

  .model-name {
    img {
      width: 24px;
      height: 24px;
    }

    &.this-normal-turbo {
      color: #348475;
      font-weight: 600;
      // text-shadow: 0 0 2px #348475;
    }
    &.this-normal-ultra {
      color: #9b5122;
      font-weight: 600;
      // text-shadow: 0 0 2px #348475;
    }
    div {
      transition: 0.25s;
    }
    display: flex;

    gap: 0.5rem;
    align-items: center;
  }

  &:hover {
    .ModelSelector-Selections {
      transform: scale(1) translate(var(--translate));
    }
  }

  &-Selections {
    .wallpaper & {
      background-color: var(--el-mask-color-extra-light);
      backdrop-filter: blur(18px) saturate(180%);
    }
    z-index: 1;
    position: absolute;
    margin: 1rem 0;

    top: 20px;
    right: 0;

    width: 280px;
    height: 300px;
    max-width: 85vw;
    overflow: hidden;

    .mobile & {
      height: 155px;

      --translate: 1.5rem, 0;
    }

    --translate: 0, 0;

    border-radius: 16px;
    transform: scale(0) translate(var(--translate));
    transform-origin: right top;
    box-shadow: var(--el-box-shadow);

    background-color: var(--el-bg-color);
    transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  .mobile & {
    font-size: 14px;
  }
  position: relative;

  top: 0;
  right: 0;

  user-select: none;
}
</style>
