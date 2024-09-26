<script setup lang="ts">
onMounted(async () => {

})
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <p>开发者设置</p>
    </div>

    <el-empty v-if="!userStore.subscription?.type" description="你暂未获得开发者设置授权！" />
    <div v-v-else class="ProfileWrapper-Main">
      <div flex items-center gap-2>
        当前access_token:
        <div v-copy="userStore.token?.accessToken" i-carbon:copy cursor-pointer />
      </div>
      <div flex items-center gap-2>
        当前refresh_token:
        <div v-copy="userStore.token?.refreshToken" i-carbon:copy cursor-pointer />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ProfileWrapper-Main {
  height: calc(100% - 80px);
}
</style>
