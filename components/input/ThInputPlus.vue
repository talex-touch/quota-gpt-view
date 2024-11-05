<script setup lang="ts">
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/vue'
import type { IChatInnerItemMeta } from '~/composables/api/base/v1/aigc/completion-types'

const props = defineProps<{
  modelValue: IChatInnerItemMeta
}>()

const emits = defineEmits<{
  (name: 'update:modelValue', data: IChatInnerItemMeta): void
  (event: 'image'): void
}>()

const hover = ref(false)
const hoverMode = debouncedRef(hover, 50)

const property = useVModel(props, 'modelValue', emits)

const options: any = reactive([
  {
    icon: 'i-carbon-image',
    type: 'button',
    label: '分析图片',
    onclick: () => {
      emits('image')
    },
  },
  // {
  //   icon: 'i-carbon-document',
  //   type: 'button',
  //   label: '分析文件',
  // },
  {
    icon: 'i-carbon-ibm-cloud-internet-services',
    type: 'checkbox',
    label: '联网能力',
    onclick: () => {
      property.value.internet = !property.value.internet
    },
    checked: () => property.value.internet,
  },
  {
    icon: 'i-carbon:temperature-celsius-alt',
    type: 'slider',
    label: '随机性',
    model: property.value.temperature,
  },
])

const buttonTrigger = ref()
const popoverFloating = ref()

const { floatingStyles } = useFloating(buttonTrigger, popoverFloating, {
  placement: 'top',
  middleware: [offset(25), flip()],
  whileElementsMounted: autoUpdate,
})
</script>

<template>
  <div class="ThInput-Plus fake-background" @mouseenter="hoverMode = hover = true" @mouseleave="hover = false">
    <div ref="buttonTrigger" class="button" i-carbon-add-large />
  </div>

  <teleport to="#teleports">
    <div ref="popoverFloating" :class="{ hover: hoverMode }" :style="floatingStyles" class="ThInput-PlusWrapper">
      <div class="ThInput-Plus-Option fake-background">
        <div
          v-for="option in options" :key="option.label" v-wave
          :class="{ checked: option.checked?.() }" class="ThInput-Plus-Option-Item" @mouseenter="hoverMode = hover = true" @mouseleave="hover = false"
          @click="option.onclick"
        >
          <template v-if="option.type === 'button'">
            <div :class="option.icon" />
            <div>{{ option.label }}</div>
          </template>
          <template v-else-if="option.type === 'checkbox'">
            <div :class="option.icon" />
            <div>{{ option.label }}</div>

            <div class="checkbox-status">
              <div i-carbon-checkmark />
            </div>
          </template>
          <template v-else-if="option.type === 'slider'">
            <InputOptionSlider v-model="option.model" />
            <!-- <el-slider v-model="option.model" /> -->

            <div :class="option.icon" />
            <div class="slider-wrapper">
              <span>{{ option.label }}</span>

              <div style="opacity: .75;font-size: 14px" class="checkbox-status">
                {{ option.model }}%
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style lang="scss">
.ThInput-PlusWrapper {
  &.hover {
    pointer-events: all;
  }
  z-index: 2;

  width: 180px;
  height: 152px;

  pointer-events: none;
}

.ThInput-Plus-Option {
  &-Item {
    .slider-wrapper {
      .checkbox-status {
        top: 4px;
        right: 0.25rem;
      }

      > span {
        position: absolute;

        top: 0;
        left: 0;

        width: max-content;
      }

      position: relative;

      top: 0;

      width: 100%;
      height: calc(40px - 1rem);

      pointer-events: none;
    }

    // .el-slider {
    //   z-index: 1;
    //   position: absolute;

    //   top: 0;
    //   left: 0;

    //   height: 100%;

    //   opacity: 0.25;
    //   // --el-slider-height: 100%;
    //   // --el-slider-border-radius: 12px;

    //   // &__bar {
    //   //   border-radius: 12px;
    //   // }

    //   // &__button-wrapper {
    //   //   // visibility: hidden;
    //   // }
    // }

    .checkbox-status {
      z-index: 1;
      position: absolute;

      top: 0.75rem;
      right: 1rem;

      opacity: 0;
      transition: 0.25s;
    }

    &:hover {
      color: var(--el-color-primary);

      cursor: pointer;

      border-radius: 12px;
      background-color: var(--el-border-color-extra-light);
    }

    &.checked {
      color: var(--el-color-success);

      .checkbox-status {
        opacity: 1;
      }
    }

    position: relative;
    margin: 0.25rem 0;
    padding: 0.5rem 0.5rem;
    display: flex;

    gap: 0.5rem;
    align-items: center;

    user-select: none;
  }

  .hover & {
    opacity: 1;
    transform: translate(50%) translateX(-24px) scale(1) translateY(0);
  }

  position: absolute;
  padding: 0.5rem 0.5rem;

  width: 100%;
  height: 100%;

  border-radius: 18px;
  box-shadow: var(--el-box-shadow);

  opacity: 0;
  transform: translateX(50%) translateX(-24px) scale(0.9) translateY(10%);
  transition: cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.35s;

  backdrop-filter: blur(18px) saturate(180%);
}

.ThInput-Plus {
  &:hover {
    .ThInput-Plus-Option {
      opacity: 1;
      transform: translateY(-50px) translateY(0%) scale(1);
    }

    cursor: pointer;
    --fake-opacity: 0.5;
    // background: var(--el-border-color-extra-light);
  }

  .button:active {
    transform: scale(0.75);
    transition: 0.25s;
  }

  .button {
    position: relative;

    margin-top: 0.25rem;
  }

  z-index: 20;
  position: relative;
  display: flex;

  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  border-radius: 12px;
  transition: 0.25s;

  --fake-opacity: 0;

  .generating & {
    opacity: 0;
  }
}
</style>
