<script lang="ts" setup>
import dayjs from 'dayjs'
import { getRoleList } from '~/composables/api/account'

definePageMeta({
  name: '角色管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const roles = ref()

onMounted(async () => {
  roles.value = (await getRoleList()).data
})

const formInline = reactive({
  user: '',
  value: '',
  status: '',
  remark: '',
})

function onSubmit() {
  console.log('submit!')
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<template>
  <el-container class="CmsRole">
    <el-header>
      <el-form :inline="true" :model="formInline">
        <el-form-item label="角色名称">
          <el-input v-model="formInline.user" placeholder="角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色值">
          <el-input v-model="formInline.value" placeholder="角色值" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formInline.status">
            <el-radio-button :value="0">
              否
            </el-radio-button>
            <el-radio-button :value="1">
              是
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formInline.remark" placeholder="搜索备注" clearable />
        </el-form-item>

        <el-form-item style="margin-right: 0" float-right>
          <el-button @click="onSubmit">
            重置
          </el-button>
          <el-button type="primary" @click="onSubmit">
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-header>

    <ClientOnly>
      <el-table v-if="roles?.items" stripe :data="roles.items" style="width: 100%">
        <el-table-column width="100px" type="index" label="序号" />
        <el-table-column prop="username" label="角色名称">
          <template #default="{ row }">
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="value" label="角色值" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间">
          <template #default="scope">
            {{ formatDate(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default>
            <el-button plain text size="small">
              详情
            </el-button>
            <el-button plain text size="small" type="warning">
              编辑
            </el-button>
            <el-button plain text size="small" type="danger">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- <el-pagination

        v-if="users?.meta"
        v-model:current-page="users.meta.currentPage"
        v-model:page-size="users.meta.totalPages"
        float-right my-4
        :page-sizes="[100, 200, 300, 400]"
        :size="users.meta.itemsPerPage"
        layout="total, sizes, prev, pager, next, jumper"
        :total="users.meta.totalItems"
      /> -->
    </ClientOnly>
  </el-container>
</template>

<style lang="scss">
.CmsRole {
  flex-direction: column;
}
</style>
