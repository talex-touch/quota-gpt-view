<script lang="ts" setup>

import { $endApi } from '~/composables/api/base';
import type { IDictTypeModel, IDictTypeModelQuery } from '~/composables/api/base/v1/cms.type';


definePageMeta({
  name: '字典管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})


type TemplateType = IDictTypeModel
const $dataApi = $endApi.v1.cms.dictType

const templateData = genCmsTemplateData<TemplateType, IDictTypeModelQuery, null>({
  getDeleteBoxTitle(id) {
    return ` 字典#${id} `
  },
  getEmptyModel: () => ({
    code:'',
    name: '',
    remark: '',
    status: 1,
    creator: '' ,
    updater: '' ,
  }),
  onFetchSuccess: async () => {

  },
  transformSubmitData(originData) {
    return originData
  },
  getList: $dataApi.list,
  create: $dataApi.create,
  update: $dataApi.update,
  delete: $dataApi.delete,
}, {
 
  name: '',
  code: '',
})

const { list, listForm, fetchData, handleCrudDialog, handleDeleteData } = templateData




















</script>

<template>
  <TemplateStandardCms :rules="rules" :list="list" :template-data="templateData" name="字典项">
    <template #QueryForm>
      <el-form-item label="字典编码">
          <el-input v-model="listForm.code" minlength="4" placeholder="搜索字典编码" clearable />
        </el-form-item>
    </template>
    <template #TableColumn>
      <el-table-column prop="id" label="ID" />
          <el-table-column prop="name" label="字典名称" />
          <el-table-column prop="code" label="字典编码">
            <template #default="{ row }">
           
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
              <el-button plain text size="small" @click="handleCrudDialog(row, 'READ')">
            详情
          </el-button>
          <el-button plain text size="small" type="warning" @click="handleCrudDialog(row, 'EDIT')">
            编辑
          </el-button>
          <el-button plain text size="small" type="danger" @click="handleDeleteData(row.id)">
            删除
          </el-button>
            </template>
          </el-table-column>
    </template>
    <template #CrudForm="{ data }">
      <!-- <div class="formItemInline">
        <el-form-item label="字典名称" inline>
          <el-input v-model="data.label" placeholder="请输入字典名称..." clearable />
        </el-form-item>

        <el-form-item label="字典值" inline>
          <el-input v-model="data.value" placeholder="请输入角色值..." clearable />
        </el-form-item>
      </div> -->

      <el-form-item label="字典名称" prop="name">
            <el-input v-model="data.name" placeholder="字典名称" />
          </el-form-item>
          <el-form-item label="字典编码" prop="code">
            <el-input v-model="data.code" placeholder="字典编码 " />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-input v-model="data.status" placeholder="状态 " />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="data.remark" placeholder="备注" />
          </el-form-item>
    
          <el-form-item label="更新者" prop="updater">
            <el-input v-model="data.updater" placeholder="更新者" />
          </el-form-item>1
       
          <el-form-item label="更新时间"  prop="updatedAt">
            <el-input v-model="data.updatedAt" placeholder="更新时间" />
          </el-form-item>
    </template>
  </TemplateStandardCms>
  


  

</template>

<style lang="scss">
.CmsUser {
  .el-aside {
    border-right: 1px solid var(--el-border-color);
  }
}
</style>
