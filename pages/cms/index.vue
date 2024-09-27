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
      <LazyCmsUser />
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

  flex-shrink: 0;

  overflow: hidden;
  border-radius: 2px;
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
  min-width: 200px;
  width: 30%;
  max-width: 480px;
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
