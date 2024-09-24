<script setup lang="ts">
definePageMeta({
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
    <div class="next">
      <div>a</div>
      <div>b</div>
    </div>
    <div class="rix">
      <div class="box1">
        1
      </div>
      <div>2</div>
      <div>3</div>
    </div>
    <div class="button">
      <div class="box2">
        1
      </div>
      <div>2</div>
      <div>3</div>
    </div>
  </div>
</template>

<style lang="scss">
.Cms {
  padding: 1rem;
  display: flex;

  width: 100%;
  height: 100%;

  gap: 0.5rem;
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
    padding: 1rem 0.5rem;

    flex: 1;

    border-radius: 18px;
    background-color: var(--el-fill-color-light);
  }
}

.next {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 175px; /* 增加高度 */
  grid-gap: 2rem;
  width: 100%;
  height: auto;
}

.next > div {
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  padding: 15px; /* 增加内边距 */
  font-size: 1.2em; /* 增加字体大小 */
}

.rix {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 175px; /* 增加高度 */
  grid-gap: 2rem;
  width: 100%;
  height: auto;
}

.rix > div {
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  padding: 15px; /* 增加内边距 */
  font-size: 1.2em; /* 增加字体大小 */
}

.box1 {
  grid-column: 1 / 3;
}

.button {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 175px; /* 增加高度 */
  grid-gap: 2rem;
  width: 100%;
  height: auto;
}

.button > div {
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  padding: 15px; /* 增加内边距 */
  font-size: 1.2em; /* 增加字体大小 */
}

.box2 {
  grid-column: 1 / 3;
}

.luik {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.circle1,
.circle2,
.circle3 {
  border-radius: 100%;
  width: 60px; /* 增加宽度 */
  height: 60px; /* 增加高度 */
  background-color: #000;
}
</style>
