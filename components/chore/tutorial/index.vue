<script setup lang="ts">
import Welcome from './addon/Welcome.vue'
import type { TutorialOption } from './tutorial-types'

// const props = defineProps<{
//   show: boolean
// }>()

// const emits = defineEmits<{
//   (e: 'update:show', data: boolean): void
// }>()

// const show = useVModel(props, 'show', emits)
const show = ref(false)

const main = ref<HTMLElement>()
const options = reactive<TutorialOption>({
  component: null,
  data: {},
})

async function handleNext(next: TutorialOption) {
  const el = main.value
  if (!el) {
    nextTick(() => handleNext(next))
    return
  }

  if (next.data?.tour) {
    show.value = false
    return
  }
  else { show.value = true }

  el.style.opacity = '0'
  await sleep(200)

  if (!next.component) {
    userConfig.value.pri_info.info.tutorial = true

    saveUserConfig()

    show.value = false

    return
  }

  options.component = next.component
  Object.assign(options.data, next.data)

  await sleep(200)
  el.style.opacity = '1'
}

onMounted(() => {
  handleNext({
    component: Welcome,
    data: {},
  })

  watchEffect(() => {
    const tutorial = userConfig.value.pri_info.info.tutorial

    show.value = !tutorial
  })
})

provide('handleNext', handleNext)
</script>

<template>
  <div :class="{ show }" class="Tutorial">
    <div class="TutorialMain">
      <div ref="main" class="TutorialInner transition-cubic">
        <component :is="options.component" v-if="options.component" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.TutorialInner {
  position: absolute;
  padding: 2rem;
  display: flex;

  align-items: center;
  justify-content: center;
  flex-direction: column;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}

.Tutorial {
  &Main {
    .show & {
      transform: translate(-50%, -50%) scale(1);

      transition: 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    position: absolute;

    top: 50%;
    left: 50%;

    width: max(400px, 40vw);
    max-width: 85%;
    height: max(320px, 45vh);
    max-height: 45%;

    border-radius: 16px;
    box-shadow: var(--el-box-shadow);
    transform: translate(-50%, -50%) scale(1.25);
    background-color: var(--el-bg-color);

    transition: 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  &.show {
    opacity: 1;
    transform: scale(1);

    pointer-events: all;
  }
  z-index: 10;
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  opacity: 0;
  pointer-events: none;
  transform: scale(1.25);
  background-color: var(--el-overlay-color);

  transition:
    opacity 0.5s cubic-bezier(0.25, 0.8, 0.25, 1),
    transform 2s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>
