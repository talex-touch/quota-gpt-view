<script setup lang="ts">
import { $endApi } from '~/composables/api/base'
import blocks from '~/public/backgrounds/blocks.jpg'
import earth from '~/public/backgrounds/earth.jpg'
import grass from '~/public/backgrounds/grass.jpg'

const options = reactive<any>({
  animation: false,
  dragging: false,
  upload: {
    pending: [],
  },
  index: 0,
  incTime: 0,
  duration: 3000,
  images: [blocks, earth, grass],
})

const container = ref<HTMLElement>()
const dragger = ref<HTMLElement>()
const inner = ref<HTMLElement>()

async function handleDrop(e: DragEvent) {
  e.preventDefault()

  const files = e.dataTransfer!.files

  console.log('files', files)

  for (const file of files) {
    const fileReader = new FileReader()

    const obj = reactive<any>({
      sync: false,
      reader: fileReader,
    })

    options.upload.pending.push(obj)

    fileReader.onload = function (event) {
      obj.result = event.target?.result
    }

    fileReader.readAsDataURL(file)

    // upload
    const res = await $endApi.v1.common.upload(file)
    if (res.code === 200) {
      // res.data.filename
      console.log('upload success',res.data)
    }
  }

  options.dragging = false
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function moveTo(ind: number) {
  options.animation = true
  const innerDom: HTMLElement = inner.value!

  innerDom.style.transition = '0.5s'
  innerDom.style.transform = `translate(-${ind * 100}%, 0)`

  sleep(500).then(() => options.animation = false)
}

watch(() => options.index, moveTo)

async function timer() {
  const mainDom = container.value
  if (!mainDom)
    return

  if (options.incTime !== 0) {
    options.incTime -= 100
    return
  }

  const len = options.images.length

  options.incTime = options.duration

  const innerDom: HTMLElement = inner.value!
  const index = options.index

  if (index === len - 1) {
    innerDom.style.transition = ''
    innerDom.style.transform = `translate(100%, 0)`

    await sleep(10)
    // const _ignored = mainDom.clientWidth

    options.index = 0
  }
  else {
    options.index += 1
  }
}

let dispose = false

onBeforeUnmount(() => dispose = true)

async function _timer() {
  if (dispose)
    return

  if (!options.dragging)
    await timer()

  await sleep(100)

  _timer()
}

_timer()
</script>

<template>
  <div
    ref="container" :class="{ dragging: options.dragging, animation: options.animation }"
    class="transition-cubic BannerGroup"
  >
    <div
      ref="dragger" draggable class="BannerGroup-Dragger transition-cubic" @drop="handleDrop"
      @dragover="handleDragOver" @dragenter="options.dragging = true" @dragleave="options.dragging = false"
    >
      松手以添加到组
    </div>

    <div :class="{ show: !!options.upload.pending.length }" class="BannerGroup-Badge fake-background transition-cubic">
      正在上传 {{ options.upload.pending.length }} 个文件
    </div>

    <div ref="inner" class="BannerGroup-Inner">
      <div class="BannerGroup-Item end">
        <!-- <span>{{ index }}</span> -->
        <img :src="options.images.at(-1)" :alt="`Banner${options.images.length - 1}`">
      </div>
      <div v-for="(image, index) in options.images" :id="`banner-item-${index}`" :key="index" class="BannerGroup-Item">
        <!-- <span>{{ index }}</span> -->
        <img :src="image" :alt="`Banner${index + 1}`">
      </div>
      <!-- <div class="BannerGroup-Item first">
        <img :src="options.images[0]" alt="Banner0">
      </div> -->
    </div>

    <div class="BannerGroup-Indicator">
      <!-- :style="`z-index: ${options.images.length - index}`" -->
      <div
        v-for="(_, index) in options.images" :key="index"
        cursor-pointer :class="{ active: index === options.index }" class="fake-background BannerGroup-Indicator-Item transition-cubic"
        @click="options.index = index"
      />
    </div>
  </div>
</template>

<style lang="scss">
.BannerGroup-Badge {
  &.show {
    opacity: 1;
  }
  z-index: 3;
  position: absolute;
  padding: 0.25rem 0.5rem;
  display: flex;

  align-items: center;
  justify-content: center;

  top: 1rem;
  right: 1rem;

  // color: #fff;
  font-weight: 600;
  width: max-content;
  // height: 32px;

  opacity: 0;
  overflow: hidden;
  border-radius: 12px;
  backdrop-filter: blur(18px) saturate(180%) brightness(150%);
}

.BannerGroup-Indicator {
  &-Item {
    &.active {
      width: 36px;

      border-radius: 12px;
    }

    position: relative;

    width: 12px;
    height: 12px;

    overflow: hidden;
    border-radius: 50%;
    backdrop-filter: blur(5px);
  }
  z-index: 3;
  position: absolute;
  display: flex;

  gap: 0.5rem;
  bottom: 1.5rem;

  width: 100%;

  justify-content: center;
}

.BannerGroup-Inner {
  & > div {
    &.end {
      margin-left: -100%;
    }
    position: relative;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    flex-shrink: 0;
    border-radius: 16px;

    img {
      .dragging &,
      .animation & {
        transform: scale(0.9);
      }
      width: 100%;
      height: 100%;

      object-fit: fill;

      transition: 0.25s;
      border-radius: 16px;
    }
  }

  position: absolute;
  display: flex;
  // padding: 0.5rem;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  // overflow: hidden;
  transform: scale(1);
  border-radius: 16px;
}

.BannerGroup-Dragger {
  .dragging & {
    opacity: 0.75;
  }

  z-index: 2;
  position: absolute;
  display: flex;

  align-items: center;
  justify-content: center;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  color: #eee;

  opacity: 0;
  font-weight: 600;
  border-radius: 16px;
  background-color: var(--el-overlay-color-lighter);
  // background-color: red;
}

.BannerGroup {
  &.dragging {
    // padding: 1.125rem;

    transform: scale(1.025);
  }

  position: relative;
  padding: 1rem;
  display: flex;

  width: 50%;
  // height: 300px;

  // 比例
  aspect-ratio: 16 / 9;

  overflow: hidden;
  border-radius: 16px;
  background-color: var(--el-fill-color);
}
</style>
