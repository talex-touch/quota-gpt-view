<script lang="ts" setup>
import { reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { addRole, deleteRole, getMenuList, getRoleInfo, getRoleList, updateRole, type RoleGetReq } from '~/composables/api/account'

definePageMeta({
  name: '角色管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const roles = ref({
  items: [],
  meta: {
    currentPage: 0,
    perPage: 0,
    total: 0,
    totalPages: 0,
    itemsPerPage: 0,
    totalItems: 0,
  },
})
const menus = ref()

onMounted(fetchData)

const findRoleForm = reactive<any>({
  name: '',
  value: '',
  status: '',
  remark: '',
})

const formLoading = ref(false)
//获取角色列表
async function fetchData() {
  formLoading.value = true

  const query: Record<string, any> = {
    page: roles.value.meta.currentPage,
    pageSize: roles.value.meta.itemsPerPage,
    name: findRoleForm.name,
    value: findRoleForm.value,
    status: findRoleForm.status,
    remark: findRoleForm.remark,
  }

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await getRoleList(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200) {
      roles.value = res.data

      menus.value = (await getMenuList({})).data
    }
  }

  formLoading.value = false
}
//重置表单
function handleResetFindRoleForm() {
  findRoleForm.name = ''
  findRoleForm.value = ''
  findRoleForm.status = ''
  findRoleForm.remark = ''
}

//弹窗类型
const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: RoleGetReq | null
  loading: boolean
}>({
  visible: false,
  mode: 'new',
  data: {
    id: 0,
    name: '',
    value: '',
    status: 0,
    remark: '',
    menuIds: [],
    createdAt: '',
    updater: '',
  },
  loading: false,
})

// 编辑 详细
async function handleDialog(data: RoleGetReq | null, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode

  dialogOptions.data = mode === 'new'
    ? {
        id: 0,
        name: '',
        value: '',
        status: 1,
        remark: '',
        menuIds: [],
        createdAt: '',
        updater: '',
      }
    : { ...data } as RoleGetReq

  // if (mode === 'edit') {
  //   const res = await getRoleInfo(data!.id!)

  //   Object.assign(dialogOptions.data, {
  //     ...res.data,
  //   })
  // }

  dialogOptions.visible = true
}

const treeRef = ref()
const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<RoleGetReq>>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 5, max: 24, message: '角色名称需要在 5-24 位之间', trigger: 'blur' },
  ],
  value: [
    { required: true, message: '请输入角色值', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'blur' },
  ],
})

// 删除角色
function handleDeleteRole(id: number) { // 类型
  ElMessageBox.confirm(
    `你确定要删除角色${id} 吗？删除后这个角色永久无法找回。`,
    '确认删除',
    {
      confirmButtonText: '取消',
      cancelButtonText: '确定删除',
      type: 'error',
    },
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: '已取消删除角色！',
      })
    })
    .catch(async () => {
      const res: any = await deleteRole(id) // 需要改
      if (res.code !== 200) {
        ElMessage.error('删除失败！')
        return
      }

      fetchData() // 刷新数据

      ElNotification({
        title: 'Info',
        message: `你永久删除了角色！`,
        type: 'info',
      })
    })
}

// 表单提交
async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid)
      return

    const data = dialogOptions.data!

    data.menuIds = treeRef.value.getCheckedNodes() ?? [] // 如果menuIds为undefined，则提供一个空数组;

    if (dialogOptions.mode !== 'new') {
      const res: any = await updateRole(data!.id!, data as RoleGetReq)

      if (res.code === 200) {
        ElMessage.success('修改成功！')
        dialogOptions.visible = false
        fetchData()
      }
      else {
        ElMessage.error(res.message ?? '修改失败！')
      }
    }
    else {
      const res: any = await addRole(data)

      if (res.code === 200) {
        ElMessage.success('添加成功！')
        dialogOptions.visible = false
        fetchData()
      }
      else {
        ElMessage.error(res.message ?? '添加失败！')
      }
    }

    dialogOptions.loading = false
  })
}

const menuListTreeProps = {
  children: 'children',
  label: 'name', // 更改为 label 以匹配 el-tree 的 prop
  id: 'id',
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  formEl.resetFields()
}
</script>

<template>
  <el-container class="CmsRole">
    <el-main>
      <el-form :disabled="formLoading" :inline="true" :model="findRoleForm">
        <el-form-item label="角色名称">
          <el-input v-model="findRoleForm.name" placeholder="角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色值">
          <el-input v-model="findRoleForm.value" placeholder="角色值" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="findRoleForm.status">
            <el-radio-button :value="0">
              否
            </el-radio-button>
            <el-radio-button :value="1">
              是
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="findRoleForm.remark" placeholder="搜索备注" clearable />
        </el-form-item>

        <el-form-item style="margin-right: 0;" float-right>
          <el-button @click="handleResetFindRoleForm">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="fetchData">
            查询
          </el-button>
          <el-button type="success" @click="handleDialog(null, 'new')">
            新建角色
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-main>
          <el-row>
            <el-col :span="24">
              <el-table v-if="roles?.items" :data="roles.items" style="width: 100%;">
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
                      {{ scope.row.status === 1 ? "启用" : "禁用" }}
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
                  <template #default="{ row }">
                    <el-button plain text size="small" @click="handleDialog(row, 'read')">
                      详情
                    </el-button>
                    <el-button plain text size="small" type="warning" @click="handleDialog(row, 'edit')">
                      编辑
                    </el-button>
                    <el-button plain text size="small" type="danger" @click="handleDeleteRole(row.id)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>

          <el-pagination
            v-if="roles?.meta" v-model:current-page="roles.meta.currentPage"
            v-model:page-size="roles.meta.itemsPerPage" float-right my-4 :page-sizes="[10, 30, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper" :total="roles.meta.totalItems" @change="fetchData"
          />
        </el-main>
      </ClientOnly>
    </el-main>

    <el-drawer v-model="dialogOptions.visible" :close-on-click-modal="false" :close-on-press-escape="false" width="800">
      <template #header>
        <h4>
          <span v-if="dialogOptions.mode === 'new'">新建</span>
          <span v-else-if="dialogOptions.mode === 'edit'">编辑</span>
          <span v-else-if="dialogOptions.mode === 'read'">查看</span>角色信息<span v-if="dialogOptions.data" mx-4 op-50>#{{
            dialogOptions.data.id }}</span>
        </h4>
      </template>

      <template #default>
        <el-form
          v-if="dialogOptions.data" ref="ruleFormRef"
          :disabled="dialogOptions.loading || dialogOptions.mode === 'read'" style="max-width: 600px"
          :model="dialogOptions.data" :rules="rules" label-width="auto" status-icon
        >
          <div class="formItemInline">
            <el-form-item label="角色名称" inline>
              <el-input v-model="dialogOptions.data.name" placeholder="请输入角色名称..." clearable />
            </el-form-item>

            <el-form-item label="角色值" inline>
              <!-- <el-select v-model="dialogOptions.data.value" placeholder="请输入角色值" clearable>
                <el-option label="admin" value="admin" />
                <el-option label="user" value="user" />
              </el-select> -->
              <el-input v-model="dialogOptions.data.value" placeholder="请输入角色值..." clearable />

            </el-form-item>
          </div>

          <el-form-item label="状态">
            <el-radio-group v-model="dialogOptions.data.status">
              <el-radio-button :value="0">
                已禁用
              </el-radio-button>
              <el-radio-button :value="1">
                未禁用
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="dialogOptions.data.remark" :rows="2" type="textarea" placeholder="请输入备注..." />
          </el-form-item>
          <el-form-item label="菜单权限">
            <el-tree
              ref="treeRef"
              :default-checked-keys="dialogOptions.data.menuIds" :data="menus" show-checkbox node-key="id"
              :props="menuListTreeProps"
            />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <template v-if="dialogOptions.mode === 'read'">
            <el-button @click="dialogOptions.visible = false">
              关闭
            </el-button>
          </template>
          <template v-else>
            <el-button @click="dialogOptions.visible = false">
              取消
            </el-button>
            <el-button @click="resetForm(ruleFormRef)">
              重置
            </el-button>
            <el-button :loading="dialogOptions.loading" type="primary" @click="submitForm(ruleFormRef)">
              {{ dialogOptions.mode !== 'new' ? "修改" : "新增" }}
            </el-button>
          </template>
        </div>
      </template>
    </el-drawer>
  </el-container>
</template>

<style lang="scss">

</style>
