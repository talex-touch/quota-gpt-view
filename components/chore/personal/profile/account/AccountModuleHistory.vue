<script setup lang="ts">
import dayjs from 'dayjs'
import { getHistoryList } from '~/composables/api/account'

const props = defineProps<{
  data: any
}>()
const historyList = computed(() => props.data)

// 计算历史记录
// 统计 设备 这一栏 groupBy
const deviceGroup = computed(() => {
  const res = historyList.value?.items?.reduce((acc: any, cur: any) => {
    const key = cur.os

    if (!acc[key])
      acc[key] = []

    acc[key].push(cur)

    return acc
  }, {})

  return res
    ? Object.keys(res).map((key) => {
      const items = res[key].sort((a: any, b: any) => dayjs(b.time).diff(a.time))

      // get last one
      const item = items[0]

      return { os: key, items, ...item }
    }).sort((a: any, b: any) => b.items.length - a.items.length)
    : []
})

// const deviceGroup = computed(() => _deviceGroup.value.reduce((acc, cur) => {
//   if (acc[cur.os])
//     acc[cur.os].push(cur)

//   else
//     acc[cur.os] = [cur]

//   return acc
// }, {}))

// 判断是否是本设备
function isThisDevice(item: any) {
  const device = useDevice()
  const ua = navigator.userAgent

  const browserBrand = item.browser.split(' ')?.[0] || item.browser

  if (item.os.includes('Android'))
    return device.isAndroid && ua.includes(browserBrand)

  if (item.os.includes('iOS'))
    return device.isIos && ua.includes(browserBrand)

  if (item.os.includes('Windows'))
    return device.isWindows && ua.includes(browserBrand)

  console.log('a', item, navigator.userAgent, useDevice(), browserBrand)

  return false
}
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <p>登录历史</p>
      <p v-if="historyList?.meta" style="font-size: 14px" op-50>
        累计记录 {{ historyList.meta.totalItems }} 条
      </p>
    </div>

    <div class="ProfileWrapper-Main">
      <div v-for="device in deviceGroup" :key="device.os" class="Device-Item">
        <!-- <div class="Device-Item-Header">
          <div class="Device-Item-Header-Icon">
            <div i-carbon-devices-apps />
          </div>
        </div> -->

        <div class="Device-Item-Main">
          <p class="device-name">
            {{ device.os }}
            <span v-if="isThisDevice(device)" class="tag">
              本机
            </span>
          </p>
          <p class="method">
            <span v-if="device.provider === 'WEB_WECHAT'">
              微信扫码登录·网页版
            </span>
            <span v-else-if="device.provider === 'WECHAT_MINI_PROGRAM'">
              微信登录·小程序
            </span>
            <span v-else-if="device.provider === 'WEB_PHONE'">
              手机号登录·网页版
            </span>
            <span v-else>
              {{ device.provider }}
            </span>
          </p>
          <p class="time">
            {{ formatDate(device.time) }}
          </p>
        </div>
        <div text-sm op-75 class="Device-Item-Extra">
          <span>{{ device.items.length }}条记录</span>
        </div>
      </div>
      <el-table
        v-if="false && historyList?.items" height="100%" strip border size="large" table-layout="auto"
        :data="historyList.items"
      >
        <el-table-column label="IP">
          <template #default="{ row }">
            {{ row.ip }}
          </template>
        </el-table-column>
        <el-table-column label="地址">
          <template #default="{ row }">
            {{ row.address }}
          </template>
        </el-table-column>
        <el-table-column label="设备">
          <template #default="{ row }">
            {{ row.os }}
          </template>
        </el-table-column>
        <el-table-column label="版本">
          <template #default="{ row }">
            {{ row.browser }}
          </template>
        </el-table-column>
        <el-table-column label="方式">
          <template #default="{ row }">
            {{ row.provider }}
          </template>
        </el-table-column>
        <el-table-column label="时间">
          <template #default="{ row }">
            {{ formatDate(row.time) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.Device-Item {
  p.device-name {
    .tag {
      padding: 0.25rem;

      opacity: 0.85;
      font-weight: normal;
      font-size: 11px;
      border-radius: 4px;
      background: var(--el-fill-color-darker);
    }
    font-weight: 600;
  }
  p.method,
  p.time {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
  display: flex;
  padding: 0.5rem 1rem;
  margin: 1rem 0;

  width: 400px;

  align-items: center;
  justify-content: space-between;

  border-radius: 16px;
  background-color: var(--el-mask-color-extra-light);
  box-shadow: var(--el-box-shadow);
}
</style>
