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

export interface IDictItemModel extends Record<string, any> {
  /**
   * 字典项键名
   */
  label?: string
  order?: string
  /**
   * 字典类型 ID
   */
  typeId: number
  /**
   * 字典项值
   */
  value?: string

  id?: number
  updatedAt?: string
  createdAt?: string
}

export interface IDictItemModelQuery extends IDictItemModel {
  page: number
  pageSize: number
}
