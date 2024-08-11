<script lang="ts" setup>
import dayjs from 'dayjs'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { type UserQuery, addDict, addUser, delDict, deleteUser, getAllDictList, getDepartmentList, getDictList, getRoleList, getUsers, queryDictInfo, updateDict, updateUser } from '~/composables/api/account'


definePageMeta({
  name: '字典管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})


interface DictType {
    id: number;
    createdAt: string;
    updatedAt: string;
    creator: string;
    updater: string;
    name: string;
    code: string;
    status: number;
    remark: string;
}





const treeDom = ref()
const treeFilterQuery = ref()


const formLoading = ref(false)
const dicts = ref({
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

const formInline = reactive({
  id: '',

})

function handleReset() {
  formInline.id = ''

}

async function searchData() {
  formLoading.value = true

  const res: any = (await queryDictInfo(formInline.id))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {

    if (res.code === 200)
    // console.log("======= res.code =======\n", res);
      dicts.value.items = res.data
  }

  formLoading.value = false
}





onMounted(fetchData)

async function fetchData() {
  formLoading.value = true

  const query: any = {}

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await getAllDictList())
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {

    if (res.code === 200)
    console.log("======= res.code =======\n", res);
    formatDates(res.data)
    dicts.value.items = res.data
  }

  formLoading.value = false
}

//对子部门的时间进行递归处理
function formatDates(depts: any[]) {
  depts.forEach(dept=>{
    dept.createdAt = formatDate(dept.createdAt)
    dept.updatedAt = formatDate(dept.updatedAt)
    if (dept.children && dept.children.length > 0) {
      formatDates(dept.children) // 递归处理子部门
    }

  })
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}



// watch(() => formInline.deptId, () => {
//   fetchData()
// })

const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: DictType | null
  loading: boolean
}>({
  visible: false,
  mode: 'edit',
  data: null,
  loading: false,
})

function handleDialog(data: DictType | null, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode
  dialogOptions.visible = true
  dialogOptions.data = (mode === 'new'
    ? {

      }
    : { ...data }) as any

  // dialogOptions.data.deptId = dialogOptions.data.dept?.id ?? 0
}

const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<any>>({

})



async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid)
      return

    dialogOptions.loading = true

    if (dialogOptions.mode !== 'new') {
      const res: any = await updateDict(dialogOptions.data!.id!, dialogOptions.data as any)

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
      const res: any = await addDict(dialogOptions.data as any)

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

function handleDeleteDict(id: number) {
  ElMessageBox.confirm(
    `你确定要删除吗？删除后这个字典永久无法找回。`,
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
        message: '已取消删除！',
      })
    })
    .catch(async () => {
      const res: any = await delDict(id)
      if (res.code !== 200) {
        ElMessage.error('删除失败！')
        return
      }

      fetchData()

      ElNotification({
        title: 'Info',
        message: `你永久删除了及其相关数据！`,
        type: 'info',
      })
    })
}


// watch(treeFilterQuery, (val) => {
//   nextTick(() => treeDom.value!.filter(val))
// }, { immediate: true })




const router = useRouter()
 function handleCellClick(column:any ) {
   console.log("======= column =======\n", column);
    
      if(column.property=='code'){
        router.push({ path: '/cms/system/dict-type/'+column.id })
      }
      
      // 在这里处理单元格被点击的逻辑
    }
</script>

<template>
  <el-container class="CmsUser">
    <el-main>
      <!-- 横排form -->
      <el-form :disabled="formLoading" :inline="true" :model="formInline">
        <el-form-item label="字典编码">
          <el-input v-model="formInline.id" minlength="4" placeholder="搜索字典编码" clearable />
        </el-form-item>
        <el-form-item style="margin-right: 0;" float-right>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="searchData">
            查询
          </el-button>
          <el-button type="success" @click="handleDialog(null, 'new')">
            新建字典管理
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="dicts?.items" :data="dicts.items" style="width: 100%;"  >
          <el-table-column prop="id" label="ID" />
          <el-table-column prop="name" label="字典名称" />
          <el-table-column prop="code" label="字典编码">
            <template #default="{ row }">
              <!-- <NuxtLink :to="`/cms/system/dict-type/${row.id}`"> {{ row.id }}</NuxtLink> -->
              <!-- <NuxtLink :to="'/cms/system/dict-type/'+row.id"> {{ row.code }}</NuxtLink> -->
              <NuxtLink :to="{name:'字典项管理',params:{id:row.id, } ,query: { code: row.code }}"> {{ row.code }}</NuxtLink>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" >
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
          <el-table-column prop="creator" label="创建者" />
          <el-table-column prop="createdAt" label="创建时间" />
          <el-table-column prop="updatedAt" label="更新时间" />

          <el-table-column fixed="right" label="操作" width="200">
            <template #default="{ row }">
              <el-button plain text size="small" @click="handleDialog(row, 'read')">
                详情
              </el-button>
              <el-button plain text size="small" type="warning" @click="handleDialog(row, 'edit')">
                编辑
              </el-button>
              <el-button plain text size="small" type="danger" @click="handleDeleteDict(row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="dicts?.meta"
          v-model:current-page="dicts.meta.currentPage"
          v-model:page-size="dicts.meta.itemsPerPage"
          float-right
          my-4
          :page-sizes="[10, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="dicts.meta.totalItems"
          @change="fetchData"
        />
      </ClientOnly>
    </el-main>

    <el-drawer v-model="dialogOptions.visible" :close-on-click-modal="false" :close-on-press-escape="false">
      <template #header>
        <h4>
          <span v-if="dialogOptions.mode === 'new'">新建</span>
          <span v-else-if="dialogOptions.mode === 'edit'">编辑</span>
          <span v-else-if="dialogOptions.mode === 'read'">查看</span>字典信息<span v-if="dialogOptions.data" mx-4 op-50>#{{ dialogOptions.data.id }}</span>
        </h4>
      </template>
      <template #default>
        <el-form
          v-if="dialogOptions.data"
          ref="ruleFormRef"
          :disabled="dialogOptions.loading || dialogOptions.mode === 'read'"
          style="max-width: 600px;"
          :model="dialogOptions.data"
          :rules="rules"
          label-width="auto"
          class="demo-ruleForm"
          status-icon
        >
          <el-form-item label="字典名称" prop="name">
            <el-input v-model="dialogOptions.data.name" placeholder="字典名称" />
          </el-form-item>
          <el-form-item label="字典编码" prop="code">
            <el-input v-model="dialogOptions.data.code" placeholder="字典编码 " />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-input v-model="dialogOptions.data.status" placeholder="状态 " />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="dialogOptions.data.remark" placeholder="备注" />
          </el-form-item>
          <!-- <el-form-item label="创建者" prop="creator">
            <el-input v-model="dialogOptions.data.creator" placeholder="创建者" />
          </el-form-item> -->
          <el-form-item v-if="dialogOptions.mode === 'edit'" label="更新者" prop="updater">
            <el-input v-model="dialogOptions.data.updater" placeholder="更新者" />
          </el-form-item>
          <!-- <el-form-item label="创建时间" prop="createdAt">
            <el-input v-model="dialogOptions.data.createdAt" placeholder="创建时间" />
          </el-form-item> -->
          <el-form-item label="更新时间" v-if="dialogOptions.mode === 'edit'" prop="updatedAt">
            <el-input v-model="dialogOptions.data.updatedAt" placeholder="更新时间" />
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
