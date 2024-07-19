<script lang="ts" setup>
import dayjs from 'dayjs'
import { getDepartmentList, getUsers } from '~/composables/api/account'
import UserAvatar from '~/components/personal/UserAvatar.vue'
import { EndNormalUrl } from '~/constants'

definePageMeta({
  name: '用户管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const defaultProps = {
  children: 'children',
  label: 'name',
}

const treeFilterQuery = ref()
const depts = ref()

const users = ref()

onMounted(async () => {
  depts.value = (await getDepartmentList()).data

  users.value = (await getUsers()).data

  console.log('2', users.value)
})

const formInline = reactive({
  user: '',
  email: '',
  phone: '',
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
  <el-container class="CmsUser">
    <el-aside width="320px">
      <el-header>
        <p font-bold>
          组织架构
        </p>
        <el-input v-model="treeFilterQuery" style="width: 200px" placeholder="搜索部门" />
      </el-header>

      <el-tree style="max-width: 600px" :data="depts" :props="defaultProps" />
    </el-aside>

    <el-main>
      <el-form :inline="true" :model="formInline">
        <el-form-item label="用户名">
          <el-input v-model="formInline.user" placeholder="搜索用户名" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formInline.email" placeholder="搜索邮箱" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formInline.phone" placeholder="搜索手机号" clearable />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formInline.remark" placeholder="搜索备注" clearable />
        </el-form-item>

        <el-form-item>
          <el-button @click="onSubmit">
            重置
          </el-button>
          <el-button type="primary" @click="onSubmit">
            查询
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="users?.items" :data="users.items" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="date" label="头像" width="80">
            <template #default="scope">
              <UserAvatar :avatar="scope.row.avatar" />
            </template>
          </el-table-column>
          <el-table-column prop="username" label="用户名(昵称)" width="180">
            <template #default="{ row }">
              {{ row.username }}<span op-50>({{ row.nickname }})</span>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" width="180" />
          <el-table-column prop="department" label="部门" width="180">
            <template #default="{ row }">
              <el-tag v-if="row.dept">
                {{ row.dept.name }}
              </el-tag>
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" width="180" />
          <el-table-column prop="role" label="角色" width="180">
            <template #default="{ row }">
              <span v-if="row.roles?.length">
                <el-tag v-for="role in row.roles" :key="role.id"> {{ role.name }}</el-tag>
              </span>
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="180">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" width="180" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="200">
            <template #default="{ row }">
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

        <el-pagination

          v-if="users?.meta"
          v-model:current-page="users.meta.currentPage"
          v-model:page-size="users.meta.totalPages"
          float-right my-4
          :page-sizes="[100, 200, 300, 400]"
          :size="users.meta.itemsPerPage"
          layout="total, sizes, prev, pager, next, jumper"
          :total="users.meta.totalItems"
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
