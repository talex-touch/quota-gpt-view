<script lang="ts" generic="T" setup>
import { reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getMenuList } from '~/composables/api/account'
import { $endApi } from '~/composables/api/base'
import type { IRoleModel, IRoleModelQuery, IStandardPageModel } from '~/composables/api/base/index.type'

const props = defineProps<{
  name: string
  list: IStandardPageModel<T>
  templateData: any
  rules: FormRules<TemplateType>
}>()

definePageMeta({
  name: `${props.name}管理`,
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

type TemplateType = IRoleModel

const { list: mutableList, crudDialogOptions, listForm, formLoading, fetchData, resetQueryForm, handleCrudDialog, handleDeleteData, submitForm } = props.templateData

onMounted(fetchData)

const ruleFormRef = ref<FormInstance>()

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  formEl.resetFields()
}

function getData(data: any) {
  return data as T
}
</script>

<template>
  <el-container class="CmsTemplate">
    <el-main>
      <el-form :disabled="formLoading" :inline="true" :model="listForm">
        <slot name="QueryForm" />

        <slot name="QueryFormAction">
          <el-form-item style="margin-right: 0;" float-right>
            <el-button @click="resetQueryForm">
              重置
            </el-button>
            <el-button :loading="formLoading" type="primary" @click="fetchData">
              查询
            </el-button>
            <el-button type="success" @click="handleCrudDialog(null, 'NEW')">
              新建{{ name }}
            </el-button>
          </el-form-item>
        </slot>
      </el-form>

      <ClientOnly>
        <el-main>
          <el-row>
            <el-col :span="24">
              <el-table v-if="list?.items" :data="list.items" style="width: 100%;">
                <slot name="TableColumn" />

                <slot name="TableColumnAction">
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
                </slot>
              </el-table>
            </el-col>
          </el-row>

          <el-pagination
            v-if="list?.meta" v-model:current-page="mutableList.meta.currentPage"
            v-model:page-size="mutableList.meta.itemsPerPage" float-right my-4 :page-sizes="[15, 30, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper" :total="list.meta.totalItems" @change="fetchData"
          />
        </el-main>
      </ClientOnly>
    </el-main>

    <slot />

    <el-drawer v-model="crudDialogOptions.visible" :close-on-click-modal="false" :close-on-press-escape="false">
      <template #header>
        <h4>
          <span v-if="crudDialogOptions.mode === 'NEW'">新建</span>
          <span v-else-if="crudDialogOptions.mode === 'EDIT'">编辑</span>
          <span v-else-if="crudDialogOptions.mode === 'READ'">查看</span>{{ name }}信息<span
            v-if="crudDialogOptions.data"
            mx-4 op-50
          >#{{
            crudDialogOptions.data.id }}</span>
        </h4>
      </template>

      <template #default>
        <el-form
          v-if="crudDialogOptions.data" ref="ruleFormRef"
          :disabled="crudDialogOptions.loading || crudDialogOptions.mode === 'READ'" style="max-width: 600px"
          :model="crudDialogOptions.data" :rules="rules" label-width="auto" status-icon
        >
          <slot :data="getData(crudDialogOptions.data)" name="CrudForm" />
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <slot name="CrudFormAction">
            <template v-if="crudDialogOptions.mode === 'READ'">
              <el-button @click="crudDialogOptions.visible = false">
                关闭
              </el-button>
            </template>
            <template v-else>
              <el-button @click="crudDialogOptions.visible = false">
                取消
              </el-button>
              <el-button @click="resetForm(ruleFormRef)">
                重置
              </el-button>
              <el-button :loading="crudDialogOptions.loading" type="primary" @click="submitForm(ruleFormRef)">
                {{ crudDialogOptions.mode !== 'NEW' ? "修改" : "新增" }}
              </el-button>
            </template>
          </slot>
        </div>
      </template>
    </el-drawer>
  </el-container>
</template>

<style lang="scss">
section.CmsTemplate {
  .el-main {
    width: 100%;
  }
  position: absolute;

  overflow: hidden;
}
</style>
