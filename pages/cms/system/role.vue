<script lang="ts" setup>
import dayjs from "dayjs";
import { deleteUser, getRoleList, type MenuGetQuery } from "~/composables/api/account";

definePageMeta({
  name: "角色管理",
  layout: "cms",
  pageTransition: {
    name: "rotate",
  },
});
//-------------------获取角色信息
const roles = ref();

onMounted(async () => {
  roles.value = (await getRoleList()).data;
});


async function fetchData() {
  formLoading.value = true

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
      menus.value = res.data
  }

  formLoading.value = false
}

const formInline = reactive({
  user: "",
  value: "",
  status: "",
  remark: "",
});

function onSubmit() {
  console.log("submit!");
}

function formatDate(date: string) {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

//删除角色
function handleDeleteUser(id: number, data: MenuGetQuery) {
  ElMessageBox.confirm(
    `你确定要删除用户 123 #${id} 吗？删除后这个账户永久无法找回。`,
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
        message: `你永久删除了用户 123 及其相关数据！`,
        type: 'info',
      })
    })
}
//----------------------编辑-----------------------------
const dialogTableVisible = ref(false);

import { reactive } from "vue";

const Editform = reactive({
  user: "",
  region: "",
  date: "",
});

// 菜单权限

import type Node from "element-plus/es/components/tree/src/model/node";
let count = 1;

const props = {
  label: "name",
  children: "zones",
};

const handleCheckChange = (
  data: Tree,
  checked: boolean,
  indeterminate: boolean
) => {
  console.log(data, checked, indeterminate);
};

const loadNode = (node: Node, resolve: (data: Tree[]) => void) => {
  if (node.level === 0) {
    return resolve([{ name: "Root1" }, { name: "Root2" }]);
  }
  if (node.level > 3) return resolve([]);

  let hasChild = false;
  if (node.data.name === "region1") {
    hasChild = true;
  } else if (node.data.name === "region2") {
    hasChild = false;
  } else {
    hasChild = Math.random() > 0.5;
  }
};

const editSubmit = () => {
  console.log("submit!");
};
</script>

<template>
  <el-container class="CmsRole">
    <el-header>
      <el-form :inline="true" :model="formInline">
        <el-form-item label="角色名称">
          <el-input
            v-model="formInline.user"
            placeholder="角色名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="角色值">
          <el-input v-model="formInline.value" placeholder="角色值" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="formInline.status"
            placeholder="状态"
            style="width: 120px;"
          >
            <el-option
              v-for="item in [
                { label: '启用', value: 1 },
                { label: '禁用', value: 0 },
              ]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formInline.remark"
            placeholder="搜索备注"
            clearable
          />
        </el-form-item>

        <el-form-item style="margin-right: 0;" float-right>
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
      <el-table
        v-if="roles?.items"
        stripe
        :data="roles.items"
        style="width: 100%;"
      >
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
          <template #default>
            <el-button plain text size="small">
              详情
            </el-button>

            <el-button
              plain
              text
              size="small"
              type="warning"
              @click="dialogTableVisible = true"
            >
              编辑
            </el-button>
            <el-button
              plain
              text
              size="small"
              type="danger"
              @click="handleDeleteUser(row.id, row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑弹出层 -->
      <el-dialog v-model="dialogTableVisible" title="编辑角色" width="800">
        <!-- 编辑角色表格 -->
        <el-form
          :model="formInline"
          class="demo-form-inline"
          :label-width="100"
        >
          <div class="formItemInline">
            <el-form-item label="角色名称" inline>
              <el-input
                v-model="Editform.user"
                placeholder="Approved by"
                clearable
              />
            </el-form-item>
            <el-form-item label="角色值" inline>
              <el-select
                v-model="Editform.region"
                placeholder="Activity zone"
                clearable
              >
                <el-option label="Zone one" value="shanghai" />
                <el-option label="Zone two" value="beijing" />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="状态">
            <el-switch v-model="Editform.delivery" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="textarea"
              style="width: 240px;"
              :rows="2"
              type="textarea"
              placeholder="超级管理员"
            />
          </el-form-item>

          <el-form-item label="菜单权限">
            <el-tree
              style="max-width: 600px;"
              :props="props"
              :load="loadNode"
              lazy
              show-checkbox
              @check-change="handleCheckChange"
            />
          </el-form-item>

          <el-form-item>
            <el-button @click="dialogTableVisible = false">取消</el-button>

            <el-button type="primary" @click="editSubmit">确认</el-button>
          </el-form-item>
        </el-form>
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
</style>deleteUser, , type MenuGetQuery
