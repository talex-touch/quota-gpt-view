<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const showDetails = ref(false)
</script>

<template>
  <div class="Cms">
    <!-- <el-empty /> -->
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
  // height: 100vh;
}
.page {
  display: grid;
  // grid-gap: 1rem;
  grid-gap: 10px 10px;
}
.top {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: 25px;
  width: 600px;
  height: 25px;
  grid-gap: 10px 10px;
  grid-auto-flow: row;
}
.top > div {
  background-color: #fff;
  border: 1px solid #000;
  // grid-gap: 10px 10px;
  border-radius: 4px;
}
.next {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 75px;
  width: 600px;
  height: 75px;
  grid-gap: 10px 10px;
  grid-auto-flow: row;
}
.next > div {
  background-color: #fff;
  border: 1px solid #000;
  // grid-gap: 10px 10px;
  border-radius: 4px;
}
.rix {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 75px;
  width: 600px;
  height: 75px;
  grid-gap: 10px 10px;
  grid-auto-flow: row;
}
.rix > div {
  background-color: #fff;
  border: 1px solid #000;
  // grid-gap: 10px 10px;
  border-radius: 4px;
}
.box1 {
  grid-column: 1 / 3;
}
.button {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 75px;
  width: 600px;
  height: 75px;
  grid-gap: 10px 10px;
  grid-auto-flow: row;
}
.button > div {
  background-color: #fff;
  border: 1px solid #000;
  // grid-gap: 10px 10px;
  border-radius: 4px;
}
.box2 {
  grid-column: 1 / 3;
}
.luik {
  display: flex;
  // justify-content: start;
  justify-content: space-around;
  align-items: center;
}
.circle1 {
  // display: flex;
  // justify-content: center;
  // align-items: center;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  background-color: #000;
}
.circle2 {
  // display: flex;
  // justify-content: center;
  // align-items: center;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  // background-color: #000;
}
.circle3 {
  // display: flex;
  // justify-content: center;
  // align-items: center;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  // background-color: #000;
}
.Allpage {
  width: 100%;
}
.One {
  background-color: aquamarine;
  width: 400px;
  height: 50px;
  border: 1px solid #111111;
  border-radius: 5px;
  display: flex;
}
.btn {
  display: flex;
  justify-content: start;
  align-items: flex;
}
</style>
