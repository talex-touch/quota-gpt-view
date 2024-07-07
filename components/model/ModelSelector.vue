<script setup lang="ts">
import { models } from './model'

const props = defineProps<{
  modelValue: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const expand = ref(false)
const selectionRef = ref()
const model = useVModel(props, 'modelValue', emits)

watch(
  () => useWindowSize(),
  () => {
    const el: HTMLElement = selectionRef.value
    if (!el)
      return

    if (expand.value)
      refreshSelectionPosition(el)
  },
  { deep: true },
)

watch(
  () => expand.value,
  () => {
    const el: HTMLElement = selectionRef.value
    if (!el)
      return

    if (!expand.value) {
      el.style.right = '0'
      el.style.top = '20px'

      return
    }

    refreshSelectionPosition(el)
  },
)

async function refreshSelectionPosition(el: HTMLElement) {
  const holder = el.parentNode!.parentNode!.parentNode! as HTMLElement
  const holderRect = holder.getBoundingClientRect()

  // 将 el 放到屏幕正中间
  el.style.right = `${(holderRect.width - 680) / 2}px`
  el.style.top = `${(holderRect.height + 450) / 2}px`
}

const curSelect = computed(() => models.find(item => item.value === model.value))
</script>

<template>
  <div :class="{ expand }" class="ModelSelector">
    <span class="model-name">
      {{ curSelect!.name }}
      <div i-carbon-chevron-up />
    </span>

    <div ref="selectionRef" class="ModelSelector-Selections">
      <p class="title">
        模型差异
      </p>

      <ModelInner v-model="model" :expand="expand" />

      <div class="ModelSelector-Table">
        <div v-for="item in models" :key="item.name" class="ModelSelector-TableInner">
          <span
            v-for="feature in item.features"
            :key="feature"
            :style="`${item.valuable ? 'color: var(--el-color-info)' : ''}`"
          >
            {{ feature }}
          </span>
        </div>
      </div>

      <el-link type="info" class="model-diff-link" @click="expand = !expand">
        <div v-if="!expand" i-carbon-help />
        <div v-else i-carbon-close />
        &nbsp;
        <span>
          {{ expand ? "关闭对比" : "模型差异" }}
        </span>
      </el-link>
    </div>
  </div>
</template>

<style lang="scss">
.ModelSelector-Table {
  .ModelSelector-TableInner {
    display: flex;
    flex-direction: column;

    width: 30%;
  }
  position: absolute;
  padding: 0 1rem;
  margin-left: 0.5rem;
  display: flex;

  gap: 2rem;

  left: 50%;
  top: 180px;

  width: 90%;

  opacity: 0;
  transition: 0.25s;
  pointer-events: none;
  transform: translate(-50%, 0);
}

.ModelSelector.expand {
  .model-name div {
    transform: rotate(180deg);
  }

  .ModelSelector-Table {
    opacity: 1;

    pointer-events: all;
    transition: 0.5s 0.25s;
  }

  p.title {
    margin-bottom: 10px;

    opacity: 1;
  }

  .ModelSelector-Models {
    background-color: var(--el-bg-color);
  }

  &::before {
    opacity: 0.5;

    transform: scale(1);
    transition: 0.25s;
  }

  .ModelSelector-Selections {
    padding: 2rem 1.5rem;

    width: 680px;
    height: 450px;

    cursor: auto;
    transform: scale(1);
  }
}

.ModelSelector-Selections {
  p.title {
    margin-bottom: -40px;

    font-size: 24px;
    text-align: center;

    opacity: 0;
    transition: 0.5s;
  }
}

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
  .model-diff-link {
    position: absolute;

    left: 50%;
    bottom: 0.5rem;

    transform: translateX(-50%);
  }

  &:hover {
    .model-name div {
      transform: rotate(180deg);
    }

    cursor: pointer;
  }

  .model-name {
    div {
      transition: 0.25s;
    }
    display: flex;

    gap: 0.5rem;
    align-items: center;
  }

  &:hover {
    .ModelSelector-Selections {
      transform: scale(1);
    }
  }

  &-Selections {
    z-index: 1;
    position: absolute;
    padding: 0.5rem;

    margin: 1rem 0;

    top: 20px;
    right: 0;

    width: 210px;
    height: 185px;

    border-radius: 16px;
    transform: scale(0);
    transform-origin: right top;
    box-shadow: var(--el-box-shadow);
    background-color: var(--el-bg-color);
    transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }
  position: relative;

  user-select: none;
}
</style>
