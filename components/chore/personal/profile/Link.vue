<script setup lang="ts">
import dayjs from 'dayjs'
import { getUserBindingPlatforms } from '~/composables/api/account'

const links = ref()

onMounted(async () => {
  const res: any = await getUserBindingPlatforms()

  if (res.code !== 200)
    return ElMessage.error(res.message)

  links.value = res.data
})

// function parseMeta(str: string) {
//   return JSON.parse(decodeURIComponent(atob(str)))
// }
</script>

<template>
  <div class="ProfileWrapper">
    <div class="ProfileWrapper-Header">
      <p>第三方绑定</p>
    </div>

    <div class="ProfileWrapper-Main">
      <el-descriptions
        v-for="link in links"
        :key="link.id"
        my-2
        :column="3"
        size="small"
        border
      >
        <template #title>
          <div v-if="link.provider === 'wechat'" flex items-center gap-2>
            <div i-carbon:logo-wechat />
            微信
          </div>
          <div v-else-if="link.provider === 'feishu'" flex items-center gap-2>
            <div i-carbon:link />
            飞书
          </div>
        </template>

        <template #extra>
          <el-button disabled type="primary">
            解绑
          </el-button>
        </template>

        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              ID
            </div>
          </template>
          {{ link.openId }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              绑定时间
            </div>
          </template>
          {{ formatDate(link.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              标记
            </div>
          </template>
          <el-tag v-if="link.isActive" size="small">
            已激活
          </el-tag>
          <el-tag v-else type="warning">
            未激活
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              附加数据
            </div>
          </template>
          -
          <!-- {{ parseMeta(link.meta) }} -->
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
