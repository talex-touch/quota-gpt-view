<script setup lang="ts">
definePageMeta({
  name: '管理中心',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})
</script>

<template>
  <div class="Cms">
    <div class="Cms-Addon">
      <div class="Cms-Application cms-card">
        <lazy-cms-application />
      </div>
    </div>

    <div class="Cms-Content">
      2
    </div>

    <div class="Cms-User">
      <div class="Cms-User-Avatar" />
      <div class="Cms-User-Schedule" />
      <div class="Cms-User-Rules" />
    </div>
  </div>
</template>

<style lang="scss">
.Cms-Application {
  height: 40%;
}

.cms-card {
  .cms-header {
    .cms-start {
      display: flex;

      gap: 0.5rem;
      opacity: 0.75;
      align-items: center;
    }
    display: flex;

    font-size: 14px;
    justify-content: space-between;
  }
  padding: 0.5rem 1rem;

  overflow: hidden;
  border-radius: 16px;
  background-color: var(--el-fill-color);
}

.Cms-Addon {
  height: 100%;
  min-width: 200px;
  width: 35%;
  max-width: 480px;
}

.Cms-Content {
  padding: 1rem;

  width: 100%;
  height: 100%;

  border-radius: 16px;
  background-color: var(--el-fill-color-light);
}

.Cms-User {
  padding: 1rem;

  min-width: 200px;
  width: 15%;
  max-width: 480px;

  border-radius: 16px;
  background-color: var(--el-fill-color-light);
}

.Cms {
  position: relative;
  padding: 1rem;
  display: flex;

  width: 100%;
  height: 100%;

  gap: 1rem;

  justify-content: space-between;
}
</style>
