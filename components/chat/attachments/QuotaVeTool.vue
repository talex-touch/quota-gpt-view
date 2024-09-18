<script setup lang="ts">
import Imagable from './ve-tool/Imagable.vue'
import type { IInnerItemMeta } from '~/composables/api/base/v1/aigc/completion-types'

const props = defineProps<{
  block: IInnerItemMeta
}>()

const data = computed(() => props.block.data ? JSON.parse(props.block.data) : {})
const value = computed(() => props.block.value ? JSON.parse(props.block.value) : {})
const text = computed(() => data.value.arguments?.text || data.value.name)

const compMapper = reactive({
  'ts-ThisAI_StandardImagable-ThisAI_StandardImagable': {
    icon: 'i-carbon:image',
    comp: Imagable,
  },
})

const curItem = computed(() => compMapper[data.value.name])
</script>

<template>
  <div :class="{ done: block.value }" class="QuotaVeTool">
    <template v-if="curItem">
      <div class="Tool-Header">
        <div class="Tool-Header-Icon">
          <div :class="curItem.icon" />
        </div>
        <OtherTextShaving v-if="!block.value" :text="text" />
        <p v-else>
          {{ text }}
        </p>
        <div class="Tool-Header-Status">
          <IconCircleLoader class="Loader" />
          <div class="_dot" />
        </div>
      </div>

      <component :is="curItem.comp" :data="data" :value="value" />
    </template>
    <template v-else>
      <OtherTextShaving text="无法获取对应数据" />
      {{ block }}
    </template>
  </div>
</template>

<style lang="scss" scoped>
.Tool-Header-Status {
  .done & {
    :deep(.loader) {
      transform: scale(0);
    }

    ._dot {
      opacity: 1;
    }
  }
  ._dot {
    position: absolute;

    top: 50%;
    left: 50%;

    width: 10px;
    height: 10px;

    opacity: 0;
    transition: 0.25s;
    border-radius: 50%;
    filter: brightness(90%);
    transform: translate(-50%, -50%);
    background-color: var(--el-color-success);
  }
  position: relative;
  display: flex;

  width: 40px;

  align-items: center;
}

.Tool-Header {
  :deep(.loader) {
    transition: 0.25s;
    transform: scale(0.75);
  }
  display: flex;

  gap: 0.5rem;
  align-items: center;
}

.QuotaVeTool {
  position: relative;
}
</style>
