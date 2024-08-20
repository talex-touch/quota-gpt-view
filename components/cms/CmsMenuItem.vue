<script setup lang="ts">
const props = defineProps<{
  path?: string
  external?: string
  query?: string
  danger?: boolean
  emphasis?: boolean
}>()

const select = ref(false)

const router = useRouter()
const route = useRoute()

watch(() => route.fullPath, () => {
  if (props.path)
    select.value = route.fullPath === props.path

  if (props.query)
    select.value = route.query.data === props.query
}, { immediate: true })

function handleClick() {
  if (props.external) {
    if (props.external.startsWith('http'))
      return window.open(props.external, '_blank')
  }

  if (props.path)
    router.push(props.path)

  if (props.query)
    router.push({ query: { data: props.query } })
}
</script>

<template>
  <div v-wave :class="{ select, danger, emphasis }" class="CmsMenuItem" @click="handleClick">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.CmsMenuItem {
  &:hover,
  &.select {
    .wallpaper & {
      background: var(--el-mask-color-extra-light);
    }
    color: var(--el-color-primary);
    background-color: var(--el-border-color-extra-light);

    filter: drop-shadow(0 0 2px var(--el-border-color));
  }

  position: relative;
  display: flex;

  padding: 0.75rem 2rem;

  cursor: pointer;
  transition: max-height 0.2s ease-in-out;
}

.CmsMenuItem.danger {
  &:hover,
  &.select {
    color: var(--el-color-danger);

    background-color: var(--el-border-color-extra-light);
  }
}

.CmsMenuItem.emphasis {
  &:hover,
  &.select {
    color: var(--el-color-success);

    // background-color: var(
    //   --wallpaper-color-light,
    //   var(--el-border-color-extra-light)
    // );
  }
}
</style>
