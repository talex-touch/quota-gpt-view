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
    <div class="CmsData">
      <div v-for="i in 4" :key="i" class="CmsData-Item">
        <div class="CmsData-Item-Avatar">
          <el-img>
            Random
          </el-img>
        </div>
      </div>
    </div>
    <div class="CmsAnalyze">
      <div />
      <div />
    </div>
    <div class="CmsDisplay">
      <div class="CmsDisplay-Greater" />

      <div h-full flex flex-1 gap-4>
        <div class="CmsDisplay-Lesser1" />
        <div class="CmsDisplay-Lesser2" />
      </div>
    </div>
    <div class="CmsDisplay2">
      <div class="CmsDisplay2-Greater" />
      <div h-full flex flex-1 gap-4>
        <div class="CmsDisplay-Lesser1" />
        <div class="CmsDisplay-Lesser2" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.Cms {
  padding: 1rem;
  display: flex;

  width: 100%;
  height: 100%;

  gap: 1rem;
  flex-direction: column;

  justify-content: space-between;
}

.CmsData {
  display: flex;

  gap: 1rem;
  width: 100%;

  &-Item {
    &-Avatar {
      display: flex;

      font-size: 12px;
      align-items: center;
      justify-content: center;

      width: 64px;
      height: 64px;

      border-radius: 50%;
      border: 1px solid var(--el-text-color-primary);
    }
    padding: 1rem 1rem;

    flex: 1;

    border-radius: 18px;
    background-color: var(--el-fill-color-light);
  }
}

.CmsAnalyze {
  display: flex;

  gap: 1rem;
  width: 100%;

  // padding: 1rem 0.5rem;

  flex: 1;
}

.CmsAnalyze > div {
  flex: 1;

  border-radius: 18px;
  background-color: var(--el-fill-color-light);
}

.CmsDisplay {
  display: flex;
  gap: 1rem;
  width: 100%;
  flex: 1;
  &-Greater {
    flex: 1;

    // width: 50%;

    border-radius: 18px;
    background-color: var(--el-fill-color-light);
  }
  &-Lesser1 {
    padding: 1rem 0.5rem;

    flex: 1;

    border-radius: 18px;
    background-color: var(--el-fill-color-light);
  }
  &-Lesser2 {
    padding: 1rem 0.5rem;

    flex: 1;

    border-radius: 18px;
    background-color: var(--el-fill-color-light);
  }
}

// .CmsDisplay > div {
//   padding: 1rem 0.5rem;

//   flex: 1;

//   border-radius: 18px;
//   background-color: var(--el-fill-color-light);
// }

.CmsDisplay2 {
  display: flex;
  gap: 1rem;
  width: 100%;
  // padding: 1rem 0.5rem;
  flex: 1;
  &-Greater {
    // padding: 1rem 0.5rem;

    flex: 1;

    border-radius: 18px;
    background-color: var(--el-fill-color-light);
  }
  &-Lesser1 {
    padding: 1rem 0.5rem;

    flex: 1;

    border-radius: 18px;
    background-color: var(--el-fill-color-light);
  }
  &-Lesser2 {
    padding: 1rem 0.5rem;

    flex: 1;

    border-radius: 18px;
    background-color: var(--el-fill-color-light);
  }
}

// .circle1,
// .circle2,
// .circle3 {
//   border-radius: 100%;
//   width: 60px; /* 增加宽度 */
//   height: 60px; /* 增加高度 */
//   background-color: #000;
// }
</style>
