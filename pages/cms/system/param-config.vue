<script lang="ts" setup>
import dayjs from 'dayjs'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { type ParamConfigEntity , addParam, delParam, deleteUser, getDepartmentList, getParamList, getRoleList, getUsers, queryParamInformation, updateParam, updateUser } from '~/composables/api/account'


definePageMeta({
  name: '参数配置',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})



const formLoading = ref(false)
const params = ref({
  items: [] as Partial<ParamConfigEntity>[],
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
  id:  null,
})

function handleReset() {
  formInline.id = null
}



async function searchData() {
  formLoading.value = true
  if(formInline.id!){
    const res: any = (await queryParamInformation(formInline.id ))

    if (!res) {
    ElMessage.warning('参数错误，查询失败！')
    }
     else {

    if (res.code === 200)
    console.log("======= ressearchData =======\n", res);
    params.value = res.data
      if(res.data===null){
        ElMessage.warning('查询为空！')
      }
  }

  formLoading.value = false
  }else{


    fetchData();
    formLoading.value = false

  }

}




onMounted(fetchData)


async function fetchData() {
  formLoading.value = true

  const query: any = {
    page: params.value.meta.currentPage | 1,
    pageSize: params.value.meta.itemsPerPage | 10,
    id:formInline.id,
  }

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await getParamList(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200) {

      params.value =  res.data


    }
  }

  formLoading.value = false
}


function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: Partial<ParamConfigEntity> | null
  loading: boolean
}>({
  visible: false,
  mode: 'edit',
  data: null,
  loading: false,
})

function handleDialog(data: Partial<ParamConfigEntity> | null, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode
  dialogOptions.visible = true
  dialogOptions.data = (mode === 'new'
    ? {

      }
    : { ...data }) as Partial<ParamConfigEntity>


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
      const res: any = await updateParam(dialogOptions.data!.id!, dialogOptions.data as Partial<ParamConfigEntity>)

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
      const res: any = await addParam(dialogOptions.data as Partial<ParamConfigEntity>)

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

function  handleDeleteParams(id: number, data: ParamConfigEntity) {
  ElMessageBox.confirm(
    `你确定要删除字典项 ${data.name}(${data.remark}) #${id} 吗？删除后这个字典项永久无法找回。`,
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
      const res: any = await delParam(id)
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
        <el-form-item label="ID">
          <el-input v-model="formInline.id" minlength="4" placeholder="请输入ID" clearable />
        </el-form-item>
        <el-form-item style="margin-right: 0;" float-right>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="searchData">
            查询
          </el-button>
          <el-button type="success" @click="handleDialog(null, 'new')">
            新建参数
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="params?.items" :data="params.items" style="width: 100%;">
          <el-table-column prop="id" label="ID"   />
          <el-table-column prop="name" label="参数名称"   />
          <el-table-column prop="key" label="Key"   />
          <el-table-column prop="value" label="Value"   />
          <el-table-column prop="remark" label="备注"   />
          <el-table-column prop="createdAt" label="创建时间"   />
          <el-table-column prop="updatedAt" label="更新时间"   />
          <el-table-column fixed="right" label="操作" width="200">
            <template #default="{ row }">
              <el-button plain text size="small" @click="handleDialog(row, 'read')">
                详情
              </el-button>
              <el-button plain text size="small" type="warning" @click="handleDialog(row, 'edit')">
                编辑
              </el-button>
              <el-button plain text size="small" type="danger" @click="handleDeleteParams(row.id,row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            v-if="params?.meta"
            v-model:current-page="params.meta.currentPage"
            v-model:page-size="params.meta.itemsPerPage"
            float-right
            my-4
            :page-sizes="[100, 200, 300, 400]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="params.meta.totalItems"
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
      
          :model="dialogOptions.data"
          :rules="rules"
          label-width="auto"

          status-icon
        >
        


          <el-form-item prop="name" label="参数名称"   >
            <el-input v-model="dialogOptions.data.name" :disabled="dialogOptions.mode !== 'new'" />
          </el-form-item>

          <el-form-item prop="name" label="Key"   >
            <el-input v-model="dialogOptions.data.key" :disabled="dialogOptions.mode !== 'new'" />
          </el-form-item>


          <el-form-item prop="name" label="Value"   >
            <el-input v-model="dialogOptions.data.value" :disabled="dialogOptions.mode !== 'new'" />
          </el-form-item>
          

          <el-form-item prop="name" label="备注"   >
            <el-input v-model="dialogOptions.data.remark" :disabled="dialogOptions.mode !== 'new'" />
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
              重置参数
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

<style lang="scss"></style>
