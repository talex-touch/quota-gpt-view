<script lang="ts" setup>
import dayjs from 'dayjs'
import NormalUser from '~/components/personal/NormalUser.vue'

definePageMeta({
  name: '流量监控',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const formLoading = ref(false)
const logs = ref({
  items: [],
  meta: {
    currentPage: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
    itemsPerPage: 0,
    totalItems: 0,
  },
})

const formInline = reactive({
  message_type: 0,
  model: '',
  status: '',
})

function handleReset() {
  formInline.message_type = 0
  formInline.model = ''
  formInline.status = ''
}

onMounted(fetchData)

async function fetchData() {
  if (formLoading.value)
    return

  formLoading.value = true

  const query: ChatLogQueryDto = {
    page: logs.value.meta.currentPage,
    pageSize: logs.value.meta.itemsPerPage,
    message_type: formInline.message_type,
    model: formInline.model,
    status: formInline.status,
  }

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await chatAdminManager.list(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200)
      logs.value = res.data
  }

  formLoading.value = false
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<template>
  <el-container class="CmsUser">
    <el-main>
      <el-form :disabled="formLoading" :inline="true" :model="formInline">
        <el-form-item label="MessageType">
          <el-input v-model="formInline.message_type" placeholder="搜索MessageType" clearable />
        </el-form-item>
        <el-form-item label="Model">
          <el-input v-model="formInline.model" placeholder="搜索Model" clearable />
        </el-form-item>
        <el-form-item label="Status">
          <el-input v-model="formInline.status" placeholder="搜索Status" clearable />
        </el-form-item>

        <el-form-item style="margin-right: 0" float-right>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="fetchData">
            查询
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="logs?.items" table-layout="auto" :data="logs.items" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="类型">
            <template #default="{ row }">
              <el-tag type="warning" color="#5273E015">
                {{ deserializeMsgType(+row.message_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="用户">
            <template #default="{ row }">
              <div v-if="row.user">
                <NormalUser :data="row.user" />
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="模型">
            <template #default="{ row }">
              <el-tag>
                {{ row.model }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="耗时">
            <template #default="{ row }">
              {{ ((+row.duration) / 1000).toFixed(2) }}s
            </template>
          </el-table-column>
          <el-table-column label="流式">
            <template #default="{ row }">
              <el-tag v-if="row.is_stream" type="success">
                流式
              </el-tag>
              <el-tag v-else type="warning">
                非流
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="提示">
            <template #default="{ row }">
              {{ row.prompt_tokens }}
            </template>
          </el-table-column>
          <el-table-column label="补全">
            <template #default="{ row }">
              {{ row.completion_tokens }}
            </template>
          </el-table-column>
          <el-table-column label="消费">
            <template #default="{ row }">
              {{ row.cost }}$
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              {{ row.status }}
            </template>
          </el-table-column>
          <el-table-column label="用户IP">
            <template #default="{ row }">
              {{ row.user_ip }}
            </template>
          </el-table-column>
          <el-table-column label="设备信息">
            <template #default="{ row }">
              {{ row.device_info }}
            </template>
          </el-table-column>
          <el-table-column label="对话ID">
            <template #default="{ row }">
              {{ row.session_id }}
            </template>
          </el-table-column>
          <el-table-column label="最后更新">
            <template #default="{ row }">
              {{ formatDate(row.updated_at) }}
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="logs?.meta" v-model:current-page="logs.meta.currentPage"
          v-model:page-size="logs.meta.itemsPerPage" float-right my-4 :page-sizes="[10, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="logs.meta.totalItems" @change="fetchData"
        />
      </ClientOnly>
    </el-main>
  </el-container>
</template>

<style lang="scss">
.CmsUser {
  .el-aside {
    border-right: 1px solid var(--el-border-color);
  }
}
</style>
