import type { FormInstance } from 'element-plus'
import type { IPageResponse, IStandardPageModel, IStandardResponse } from './api/base/index.type'

export interface TemplateDataHandler<T extends Record<string, any>, PageT extends T> {
  getEmptyModel: () => T
  onFetchSuccess: () => Promise<void>
  transformSubmitData: (originData: T, mode: CrudMode) => any
  getList: (query: PageT & { page: number, pageSize: number }) => Promise<IPageResponse<T>>
  update: (id: string | number, data: T) => Promise<IStandardResponse>
  create: (data: T) => Promise<IStandardResponse>
  delete: (id: string | number) => Promise<IStandardResponse>

  getDeleteBoxTitle: (id: string | number) => string
}

export type CrudMode = 'NEW' | 'EDIT' | 'READ'

export function genCmsTemplateData<T extends Record<string, any> & { id?: number | string }, PageT extends T & { page: number, pageSize: number }, O extends Record<string, any> | null>(dataHandler: TemplateDataHandler<T, PageT>, queryData: Partial<T>) {
  const formLoading = ref(false)
  const list = shallowRef<IStandardPageModel<T>>({
    items: [],
    meta: {
      currentPage: 0,
      itemCount: 0,
      totalPages: 0,
      itemsPerPage: 0,
      totalItems: 0,
    },
  })

  type QueryDataType<T> = { [key in keyof T]: T[key] }
  const internalQueryData = reactive<QueryDataType<T>>(JSON.parse(JSON.stringify(queryData)))

  async function fetchData() {
    formLoading.value = true

    const query: Record<string, any> = {
      page: list.value.meta.currentPage,
      pageSize: list.value.meta.itemsPerPage,
      ...internalQueryData,
    }

    // 过滤掉为空的值
    Object.entries(query).forEach(([key, value]) => {
      if (!value)
        delete query[key]
    })

    const res = (await dataHandler.getList(query as PageT))
    if (res.code === 200) {
      list.value = res.data!

      dataHandler.onFetchSuccess()
    }
    else { ElMessage.error(res.message || '参数错误，查询失败！') }

    formLoading.value = false
  }

  const crudDialogOptions = reactive<{
    visible: boolean
    mode: CrudMode
    data: T | null
    loading: boolean
    meta: Partial<O>
  }>({
    visible: false,
    mode: 'NEW',
    data: null,
    loading: false,
    meta: {},
  })

  function handleCrudDialog(data: T | null, mode: CrudMode, meta?: Partial<O>) {
    Object.assign(crudDialogOptions, {
      meta,
      mode,
      data: data || dataHandler.getEmptyModel(),
      visible: true,
    })
  }

  async function submitForm(formEl: FormInstance | undefined) {
    if (!formEl)
      return

    await formEl.validate(async (valid) => {
      if (!valid)
        return

      const data = crudDialogOptions.data as T | undefined

      if (!data) {
        ElMessage.error('流程数据错误！')
        return
      }

      crudDialogOptions.loading = true
      const submitData = dataHandler.transformSubmitData(data, crudDialogOptions.mode)

      if (crudDialogOptions.mode === 'EDIT') {
        const res: any = await dataHandler.update(submitData.id!, submitData)

        if (res.code === 200) {
          ElMessage.success('修改成功！')
          crudDialogOptions.visible = false

          fetchData()
        }
        else {
          ElMessage.error(res.message ?? '修改失败！')
        }
      }
      else {
        const res: any = await dataHandler.create(data)

        if (res.code === 200) {
          ElMessage.success('添加成功！')
          crudDialogOptions.visible = false

          fetchData()
        }
        else {
          ElMessage.error(res.message ?? '添加失败！')
        }
      }

      crudDialogOptions.loading = false
    })
  }

  async function handleDeleteData(id: string | number) {
    ElMessageBox.confirm(
      `你确定要删除${dataHandler.getDeleteBoxTitle(id)} 吗？删除后这个${dataHandler.getDeleteBoxTitle(id)}永久无法找回。`,
      '是否确认删除',
      {
        confirmButtonText: '取消',
        cancelButtonText: '确定删除',
        type: 'error',
      },
    )
      .then(() => {
        ElMessage({
          type: 'success',
          message: `已取消删除${dataHandler.getDeleteBoxTitle(id)}！`,
        })
      })
      .catch(async () => {
        const res = await dataHandler.delete(id)

        if (res.code !== 200) {
          ElMessage.error(res.message || '删除失败！')
          return
        }

        fetchData() // 刷新数据

        ElNotification({
          title: 'Info',
          message: `你永久删除了${dataHandler.getDeleteBoxTitle(id)}！`,
          type: 'info',
        })
      })
  }

  return {
    list,
    listForm: internalQueryData,
    formLoading,
    crudDialogOptions,

    fetchData,
    submitForm,
    handleCrudDialog,
    handleDeleteData,
    resetQueryForm() {
      Object.assign(internalQueryData, queryData)
    },
  }
}
