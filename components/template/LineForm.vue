<script setup lang="ts">
const props = defineProps<{
  title: string
  desc: string
}>()
</script>

<template>
  <div class="LineForm">
    <div class="LineForm-Start">
      <slot name="start">
        <p class="LineForm-Title">
          {{ title }}
        </p>
        <p class="LineForm-Desc">
          {{ desc }}
        </p>
      </slot>
    </div>

    <div class="LineForm-End">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.LineForm {
  &-Start {
    p.LineForm-Title {
      font-weight: 400;
    }
    p.LineForm-Desc {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
    display: flex;

    flex-direction: column;
  }
  padding: 0.25rem;
  display: flex;

  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid var(--el-border-color);
}
</style>
