<script setup lang="ts">
import CloseCheckbox from '../button/CloseCheckbox.vue'

const expand = ref(false)
</script>

<template>
  <div :class="{ expand }" class="QueryCollapse">
    <div flex items-center gap-2 class="QueryCollapse-Header" @click="expand = !expand">
      <slot name="Header">
        Header
      </slot>
    </div>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
:deep(.hamburger) {
  font-size: 10px;
}

.QueryCollapse {
  &-Header {
    display: flex;

    height: 32px;
    align-items: center;
    // margin: 0.5rem 0;

    opacity: 0.5;

    cursor: pointer;
    user-select: none;
  }

  &.expand {
    .QueryCollapse-Header {
      opacity: 0.75;
    }
    max-height: 500px;
  }
  position: relative;

  max-height: 28px;

  overflow-y: hidden;

  transition: max-height 0.2s ease-in-out;
}
</style>
