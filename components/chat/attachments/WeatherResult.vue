<script setup lang="ts">
const props = defineProps<{
  data: any
}>()
</script>

<template>
  <div>
    Weather {{ data }}
  </div>
</template>
