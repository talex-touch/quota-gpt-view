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
  createdAt?: string
}

export interface IRoleModelQuery extends IRoleModel {
  page: number
  pageSize: number
}
