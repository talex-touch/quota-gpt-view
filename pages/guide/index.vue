<script setup lang="ts">
import GuideAside from '../../components/guide/GuideAside.vue'

definePageMeta({
  layout: 'document',
})
</script>

<template>
  <div class="Guide expand">
    <el-aside class="GuideAside" width="200px">
      <GuideAside />
    </el-aside>
    <el-main>
      <div>
        Guide
      </div>
    </el-main>
  </div>
</template>

<style lang="scss">
.Guide {
  position: absolute;
  display: flex;

  top: 61px;
  left: 0;

  width: 100%;
  height: calc(100% - 61px);
}

.GuideAside {
  height: 100%;

  align-self: flex-start;
}
</style>
