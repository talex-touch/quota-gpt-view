<script setup lang="ts">
import { definePageMeta } from 'vue'

definePageMeta({
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})
</script>

<template>
  <div class="Cms">
    <div class="page">
      <div class="top">
        <div class="luik">
          <div class="circle1" />
          <div class="circle2" />
          <div class="circle3" />
        </div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div>6</div>
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
  </div>
</template>

<style lang="scss">
.Cms {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.page {
  display: grid;
  grid-gap: 2rem;
  width: 100%;
  max-width: 1000px; /* 增加最大宽度 */
}

.top {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: 75px; /* 增加高度 */
  grid-gap: 2rem;
  width: 100%;
  height: auto;
}

.top > div {
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  padding: 15px; /* 增加内边距 */
  font-size: 1.2em; /* 增加字体大小 */
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
