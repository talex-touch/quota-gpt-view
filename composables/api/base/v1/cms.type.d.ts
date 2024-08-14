export interface IRoleModel extends Record<string, any> {
  /**
   * 关联菜单、权限编号
   */
  menuIds: string[]
  /**
   * 角色名称
   */
  name: string
  order: string
  /**
   * 角色备注
   */
  remark: string
  /**
   * 状态
   */
  status: number
  /**
   * 角色值
   */
  value: string

  id?: number
  updatedAt?: string
  createdAt?: string
}

export interface IRoleModelQuery extends IRoleModel {
  page: number
  pageSize: number
}

export interface IParamConfigModel extends Record<string, any> {

  /**
   * 参数名称
   */
  name: string
  order?: string
  page?: number
  updatedAt?: string
  createdAt?: string
}

export interface IParamConfigModelQuery extends IParamConfigModel {
  page: number
  pageSize: number
}

export interface IDictTypeModel extends Record<string, any> {
  code: string

  /**
   * 字典类型名称
   */
  name: string
  order?: string
  updatedAt?: string
  createdAt?: string
}

export interface IDictTypeModelQuery extends IDictTypeModel {
  page: number
  pageSize: number
}

export interface IDictItemModel extends Record<string, any> {

  /**
   * 字典编码
   */
  code: string

  /**
   * 字典名称
   */
  name: string
  /**
   * 备注
   */
  remark: string
  /**
   * 状态
   */
  status: number
  /**
   * 创建者
   */
  creator: string

  /**
   * 更新者
   */
  updater: string

  id: number
  updatedAt: Date
  createdAt: Date
}

export interface IDictItemModelQuery extends IDictItemModel {
  page: number
  pageSize: number
  /**
   * 字典类型 ID
   */
  typeId: number
  /**
   * 字典项值
   */
  value?: string
  /**
   * 字典项键名
   */
  label?: string
}

export interface ITasksModel extends Record<string, any> {

  /**
   * cron表达式
   */
  cron?: string
  /**
   * 执行参数
   */
  data?: string
  /**
   * 结束时间
   */
  endTime?: string
  /**
   * 执行间隔，毫秒单位
   */
  every?: number

  /**
   * 限制执行次数，负数则无限制
   */
  limit?: number
  /**
   * 任务名称
   */
  name?: string

  /**
   * 任务备注
   */
  remark?: string
  /**
   * 调用的服务
   */
  service?: string
  /**
   * 开始时间
   */
  startTime?: string
  /**
   * 任务状态
   */
  status?: number
  /**
   * 任务类别：cron | interval
   */
  type?: number

  id: number
  updatedAt: Date
  createdAt: Date
}

export interface ITasksModelQuery extends ITasksModel {
  page: number
  pageSize: number

}
