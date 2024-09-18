<script setup lang="ts">
import type { IInnerItemMeta } from '~/composables/api/base/v1/aigc/completion-types'

const props = defineProps<{
  data: any
  value: any
}>()
</script>

<template>
  <div class="Imagable">
    <div class="Imagable-Inner">
      <div
        class="Imagable-Inner-Back bg-radial [animation-delay:.7s] h-14 w-14 animate-spin rounded-full bg-gradient-to-tr"
      >
        <div class="spinner">
          <div class="spinner1" />
        </div>
      </div>

      <div class="Imagable-Inner-Img">
        <img :src="value.output" :alt="data.arguments?.text || 'QuotaGenImage'">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes rotate {
  0% {
    opacity: 0.75;

    transform: rotate(0deg);
    filter: blur(100px) saturate(180%);
  }

  50% {
    opacity: 1;

    transform: rotate(180deg);
    filter: blur(50px) saturate(180%);
  }

  100% {
    opacity: 0.75;

    transform: rotate(360deg);
    filter: blur(100px) saturate(180%);
  }
}

.Imagable {
  &-Inner {
    &-Img {
      .done & {
        opacity: 1;

        filter: blur(0px);
        transform: scale(1);
      }
      z-index: 1;
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      opacity: 0;
      filter: blur(50px);
      transform: scale(1.25);
      transition: 0.5s 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    &-Back {
      .done & {
        opacity: 0 !important;
      }
      position: absolute;
      display: flex;

      align-items: center;
      justify-content: center;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      animation: rotate 2s linear infinite;

      background-color: var(--el-bg-color);
      background-image: conic-gradient(
        from 0deg,
        violet,
        indigo 30%,
        blue 50%,
        green 60%,
        yellow 70%,
        orange 80%,
        red 100%
      );
    }
  }

  position: relative;
  margin-bottom: 0.5rem;

  width: 20rem;
  height: 20rem;

  overflow: hidden;
  border-radius: 8px;
}

.spinner {
  background-image: linear-gradient(rgb(186, 66, 255) 35%, rgb(0, 225, 255));
  width: 100px;
  height: 100px;
  animation: spinning82341 1.7s linear infinite;
  text-align: center;
  border-radius: 50px;
  filter: blur(10px);
  box-shadow:
    0px -5px 20px 0px rgb(186, 66, 255),
    0px 5px 20px 0px rgb(0, 225, 255);
}

.spinner1 {
  background-color: var(--el-bg-color-page);
  width: 100px;
  height: 100px;
  border-radius: 50px;
  filter: blur(10px);
}

@keyframes spinning82341 {
  to {
    transform: rotate(360deg);
  }
}
</style>
