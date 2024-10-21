<script setup lang="ts">
import { useNow } from '@vueuse/core'
import { api as viewerApi } from 'v-viewer'
import type { IInnerItemMeta } from '~/composables/api/base/v1/aigc/completion-types'

const props = defineProps<{
  data: any
  value: any
  isEnd: boolean
  timeCost: number
}>()

const start = Date.now()
const { now, pause } = useNow({ controls: true })

// 获得圆环进度
// 只要没到10秒 就会慢慢走到90% 直到90% 时间越长速度越慢
const progress = computed(() => {
  if (props.isEnd) {
    pause()

    return 100
  }

  const duration = (now.value.getTime() - start)

  if (duration <= 1000)
    return 5

  if (duration <= 3000)
    return 10

  if (duration <= 5000)
    return 30

  if (duration <= 7000)
    return 35

  if (duration <= 8000)
    return 40

  if (duration <= 8500)
    return 50

  if (duration <= 10000)
    return 60

  if (duration <= 12500)
    return 75

  if (duration <= 14000)
    return 80

  if (duration <= 18000)
    return 85

  return 90/* Math.min(Math.max(Math.round(start / duration * 90), 10), 90) */
})

const image = computed(() => {
  const value = props.value

  const src = value.output || value.output_clearly || value.output_default || value.output_prettier || value.output1 || value.output2 || value.output3 || value.output4 || value.output5

  return src
})

function handleViewImage(src: string) {
  if (!props.isEnd)
    return

  viewerApi({ images: [src] })
}

function handleError() {
  console.warn('Image Error', props, image.value)
}
</script>

<template>
  <div class="Imagable">
    <div class="Imagable-Gen">
      <div i-carbon:image />
      <p v-if="isEnd">
        {{ data.arguments?.text || '已生成图片' }}
      </p>
      <OtherTextShaving v-else :text="data.arguments?.text || '图片生成中'" />
      <!-- var(--theme-color) -->
      <el-progress
        color="var(--el-text-color-primary)" :show-text="false" :stroke-width="2" :width="16" type="circle"
        :percentage="progress"
      />
    </div>

    <div class="Imagable-Inner">
      <div
        class="Imagable-Inner-Back bg-radial [animation-delay:.7s] h-14 w-14 animate-spin rounded-full bg-gradient-to-tr"
      >
        <div class="spinner">
          <div class="spinner1" />
        </div>
      </div>

      <div class="Imagable-Inner-Img" @click="handleViewImage(image)">
        <div v-if="!image" class="Imagable-Inner-Cover">
          无法加载图片
        </div>

        <img v-else :src="image" :alt="data.arguments?.text || 'QuotaGenImage'" @error="handleError">
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
    &-Cover {
      position: absolute;

      top: 50%;
      left: 50%;

      transform: translate(-50%, -50%);

      color: var(--el-text-color-secondary);
      font-size: 0.875rem;
      font-weight: 600;
      text-align: center;

      text-shadow: 0 0 1rem var(--el-text-color-placeholder);
    }

    &-Img {
      .done & {
        opacity: 1;

        filter: blur(0px);
        transform: scale(1);
      }

      z-index: 1;
      position: relative;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      opacity: 0;
      filter: blur(50px);
      transform: scale(1.25);
      transition: 0.5s 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
      img {
        position: relative;

        top: 0;
        left: 0;

        // width: 20rem;
        height: 20rem;

        object-fit: contain;
      }
    }

    position: relative;

    top: 0;
    left: 0;

    width: max-content;
    min-width: 20rem;
    height: 20rem;

    cursor: pointer;

    overflow: hidden;
    border-radius: 16px;
    background-color: var(--el-bg-color);

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

  &-Gen {
    padding: 0 0.25rem;
    display: flex;

    height: 32px;

    gap: 0.5rem;
    align-items: center;
  }

  position: relative;
  display: flex;

  flex-direction: column;
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
