<script setup lang="ts">
import dayjs from 'dayjs'
import { getHistoryList } from '~/composables/api/account'

const historyList = ref()

onMounted(async () => {
  const res: any = await getHistoryList()

  if (res.code !== 200)
    return ElMessage.error(res.message)

  historyList.value = res.data
})

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
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
      <el-table v-if="historyList?.items" height="100%" strip border size="large" table-layout="auto" :data="historyList.items">
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
:deep(.el-table) {
  --el-table-bg-color: var(--el-bg-color-page);
  --el-table-tr-bg-color: var(--el-bg-color-page);
  --el-table-header-bg-color: var(--el-bg-color-page);
}

.ProfileWrapper-Main {
  height: calc(100% - 80px);
}

.ProfileWrapper-Start {
  position: absolute;

  left: 2rem;

  align-items: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-right: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
