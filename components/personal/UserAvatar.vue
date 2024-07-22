<script setup lang="ts">
import { EndNormalUrl } from '~/constants'

const props = defineProps<{
  avatar: string
}>()

const _avatar = computed(() => {
  if (!props.avatar)
    return ''

  if (props.avatar.startsWith('http'))
    return props.avatar

  return EndNormalUrl + props.avatar
})
</script>

<template>
  <el-avatar :src="_avatar" />
</template>

<style lang="scss">

</style>
