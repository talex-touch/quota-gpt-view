<script setup lang="ts">
onMounted(async () => {

})

function getBuildTime() {
  return __BuildTime__
}
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <p>开发者设置</p>
    </div>

    <el-empty v-if="!userStore.subscription?.type" description="你暂未获得开发者设置授权！" />
    <div v-v-else class="ProfileWrapper-Main">
      <TemplateLineForm title="系统信息构建" desc="当前版本构建推送时间">
        {{ formatDate(getBuildTime()) }}
      </TemplateLineForm>
      <TemplateLineForm title="应用授权AccessToken" desc="AccessToken是重要的访问凭证，复制之前请确保您知道自己在做什么。">
        <div v-copy="userStore.token?.accessToken" i-carbon:copy cursor-pointer />
      </TemplateLineForm>
      <TemplateLineForm danger title="恒定授权RefreshToken" desc="RefreshToken是重要的访问凭证，复制之前请确保您知道自己在做什么。">
        <div v-copy="userStore.token?.accessToken" i-carbon:copy cursor-pointer />
      </TemplateLineForm>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ProfileWrapper-Main {
  height: calc(100% - 80px);
}
</style>
