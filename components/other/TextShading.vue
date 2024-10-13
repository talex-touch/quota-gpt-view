<script setup lang="ts">
const props = defineProps<{
  text: string
  once?: boolean
  animation?: string
}>()
</script>

<template>
  <div class="TextShading" :class="{ once }">
    <span class="eraser" :style="animation || ''"> {{ text }}</span>
  </div>
</template>

<style lang="scss">
.TextShading {
  &.once .eraser {
    animation: cubic-bezier(0.6, -0.28, 0.735, 0.045) erasing 2s forwards;
  }

  .eraser {
    color: transparent;
    background: linear-gradient(
      to right,
      var(--color, var(--el-text-color-primary)) var(--p),
      #0000 calc(var(--p) + 5rem)
    );

    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    --p: -20%;
    animation: cubic-bezier(0.6, -0.28, 0.735, 0.045) erasing 2s infinite;
  }

  position: relative;
}

@property --p {
  syntax: '<percentage>';
  initial-value: 0%;
  inherits: false;
}

@keyframes erasing {
  to {
    --p: 100%;
  }
}
</style>
