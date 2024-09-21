<script setup lang="ts">
definePageMeta({
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

enum BannerMode {
  WHITELIST,
  BLACKLIST,
}

interface IBannerGroup {
  name: string
  startAt?: Date
  endAt?: Date
  posters: []
  property?: string
  user_subscribe?: string
  user_mode?: BannerMode
}

const bannerList = reactive<IBannerGroup[]>([])

onMounted(() => {

})

// const { data: bannerGroups } = await useAsyncData<IBannerGroup[]>(
//   'banner-groups',
//   () =>
//     api.bannerGroup.list().then((res) => {
//       return res.data.map((item) => {
//         return {
//           ...item,
//           startTimeStamp: new Date(item.startTimeStamp),
//           endTimeStamp: new Date(item.endTimeStamp),
//         }
//       })
//     })
// )
</script>

<template>
  <div class="CmsBanners">
    <div class="CmsBanners-Aside">
      1
    </div>
    <div class="CmsBanners-Main">
      <div class="CmsBanners-Main-Content">
        <div class="CmsBanners-Main-Header">
          测试横幅1
        </div>

        <ChoreBannerGroup />

        <div class="CmsBanners-Main-Content-Footer">
          <p class="title">
            横幅编辑
          </p>

          <div class="banner-edit-inner">
            到时候做成可拖拽顺序的
          </div>
        </div>
      </div>

      <div class="CmsBanners-Main-ViceContent">
        1
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.CmsBanners-Main-Content-Footer {
  position: relative;
  padding: 0.5rem;

  width: 100%;
  height: 300px;
  max-height: 30%;

  bottom: 0;

  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
}

.CmsBanners-Main-Header {
  position: relative;
  padding: 0.5rem;

  width: 100%;
  height: 50px;

  top: 0;

  text-align: center;

  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.CmsBanners-Main-ViceContent {
  position: relative;

  width: 340px;
  max-width: 30%;
  height: 100%;
  // flex-shrink: 0;

  background-color: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color);
}

.CmsBanners-Main-Content {
  position: relative;
  display: flex;

  flex-direction: column;

  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 100%;
}

.CmsBanners {
  &-Aside {
    position: relative;

    width: 15%;
    height: 100%;

    background-color: var(--el-bg-color-page);
  }
  &-Main {
    position: relative;
    display: flex;

    align-items: center;
    justify-content: center;

    flex: 1;

    height: 100%;
  }
  position: absolute;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;
}
</style>
