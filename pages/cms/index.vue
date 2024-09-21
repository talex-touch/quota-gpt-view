<script setup lang="ts">
definePageMeta({
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})
import { ref } from "vue";
// import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'

const showDetails = ref(false)
</script>

<template>
  <!-- <div class="Cms">
    <el-empty />
  </div> -->
  <div class="Allpage">

      <div class="One">
        <!-- <div class="cir"></div> -->
        <el-button class="btn" :icon="Edit" circle />
      
      </div>
    </div>
    <div class="bottom">

  </div>
</template>

<style lang="scss">
.Cms {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.Allpage {
  width: 100%;
}
.One{
  background-color: aquamarine;
  width: 400px;
  height: 50px;
  border: 1px solid #111111;
  border-radius: 5px;
  display: flex;
}
.btn{
  display: flex;
  justify-content: start;
  align-items: flex;
}
</style>
