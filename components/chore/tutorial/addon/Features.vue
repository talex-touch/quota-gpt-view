<script lang="ts" setup>
import ModuleTour from './ModuleTour.vue'

const handleNext: any = inject('handleNext')
</script>

<template>
  <div class="Features">
    <el-carousel motion-blur>
      <el-carousel-item v-for="item in 4" :key="item">
        <h3 class="small justify-center" text="2xl">
          {{ item }}123123
        </h3>
      </el-carousel-item>
    </el-carousel>

    <ButtonArrowButton
      @click="handleNext({
        component: ModuleTour,
        data: {},
      })"
    >
      下一步
    </ButtonArrowButton>
  </div>
</template>

<style lang="scss">
.Features {
  .el-carousel {
    width: 100%;
    height: 100%;
  }
  position: absolute;
  padding: 2rem;
  display: flex;
  flex-direction: column;

  gap: 2rem;
  align-items: center;
  justify-content: space-between;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}
</style>
