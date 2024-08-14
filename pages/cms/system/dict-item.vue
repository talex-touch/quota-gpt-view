<script lang="ts" setup>
import dayjs from 'dayjs'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { isTemplateSpan } from 'typescript'
import { type DictItemsListReq, type DictItemsRequest, type DictTypeEntity, type UserQuery, addDictItems, addUser, deleteUser, getAllDictList, getDepartmentList, getDictItemsList, getRoleList, queryDictItemsInfo, updateDictItems, updateUser } from '~/composables/api/account'
import UserAvatar from '~/components/personal/UserAvatar.vue'
import UserUploadAvatar from '~/components/personal/UserUploadAvatar.vue'

definePageMeta({
  name: '字典项管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const route: Record<string, any> = useRoute()
console.log('======= route =======\n', route)
const id: number = Number(route.params.id)
const codeType: string = route.query.code
console.log('======= codeType =======\n', codeType)

onMounted(() => {
  // initData()
  fetchData(),
  getType()
})

/**
 * 根据id获取字典项
 * dictItems：字典项列表
 */
// async function initData(){

//   formLoading.value = true

//   const res:any =  await queryDictItemsInfo(id)

//   if (!res) {
//     ElMessage.warning('参数错误，查询失败！')
//   }
//   else {
//     if (res.code === 200) {
//       dictItems.value.items = res.data

//     }
//   }

//   formLoading.value = false
// }

const formLoading = ref(false)
const dictItems = ref({
  items: [] as DictTypeEntity[],
  meta: {
    currentPage: 0,
    perPage: 0,
    total: 0,
    totalPages: 0,
    itemsPerPage: 0,
    totalItems: 0,
  },
})

const formInline = reactive({
  id: null,

})

function handleReset() {
  formInline.id = null
}

async function searchData() {
  formLoading.value = true
  if (formInline.id!) {
    const res: any = (await queryDictItemsInfo(formInline.id))

    if (!res) {
      ElMessage.warning('参数错误，查询失败！')
    }
    else {
      if (res.code === 200)
        console.log('======= ressearchData =======\n', res)
      dictItems.value = res.data
      if (res.data === null)
        ElMessage.warning('查询为空！')
    }

    formLoading.value = false
  }
  else {
    fetchData()
    formLoading.value = false
  }
}

async function fetchData() {
  formLoading.value = true

  const query: Record<string, any> = {
    page: dictItems.value.meta.currentPage | 1,
    pageSize: dictItems.value.meta.itemsPerPage | 10,
    typeId: id,
  }

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await getDictItemsList(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    console.log('======= res.cod1e =======\n', res)
    if (res.code === 200)

      dictItems.value = res.data
  }

  formLoading.value = false
}

// watch(() => formInline.deptId, () => {
//   fetchData()
// })

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: Partial<DictItemsRequest> | null
  loading: boolean
}>({
  visible: false,
  mode: 'edit',
  data: null,
  loading: false,
})

const typeSList = ref<any[]>([])

/**
 * 获取字典类型，code，名称，id，为选择器服务
 */
async function getType() {
  const res: any = (await getAllDictList())
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    console.log('======= res.code11 =======\n', res)
    if (res.code === 200) {
      res.data.map((item: any) => {
        console.log('======= item =======\n', item)
        typeSList.value.push({
          name: item.name,
          id: item.id,
          code: item.code,
        })
      })
    }
  }
}

function handleDialog(data: DictItemsRequest | null, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode
  dialogOptions.visible = true
  dialogOptions.data = (mode === 'new'
    ? {

      }
    : { ...data }) as DictItemsRequest
}

const ruleFormRef = ref<FormInstance>()

// const rules = reactive<FormRules<UserForm>>({
//   username: [
//     { required: true, message: '请输入用户名称', trigger: 'blur' },
//     { min: 5, max: 24, message: '用户名需要在 5-24 位之间', trigger: 'blur' },
//   ],
//   nickname: [
//     { required: true, message: '请输入用户昵称', trigger: 'blur' },
//     { min: 5, max: 24, message: '用户名需要在 5-24 位之间', trigger: 'blur' },
//   ],
//   password: [
//     { required: true, message: '请输入用户密码', trigger: 'blur' },
//     { min: 6, max: 16, message: '用户密码需要在 6-16 位之间', trigger: 'blur' },
//     { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/, message: '用户密码必须包含数字和字母', trigger: 'blur' },
//   ],
//   avatar: [
//     { required: true, message: '请上传头像', trigger: 'blur' },
//   ],
//   // qq: [
//   //   { required: true, message: '请输入QQ号', trigger: 'blur' },
//   // ],
//   phone: [
//     { required: true, message: '请输入手机号', trigger: 'blur' },
//   ],
//   status: [
//     { required: true, message: '请选择状态', trigger: 'blur' },
//   ],
// })

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid)
      return

    dialogOptions.loading = true

    if (dialogOptions.mode !== 'new') {
      const res: any = await updateDictItems(dialogOptions.data!.id!, dialogOptions.data as DictItemsRequest)

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
      const res: any = await addDictItems(dialogOptions.data as DictItemsRequest)

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

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  formEl.resetFields()
}

function handleDeleteDictItems(id: number, data: DictItemsRequest) {
  ElMessageBox.confirm(
    `你确定要删除字典项 ${data.label}(${data.value}) #${id} 吗？删除后这个字典项永久无法找回。`,
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
        message: '已取消删除用户！',
      })
    })
    .catch(async () => {
      const res: any = await deleteUser(`${id}`)
      if (res.code !== 200) {
        ElMessage.error('删除失败！')
        return
      }

      fetchData()

      ElNotification({
        title: 'Info',
        message: `你永久删除了用户 ${data.username}(${data.nickname}) #${id} 及其相关数据！`,
        type: 'info',
      })
    })
}
</script>

<template>
  <el-container class="CmsUser">
    <el-main>
      <el-form :disabled="formLoading" :inline="true" :model="formInline">
        <el-form-item label="所属字典类型id">
          <el-input v-model="formInline.id" minlength="4" placeholder="根据id查字典项" clearable />
        </el-form-item>
        <el-form-item style="margin-right: 0;" float-right>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="searchData">
            查询
          </el-button>
          <el-button type="success" @click="handleDialog(null, 'new')">
            新建字典项
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="dictItems?.items" :data="dictItems.items" style="width: 100%;">
          <el-table-column prop="id" label="所属字典类型" width="240">
            <template #default="{ row }">
              {{ row.id }}- {{ codeType }}
            </template>
          </el-table-column>
          <el-table-column prop="label" label="字典项名称" width="240" />
          <el-table-column prop="value" label="字典项值" width="240" />
          <el-table-column prop="orderNo" label="排序" width="240" />

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
              <el-button plain text size="small" @click="handleDialog(row, 'read')">
                详情
              </el-button>
              <el-button plain text size="small" type="warning" @click="handleDialog(row, 'edit')">
                编辑
              </el-button>
              <el-button plain text size="small" type="danger" @click=" handleDeleteDictItems(row.id, row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="dictItems?.meta"
          v-model:current-page="dictItems.meta.currentPage"
          v-model:page-size="dictItems.meta.itemsPerPage"
          float-right
          my-4
          :page-sizes="[10, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dictItems.meta.totalItems"
          @change="fetchData"
        />
      </ClientOnly>
    </el-main>

    <el-drawer v-model="dialogOptions.visible" :close-on-click-modal="false" :close-on-press-escape="false">
      <template #header>
        <h4>
          <span v-if="dialogOptions.mode === 'new'">新建</span>
          <span v-else-if="dialogOptions.mode === 'edit'">编辑</span>
          <span v-else-if="dialogOptions.mode === 'read'">查看</span>用户信息<span v-if="dialogOptions.data" mx-4 op-50>#{{ dialogOptions.data.id }}</span>
        </h4>
      </template>

      <template #default>
        <el-form
          v-if="dialogOptions.data"
          ref="ruleFormRef"
          :disabled="dialogOptions.loading || dialogOptions.mode === 'read'"
          style="max-width: 600px;"
          :model="dialogOptions.data"
          label-width="auto"
          status-icon
        >
          <el-form-item label="所属字典类型" prop="typeId">
            <el-select v-model="dialogOptions.data.typeId" placeholder="请选择所属字典类型">
              <el-option v-for="item in typeSList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="字典项名称" prop="label">
            <el-input v-model="dialogOptions.data.label" />
          </el-form-item>
          <el-form-item label="字典项值" prop="value">
            <el-input v-model="dialogOptions.data.value" :disabled="dialogOptions.mode !== 'new'" type="password" />
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="dialogOptions.data.status">
              <el-radio-button :value="0">
                已禁用
              </el-radio-button>
              <el-radio-button :value="1">
                未禁用
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="dialogOptions.data.remark" placeholder="请输入备注..." type="textarea" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto;">
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
              {{ dialogOptions.mode !== 'new' ? '修改' : '新增' }}
            </el-button>
          </template>
        </div>
      </template>
    </el-drawer>
  </el-container>
</template>

<style lang="scss">
.CmsUser {
  .el-aside {
    border-right: 1px solid var(--el-border-color);
  }
}
</style>
