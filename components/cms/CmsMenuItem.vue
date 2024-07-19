<script setup lang="ts">
const props = defineProps<{
  path: string
}>()

const select = ref(false)

const router = useRouter()
const route = useRoute()

watch(() => route.fullPath, () => {
  select.value = route.fullPath === props.path
}, { immediate: true })

function handleClick() {
  router.push(props.path)
}
</script>

<template>
  <div v-wave :class="{ select }" class="CmsMenuItem" @click="handleClick">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.CmsMenuItem {
  &:hover,
  &.select {
    color: var(--el-color-primary);

    background-color: var(--el-border-color-extra-light);
  }
  position: relative;
  display: flex;

  padding: 0.75rem 2rem;

  cursor: pointer;
  transition: max-height 0.2s ease-in-out;
}
</style>
