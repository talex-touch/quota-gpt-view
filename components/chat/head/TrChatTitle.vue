<script setup>
const props = defineProps({
  title: String,
})

const _title = computed(() => {
  return props.title.replace(/^['"]|['"]$/g, '')
})
</script>

<template>
  <div class="TrChatTitle">
    {{ _title }}
  </div>
</template>

<style style="">
.TrChatTitle {
  &::before {
    z-index: -1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.5;
    border-radius: 12px;
    background-color: var(--el-mask-color-extra-light);
  }
  position: relative;
  padding: 0.25rem 0.5rem;

  border-radius: 12px;

  box-shadow: var(--el-box-shadow);
  backdrop-filter: blur(16px) saturate(180%);
}
</style>
