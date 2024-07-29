<script lang="ts" setup>
import dayjs from "dayjs";
import { addRole, deleteRole, deleteUser, getMenuList, getRoleList, updateRole, type MenuGetQuery, type RoleGetQuery } from "~/composables/api/account";

definePageMeta({
  name: "角色管理",
  layout: "cms",
  pageTransition: {
    name: "rotate",
  },
});


function formatDate(date: string) {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}
//-------------------获取角色信息
const roles = ref();

onMounted(()=>{
  fetchData()
  fetchMenu()
})


//查询角色管理列表信息 数据初始化

const formLoading =ref(false)
//查询角色管理列表信息 数据初始化

async function fetchData() {
  formLoading.value = true

  refreshCurrentUserRPM()

  const res: any = (await getRoleList())
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200)
    roles.value= res.data
  }

  formLoading.value = false
}


//查询角色
const findRoleForm = reactive({
  user: "",
  value: "",
  status: "",
  remark: "",
});
//重置
function resetFindRoleForm(){
  findRoleForm.user = "",
  findRoleForm.value = "",
  findRoleForm.status = "" ,
  findRoleForm.remark = ""
}
//表单查询
function findSubmit(){

  //发起请求


}





//----------------------新增角色-----------------------------

type RoleGetQueryType<T extends RoleGetQuery> = Partial<{
  [K in keyof T as string]: T[K]
}>






const popOverOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data:RoleGetQuery
  loading: boolean
}>({
  visible: false,
  mode: 'new',
  data: {
    id: 0,
    name: "",
    value: "",
    status: 0,
    remark: "",
    menuIds: [],
    createdAt: "",
    updater: ""
  },
  loading: false,
})


//编辑 详细
function handleDialog(data: RoleGetQuery, mode: 'edit' | 'read' | 'new') {
console.log("=======handleDialog data =======\n", data);

  popOverOptions.mode = mode
  popOverOptions.visible = true
  popOverOptions.data = mode === 'new'
    ? {
id: 0,
  name: '',
  value: '',
  status: 1,
  remark: '',
  menuIds:[1,2],
  createdAt:"",
  updater:"",
      }
    : { ...data }


}


//删除角色
function handleDeleteRole(id: number) { //类型
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
      const res: any = await deleteRole(id)   //需要改
      if (res.code !== 200) {
        ElMessage.error('删除失败！')
        return
      }

      fetchData()                 // 刷新数据

      ElNotification({
        title: 'Info',
        message: `你永久删除了角色！`,
        type: 'info',
      })
    })
}

//表单提交
async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid)
      return

    const data = popOverOptions.data
  

    if (popOverOptions.mode !== 'new') {
      const res: any = await updateRole(popOverOptions.data.id!, data as RoleGetQuery)

      if (res.code === 200) {
        ElMessage.success('修改成功！')
        popOverOptions.visible = false
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
        popOverOptions.visible = false
        fetchData()
      }
      else {
        ElMessage.error(res.message ?? '添加失败！')
      }
    }

    popOverOptions.loading = false
  })
}









//----------------------编辑-----------------------------
const dialogTableVisible = ref(false);

import { reactive } from "vue";
import type { FormInstance } from "element-plus";


// 菜单权限
//获取权限菜单
type MenuGetQueryType<T extends MenuGetQuery> = Partial<{
  [K in keyof T as string]: T[K]
}>
const menus = ref();
async function fetchMenu() {

  formLoading.value  =true;

  refreshCurrentUserRPM()

  const query: MenuGetQueryType<MenuGetQuery> = {
    name: '',
  }

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await getMenuList(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {

    if (res.code === 200)
    console.log("======= res.code =======\n", res);
      menus.value = res.data
  }

  formLoading.value = false
}

let count = 1;

// 定义树节点的数据结构
interface MenuTree {
  name: string;
  id: number;
  icon: string;
  children?: MenuTree[]; // 子节点的数组
}




const menuListTreeProps = {
  children: 'children',
  label: 'name', // 更改为 label 以匹配 el-tree 的 prop
  id: 'id',
}
// 检查变更事件处理器
const handleMenuTreeCheckChange = (
  data: MenuTree,
  checked: boolean,
  indeterminate: boolean
) => {
  console.log(data, checked, indeterminate);

  // 这里可以根据 checked 和 indeterminate 的值执行具体的操作
};

const editSubmit = () => {
  console.log("submit!");
};
</script>

<template>
  <el-container class="CmsRole">
    <el-header>
      <el-form :disabled="formLoading" :inline="true" :model="findRoleForm">
        <el-form-item label="角色名称">
          <el-input
            v-model="findRoleForm.user"
            placeholder="角色名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="角色值">
          <el-input
            v-model="findRoleForm.value"
            placeholder="角色值"
            clearable
          />
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
          <el-input
            v-model="findRoleForm.remark"
            placeholder="搜索备注"
            clearable
          />
        </el-form-item>

        <el-form-item style="margin-right: 0;" float-right>
          <el-button @click="resetFindRoleForm">
            重置
          </el-button>
          <el-button type="primary" @click="findSubmit">
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-header>

    <ClientOnly>
      <el-main>
        <el-row>
          <el-col :span="12">
            <div>
              角色管理：
              <el-icon>
                <WarningFilled />
              </el-icon>
            </div>
          </el-col>
          <el-col :span="4" :offset="8">
            <el-button plain type="primary" @click="handleDialog({}, 'new')">
              新增
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              plain
              size="small"
              type="warning"
              @click="dialogTableVisible = true"
            >
              编辑
            </el-button>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-table
              v-if="roles?.items"
              stripe
              :data="roles.items"
              style="width: 100%;"
            >
              <el-table-column width="100px" type="index" label="序号" />

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
                  <el-button
                    plain
                    text
                    size="small"
                    @click="handleDialog(row, 'read')"
                  >
                    详情
                  </el-button>
                  <el-button
                    plain
                    text
                    size="small"
                    type="warning"
                    @click="handleDialog(row, 'edit')"
                  >
                    编辑
                  </el-button>
                  <el-button
                    plain
                    text
                    size="small"
                    type="danger"
                    @click="handleDeleteRole(row.id)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-main>

      <!-- 编辑弹出层 -->
      <el-dialog v-model="popOverOptions.visible" width="800">
        <template #header>
          <h4>
            <span v-if="popOverOptions.mode === 'new'">新建角色</span>
            <span v-else-if="popOverOptions.mode === 'edit'">编辑角色</span>
            <span v-else-if="popOverOptions.mode === 'read'">查看角色</span>
          </h4>
        </template>
        <!-- 编辑角色表格 -->

        <template #default>
          <el-form
            :model="popOverOptions"
            class="demo-form-inline"
            :label-width="100"
            :show-header="true"
          >
            <div class="formItemInline">
              <el-form-item label="角色名称" inline>
                <el-input
                  v-model="popOverOptions.data.name"
                  placeholder="Approved by"
                  clearable
                />
              </el-form-item>

              <el-form-item label="角色值" inline>
                <el-select
                  v-model="popOverOptions.data.value"
                  placeholder="user"
                  clearable
                >
                  <el-option label="admin" value="admin" />
                  <el-option label="user" value="user" />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="状态">
              <el-switch v-model="popOverOptions.data.status" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="popOverOptions.data.remark"
                style="width: 240px;"
                :rows="2"
                type="textarea"
                placeholder="超级管理员"
              />
            </el-form-item>

            <el-form-item label="菜单权限">
              <el-tree
                style="max-width: 600px;"
                :data="menus"
                show-checkbox
                node-key="id"
                :default-expanded-keys="[2, 3]"
                :default-checked-keys="[5]"
                :props="menuListTreeProps"
                 @check-change="handleMenuTreeCheckChange"
              />
            </el-form-item>

            <el-form-item>
              <el-button @click="dialogTableVisible = false">取消</el-button>

              <el-button type="primary" @click="submitForm">确认</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-dialog>

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
