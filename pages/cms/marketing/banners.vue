<script setup lang="ts">
import { $endApi } from '~/composables/api/base'
import type { IStandardPageModel, SubscribeType } from '~/composables/api/base/index.type'
import type { IBannerGroup } from '~/composables/api/base/v1/marketing.type'
import { BannerMode } from '~/composables/api/base/v1/marketing.type'

definePageMeta({
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const select = ref(-1)
const bannerList = reactive<IBannerGroup[]>([
  // {
  //   id: 1,
  //   name: 'test',
  //   startAt: -1,
  //   endAt: -1,
  //   posters: [],
  //   property: '',
  //   user_subscribe: '' as SubscribeType,
  //   user_mode: BannerMode.WHITELIST,
  // },
])
const curBanner = computed(() => select.value !== -1 ? bannerList.find(item => item.id === select.value) : null)

const bannerForm = reactive({
  name: '',
  startAt: '',
  endAt: '',
  posters: [],
  property: '默认',
  user_subscribe: '' as SubscribeType,
  user_mode: BannerMode.WHITELIST,
})

watch(() => bannerForm, (newValue) => {
  console.log(newValue)
  const allValuesNotEmpty = Object.values(newValue).every((value) => {
    if (Array.isArray(value))
      return value.length > 0
    else if (typeof value === 'string' || typeof value === 'number')
      return value !== ''

    return true
  })

  if (allValuesNotEmpty) {
    // 将整个 bannerForm 对象推入 bannerList

    bannerList.push(newValue)
  }
}, {
  deep: true,
})

onMounted(fetchData)

async function fetchData() {
  const res = await $endApi.v1.market.banner.list({})
  if (!res.data)
    return

  bannerList.push(...res.data.items)
}

async function _saveData() {
  if (!curBanner.value)
    return

  const _: IBannerGroup = {
    ...curBanner.value,
    posters: curBanner.value?.posters?.map(item => ({
      ...item,
      url: decodeURIComponent(item.url),
    })) || [],
  }

  const res = await $endApi.v1.market.banner.update(curBanner.value.id!, _)

  responseMessage(res, {
    success: '保存成功！',
  })
}

const saveData = useDebounceFn(_saveData)

watch(() => curBanner.value, (newVal, oldVal) => {
  if (!oldVal)
    return

  saveData()
}, { deep: true })

function removeItem(index: number) {
  if (!curBanner.value)
    return

  curBanner.value?.posters!.splice(index, 1)
}
</script>

<template>
  <div class="CmsBanners">
    <div class="CmsBanners-Aside">
      <ChoreBannerList v-model:select="select" v-model="bannerList" />
    </div>
    <div class="CmsBanners-Main">
      <template v-if="curBanner">
        <div class="CmsBanners-Main-Content">
          <div class="CmsBanners-Main-Header">
            <el-form :model="bannerForm" label-width="auto">
              <el-row :gutter="15">
                <el-col :span="4">
                  <el-form-item label="分组名单 ">
                    <el-select v-model="bannerForm.user_mode" placeholder="please select your zone">
                      <el-option label="黑名单" value="BLACKLIST" />
                      <el-option label="白名单" value="WHITELIST" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="4">
                  <el-form-item label="用户订阅分组" :inline="false">
                    <el-select v-model="bannerForm.user_subscribe" placeholder="please select your zone">
                      <el-option label="标准订阅计划" value="STANDARD" />
                      <el-option label="旗舰订阅计划" value="ULTIMATE" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="生效时间">
                    <el-col :span="11">
                      <el-date-picker
                        v-model="bannerForm.startAt" value-format="“timestamp”" type="date"
                        placeholder="生效时间" style="width: 100%"
                      />
                    </el-col>
                    <el-col :span="1" class="text-center">
                      <span class="text-gray-500">-</span>
                    </el-col>
                    <el-col :span="11">
                      <el-time-picker
                        v-model="bannerForm.startAt" value-format="“timestamp”" placeholder="结束时间"
                        style="width: 100%"
                      />
                    </el-col>
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item label="结束时间">
                    <el-col :span="11">
                      <el-date-picker
                        v-model="bannerForm.endAt" value-format="“timestamp”" type="date"
                        placeholder="生效时间" style="width: 100%"
                      />
                    </el-col>
                    <el-col :span="1" class="text-center">
                      <span class="text-gray-500">-</span>
                    </el-col>
                    <el-col :span="11">
                      <el-time-picker
                        v-model="bannerForm.endAt" value-format="“timestamp”" placeholder="结束时间"
                        style="width: 100%"
                      />
                    </el-col>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>

          <ChoreBannerGroup v-model="curBanner" />

          <div class="CmsBanners-Main-Content-Footer">
            <p class="title">
              横幅编辑
            </p>

            <div class="banner-edit-wrapper">
              <el-scrollbar>
                <div class="banner-edit-inner">
                  <div v-for="(item, index) in curBanner.posters" :key="item.url" class="banner-item">
                    <img :src="decodeURIComponent(item.url)" :alt="`Banner${index}`">

                    <div v-wave class="closable" @click="removeItem(index)">
                      <div i-carbon:close />
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>

        <div class="CmsBanners-Main-ViceContent">
          1
        </div>
      </template>

      <template v-else>
        <el-empty description="新增横幅组以编辑" />
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.CmsBanners-Main-Content-Footer {
  .closable {
    &:hover {
      background-color: var(--el-color-danger);

      width: 100%;
      height: 100%;

      opacity: 0.75 !important;
      font-size: 36px;
      border-radius: 16px;
    }

    position: absolute;
    display: flex;

    top: 0;
    right: 0;

    width: 24px;
    height: 24px;

    cursor: pointer;

    align-items: center;
    justify-content: center;

    opacity: 0;
    transition: 0.25s;
    border-radius: 50%;
    // transform: translate(50%, -50%);
    background-color: var(--el-bg-color-page);
  }

  .banner-item {
    &:hover .closable {
      opacity: 1;
    }

    img {
      width: 100%;
      height: 100%;

      object-fit: cover;
      border-radius: 16px;
    }
    position: relative;

    width: 20%;
    // height: 100%;

    flex-shrink: 0;

    aspect-ratio: 16 / 9;

    border-radius: 16px;
    box-shadow: var(--el-box-shadow);
  }

  .banner-edit-inner {
    position: relative;
    // padding: 0.5rem 0;
    display: flex;

    gap: 0.5rem;
  }

  .banner-edit-wrapper {
    position: absolute;
    padding: 1rem;

    width: 100%;
    height: 100%;

    overflow: hidden;
  }

  p.title {
    margin: 1rem 1rem 0.5rem;

    font-size: 20px;
    font-weight: 600;
  }

  position: relative;
  // padding: 1rem;

  width: 100%;
  max-width: 100%;
  height: 300px;
  max-height: 30%;

  bottom: 0;

  // overflow: hidden;
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
