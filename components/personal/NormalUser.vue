<script setup lang="ts">
import UserAvatar from './UserAvatar.vue'

defineProps<{
  data: any
}>()
</script>

<template>
  <el-popover
    placement="bottom-start" :width="200" trigger="hover"
  >
    <template #reference>
      <UserAvatar :avatar="data.avatar" />
    </template>
    {{ data }}
  </el-popover>
</template>
