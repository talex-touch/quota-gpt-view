<script setup lang="ts">
definePageMeta({
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})
</script>

<template>
  <div class="Cms">
    <el-empty />
  </div>
</template>

<style lang="scss">
.Cms {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
