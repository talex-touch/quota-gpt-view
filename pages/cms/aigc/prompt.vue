<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import UserAvatar from '~/components/personal/UserAvatar.vue'
import UserUploadAvatar from '~/components/personal/UserUploadAvatar.vue'
import { $completion } from '~/composables/completion/init'
import StandardPrompt from '~/composables/completion/standard-prompt.txt?raw'
import RenderContentOld from '~/components/render/RenderContentOld.vue'

definePageMeta({
  name: 'PromptTemplate管理',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})

const formLoading = ref(false)
const prompts = ref({
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

const PromptEngineer = ref(`\`\`\`markdown\n${StandardPrompt} \n\`\`\``)
const formInline = reactive({
  title: '',
})

function handleReset() {
  formInline.title = ''
}

onMounted(fetchData)

async function fetchData() {
  formLoading.value = true

  const query: Record<string, any> = {
    page: prompts.value.meta.currentPage,
    pageSize: prompts.value.meta.itemsPerPage,
    title: formInline.title,
  }

  // 过滤掉为空的值
  Object.entries(query).forEach(([key, value]) => {
    if (!value)
      delete query[key]
  })

  const res: any = (await chatAdminManager.promptList(query))
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200)

      prompts.value = res.data
  }

  formLoading.value = false
}
const dialogOptions = reactive<{
  visible: boolean
  mode: 'edit' | 'read' | 'new'
  data: PromptEntityDto | null
  loading: boolean
  meta: {
    stashContent: string
    polish: boolean
    translation: boolean
    dialog: boolean
  }
}>({
  visible: false,
  mode: 'edit',
  data: null,
  loading: false,
  meta: {
    stashContent: '',
    polish: false,
    translation: false,
    dialog: false,
  },
})

async function polishContent(type: number) {
  if (!dialogOptions.data?.content)
    return

  const completion = $completion.v1.createCompletion($completion.v1.createEmptyHistoryWithInput(dialogOptions.data?.content))

  completion.registerHandler({
    onCompletionStart() {
      dialogOptions.loading = true
    },
    onCompletion() {
      dialogOptions.meta.stashContent = completion.tempMessage.content

      return false
    },
    onReqCompleted() {
      if (type === 1)
        dialogOptions.meta.polish = true
      else if (type === 2)
        dialogOptions.meta.translation = true

      dialogOptions.loading = false
    },
  })

  await completion.send({
    generateSummary: type + 1,
  })
}

function handleDialog(data: PromptEntityDto | null, mode: 'edit' | 'read' | 'new') {
  dialogOptions.mode = mode
  dialogOptions.visible = true
  dialogOptions.data = (mode === 'new'
    ? {
        id: '',
        avatar: '',
        content: '',
        title: '',
      }
    : { ...data }) as PromptEntityDto

  dialogOptions.meta.stashContent = ''
  dialogOptions.meta.polish = false
  dialogOptions.meta.translation = false
}

const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<PromptEntityDto>>({
  title: [
    { required: true, message: '请输入模板标题', trigger: 'blur' },
    { min: 5, max: 255, message: '模板标题需要在 5-255 位之间', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入模板内容', trigger: 'blur' },
    { min: 200, max: 1024, message: '模板内容需要在 200-1024 位之间', trigger: 'blur' },
  ],
  avatar: [
    { required: true, message: '请上传头像', trigger: 'blur' },
  ],
})

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return
  await formEl.validate(async (valid) => {
    if (!valid)
      return

    dialogOptions.loading = true

    if (dialogOptions.mode !== 'new') {
      const res: any = await chatAdminManager.updateTemplate(`${dialogOptions.data!.id!}`, dialogOptions.data as PromptEntityDto)

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
      const res: any = await chatAdminManager.createTemplate(dialogOptions.data as PromptEntityDto)

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

function handleDeleteUser(id: number, data: PromptEntityDto) {
  // ElMessageBox.confirm(
  //   `你确定要删除用户 ${data.username}(${data.nickname}) #${id} 吗？删除后这个账户永久无法找回。`,
  //   '确认删除',
  //   {
  //     confirmButtonText: '取消',
  //     cancelButtonText: '确定删除',
  //     type: 'error',
  //   },
  // )
  //   .then(() => {
  //     ElMessage({
  //       type: 'success',
  //       message: '已取消删除用户！',
  //     })
  //   })
  //   .catch(async () => {
  //     const res: any = await deleteUser(`${id}`)
  //     if (res.code !== 200) {
  //       ElMessage.error('删除失败！')
  //       return
  //     }

  //     fetchData()

  //     ElNotification({
  //       title: 'Info',
  //       message: `你永久删除了用户 ${data.username}(${data.nickname}) #${id} 及其相关数据！`,
  //       type: 'info',
  //     })
  //   })
}
</script>

<template>
  <el-container class="CmsPrompt">
    <el-main>
      <el-form :disabled="formLoading" :inline="true" :model="formInline">
        <el-form-item label="标题">
          <el-input v-model="formInline.title" minlength="4" placeholder="搜索模板名称" clearable />
        </el-form-item>

        <el-form-item style="margin-right: 0" float-right>
          <el-button @click="handleReset">
            重置
          </el-button>
          <el-button :loading="formLoading" type="primary" @click="fetchData">
            查询
          </el-button>
          <el-button type="success" @click="handleDialog(null, 'new')">
            新建模板
          </el-button>
        </el-form-item>
      </el-form>

      <ClientOnly>
        <el-table v-if="prompts?.items" :data="prompts.items" style="width: 100%">
          <el-table-column type="index" label="序号" />
          <el-table-column label="头像">
            <template #default="scope">
              <UserAvatar :avatar="scope.row.avatar" />
            </template>
          </el-table-column>
          <el-table-column label="标题">
            <template #default="{ row }">
              {{ row.title }}
            </template>
          </el-table-column>
          <el-table-column label="正文字数">
            <template #default="{ row }">
              {{ row.content.length }}字
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0" type="warning">
                等待审核
              </el-tag>
              <el-tag v-else-if="row.status === 1" type="success">
                已通过
              </el-tag>
              <el-tag v-else-if="row.status === 2" type="danger">
                未通过
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="最后更新">
            <template #default="{ row }">
              <PersonalNormalUser :data="row.updater" />
            </template>
          </el-table-column>
          <el-table-column label="创建者">
            <template #default="{ row }">
              <PersonalNormalUser :data="row.creator" />
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="200">
            <template #default="{ row }">
              <el-button plain text size="small" @click="handleDialog(row, 'read')">
                详情
              </el-button>
              <el-button :disabled="true" plain text size="small" type="warning" @click="handleDialog(row, 'edit')">
                编辑
              </el-button>
              <el-button :disabled="true" plain text size="small" type="danger" @click="handleDeleteUser(row.id, row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="prompts?.meta" v-model:current-page="prompts.meta.currentPage"
          v-model:page-size="prompts.meta.itemsPerPage" float-right my-4 :page-sizes="[10, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="prompts.meta.totalItems" @change="fetchData"
        />
      </ClientOnly>
    </el-main>

    <el-drawer v-model="dialogOptions.visible" size="50%" :close-on-click-modal="false" :close-on-press-escape="false">
      <template #header>
        <h4>
          <span v-if="dialogOptions.mode === 'new'">新建</span>
          <span v-else-if="dialogOptions.mode === 'edit'">编辑</span>
          <span v-else-if="dialogOptions.mode === 'read'">查看</span>模板信息<span v-if="dialogOptions.data" mx-4 op-50>#{{
            dialogOptions.data.id }}</span>
        </h4>
      </template>
      <template #default>
        <el-form
          v-if="dialogOptions.data" ref="ruleFormRef"
          :disabled="dialogOptions.loading || dialogOptions.mode === 'read'" style="max-width: 1280px"
          :model="dialogOptions.data" :rules="rules" label-width="auto" status-icon
        >
          <el-form-item label="模板头像" prop="avatar">
            <UserUploadAvatar
              v-model="dialogOptions.data.avatar!"
              :disabled="dialogOptions.loading || dialogOptions.mode === 'read'"
            />
          </el-form-item>
          <el-form-item v-if="dialogOptions.data && dialogOptions.mode === 'read'" label="模板状态">
            <el-tag v-if="dialogOptions.data.status === 0" type="warning">
              等待审核
            </el-tag>
            <el-tag v-else-if="dialogOptions.data.status === 1" type="success">
              已通过
            </el-tag>
            <el-tag v-else-if="dialogOptions.data.status === 2" type="danger">
              未通过
            </el-tag>
          </el-form-item>
          <el-form-item label="模板标题" prop="title">
            <el-input v-model="dialogOptions.data.title" :maxlength="255" :disabled="dialogOptions.mode !== 'new'" />
          </el-form-item>
          <el-form-item label="模板内容" prop="content">
            <el-input
              v-model="dialogOptions.data.content" show-word-limit :maxlength="1024"
              :autosize="{ minRows: 5, maxRows: 30 }" type="textarea"
            />
          </el-form-item>
          <el-form-item v-if="dialogOptions.mode !== 'read'" label="模板须知" prop="agreement">
            <ul>
              <li>1.当您完成攥写后请依次点击"润色"，"翻译"按钮</li>
              <li>2.系统AI会自动将您的模板进行润色翻译调整</li>
              <li>3.如果您不满意效果可以进行微调</li>
              <li>4.请您仔细核验AI生成的内容，如果存在违规会自动审核失败</li>
              <li>5.如果您发现AI生成的内容违规，请及时联系管理员</li>
              <li>6.您可以在模板中穿插以下变量：{{ `\{\{ history \}\}` }}, {{ `\{\{ input \}\}` }}, {{ `\{\{ memory \}\}` }}</li>
            </ul>
          </el-form-item>
          <el-form-item v-if="dialogOptions.mode !== 'read'" label="操作按钮">
            <el-button
              :loading="dialogOptions.loading" :disabled="dialogOptions.data.content!.length < 200"
              @click="polishContent(0)"
            >
              润色
            </el-button>
            <el-button
              :loading="dialogOptions.loading" :disabled="dialogOptions.data.content!.length < 200"
              @click="polishContent(1)"
            >
              翻译
            </el-button>
            <el-button
              :loading="dialogOptions.loading" :disabled="!dialogOptions.meta.stashContent!.length"
              @click="dialogOptions.data.content = dialogOptions.meta.stashContent!"
            >
              接受
            </el-button>
          </el-form-item>
          <el-form-item v-if="dialogOptions.mode !== 'read'" label="翻译润色" prop="content">
            <el-input
              v-model="dialogOptions.meta.stashContent" :disabled="true" show-word-limit :maxlength="1024"
              :autosize="{ minRows: 5, maxRows: 30 }" type="textarea"
            />
          </el-form-item>

          <el-form-item v-if="dialogOptions.mode !== 'read'" label="提交须知" prop="agreement">
            <ul>
              <li>1.您的提示词需要为英文格式</li>
              <li>2.您的提示词需要保证清晰明了，不能包含任何恶意内容</li>
              <li>3.提示词必须至少200字以保证模板效果</li>
              <li>4.请您在提交之前仔细核验变量</li>
              <li>5.提交后，您的模板将会进入审核流程，审核通过后，您的模板将会在模板市场中展示</li>
            </ul>
          </el-form-item>

          <el-form-item v-if="dialogOptions.mode !== 'read'" label="参考Prompt" prop="agreement">
            <span>
              I want you to act as a prompt generator. Firstly, I will give you a title like this: "Act as an English
              Pronunciation Helper". Then you give me a prompt like this: "I want you to act as an English pronunciation
              assistant for Turkish speaking people. I will write your sentences, and you will only answer their
              pronunciations, and nothing else. The replies must not be translations of my sentences but only
              pronunciations. Pronunciations should use Turkish Latin letters for phonetics. Do not write explanations
              on replies. My first sentence is "how the weather is in Istanbul?"." (You should adapt the sample prompt
              according to the title I gave. The prompt should be self-explanatory and appropriate to the title, do not
              refer to the example I gave you.). My first title is "提示词功能" (Give me prompt only)<el-link
                mx-2
                type="primary" @click="dialogOptions.meta.dialog = true"
              >Prompt工程师参考</el-link>
            </span>
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
            <el-button
              :disabled="!dialogOptions.meta.polish && dialogOptions.meta.translation"
              :loading="dialogOptions.loading" type="primary" @click="submitForm(ruleFormRef)"
            >
              {{ dialogOptions.mode !== 'new' ? "修改" : "新增" }}
            </el-button>
          </template>
        </div>
      </template>
    </el-drawer>

    <el-drawer
      v-model="dialogOptions.meta.dialog" size="50%" :close-on-click-modal="false"
      :close-on-press-escape="false" direction="ltr"
    >
      <template #header>
        <h4>
          标准 PromptEngineer 格式参考
        </h4>
      </template>
      <el-tabs>
        <el-tab-pane label="PromptEngineer">
          <RenderContentOld readonly :data="PromptEngineer" />
        </el-tab-pane>
        <el-tab-pane label="External">
          <div flex gap-2>
            <el-link target="_blank" href="https://prompt-shortcut.writeathon.cn/">
              WriteAthon
            </el-link>
            <el-link target="_blank" href="https://prompts.chat/">
              Prompts
            </el-link>
            <el-link target="_blank" href="https://gpt.candobear.com/prompt">
              CandoBear Prompts
            </el-link>
            <el-link target="_blank" href="https://github.com/langgptai/wonderful-prompts">
              Wonderful Prompts(GitHub)
            </el-link>
            <el-link target="_blank" href="https://huggingface.co/spaces/merve/ChatGPT-prompt-generator">
              Auto Prompt Generator(HuggingFace)
            </el-link>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </el-container>
</template>

<style lang="scss">
.CmsPrompt {
}
</style>
