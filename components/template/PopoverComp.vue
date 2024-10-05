<script setup lang="ts">
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'

const props = defineProps<{
  popperClass?: string
}>()

const hover = ref(false)
const container = ref<HTMLElement>()
const floating = ref<HTMLElement>()

const middleware = ref([flip({
  padding: 10,
  fallbackPlacements: ['right', 'bottom'],
})])
const { floatingStyles } = useFloating(container, floating, {
  middleware,
  whileElementsMounted: autoUpdate,
})

const computedClass = computed(() => [hover.value ? 'enter' : '', props.popperClass || 'Popover-Float-Inner'])
</script>

<template>
  <div ref="container" class="PopoverComp" @mouseenter="hover = true" @mouseleave="hover = false">
    <slot name="inner" />
  </div>
  <teleport to="body">
    <div
      ref="floating" :style="floatingStyles" class="Popover-Float" @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <div :class="computedClass">
        <slot />
      </div>
    </div>
  </teleport>
</template>

<style lang="scss">
// .PopoverComp {
//   position: relative;
// }

.Popover-Float {
  &-Inner {
    &.enter {
      transform: scale(1);
    }
    transform: scale(0);
  }
  z-index: 5;
  position: absolute;
}
</style>
