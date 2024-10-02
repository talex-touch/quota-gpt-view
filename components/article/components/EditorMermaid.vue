<script setup>
import html2canvas from 'html2canvas'
import mermaid from 'mermaid'

const props = defineProps(['node'])

mermaid.initialize({ startOnLoad: false })

const loading = ref(false)
const innerRef = ref()

onMounted(() => {
  const innerDom = innerRef.value

  watchEffect(async () => {
    loading.value = true

    const res = await mermaid.render(`mermaid-${props.node.attrs.language}`, props.node.textContent, innerDom)

    innerDom.innerHTML = res.svg

    loading.value = false
  })
})

async function download() {
  loading.value = true

  const canvas = await html2canvas(innerRef.value)

  const url = canvas.toDataURL('image/png')

  const a = document.createElement('a')
  a.download = 'pic.png'
  a.href = url
  a.click()

  a.remove()

  loading.value = false
}
</script>

<template>
  <div v-loader="loading" class="EditorCharts">
    <div class="EditorCharts-Inner">
      <div ref="innerRef" class="EditorCharts-InnerContent" />

      <div class="EditorCharts-TextWaterMark">
        ThisAI
      </div>

      <div class="EditorCharts-WaterMark">
        <img src="/logo.svg">
      </div>
    </div>

    <div class="EditorCharts-Toolbar transition-cubic fake-background">
      <div i-carbon:download @click="download" />
      <!-- <div i-carbon:reset @click="mm.fit()" /> -->
    </div>
  </div>
</template>

<style lang="scss">
.EditorCharts-TextWaterMark {
  z-index: 0;
  position: absolute;

  width: max-content;

  left: 50%;
  bottom: 50%;

  font-size: 8rem;
  font-weight: 600;
  letter-spacing: 1rem;
  transform: translate(-50%, 50%);

  opacity: 0.01;
  pointer-events: none;
}

.EditorCharts-WaterMark {
  z-index: 1;
  position: absolute;

  width: 32px;
  height: 32px;

  left: 0;
  bottom: 0;

  opacity: 0.1;
  filter: invert(0.5);
  pointer-events: none;
}

.EditorCharts {
  &:hover {
    .EditorCharts-Toolbar {
      opacity: 1;
    }
  }

  &-Toolbar {
    z-index: 1;
    position: absolute;
    display: flex;
    padding: 0.5rem 0.5rem;

    gap: 0.5rem;
    right: 0.5rem;
    bottom: 0.5rem;

    opacity: 0;
    cursor: pointer;
    font-size: 12px;
    overflow: hidden;
    border-radius: 8px;
    --fake-color: var(--theme-color-light);
    backdrop-filter: blur(18px) saturate(180%);
  }

  &-Inner,
  svg {
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    color: var(--el-text-color-primary);
  }

  svg {
    left: 50%;

    transform: translateX(-50%);

    &:not(:empty) {
      overflow: visible;
    }
  }

  &-Inner {
    &Content {
      position: relative;
      display: flex;

      height: auto;
      min-height: 70vh;

      justify-content: center;
    }

    div {
      cursor: auto;
    }

    height: auto;
    // min-width: 20vw;

    cursor: grab;
    overflow: hidden;
    border-radius: 12px;
  }

  position: relative;
  padding: 0.5rem;

  height: auto;
  min-width: 20vw;
  min-height: 70vh;

  overflow: hidden;
  border-radius: 12px;
  background-color: var(--el-fill-color);
  box-shadow: 0 0 8px 1px var(--theme-color-light);
}
</style>
