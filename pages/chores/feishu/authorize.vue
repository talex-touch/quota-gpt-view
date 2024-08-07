<script setup lang="ts">
const route = useRoute()

onMounted(() => {
  console.log(route.query)
})
</script>

<template>
  <div :class="{ error: $route.query.error }" class="Authorize">
    <ChoreLogo />

    <h1>
      <OtherTextShaving :text="`${$route.query.error ? ($route.query.msg || '无法完成授权申请') : '正在申请授权中...'}`" />
    </h1>
  </div>
</template>

<style lang="scss" scoped>
.Authorize {
  padding: 2rem;
  display: flex;

  gap: 5rem;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  width: 500px;
  height: 350px;

  border-radius: 16px;
  box-shadow: var(--el-box-shadow);
  border: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color-page);
}
</style>
