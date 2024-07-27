import { endHttp } from './axios'

export function getAccountDetail() {
  return endHttp.get('account/profile')
}

export function getPermissionList() {
  return endHttp.get('account/permissions')
}

export function getAccountMenuList() {
  return endHttp.get('account/menus')
}

export function getDepartmentList() {
  return endHttp.get('system/depts')
}

export interface UserGetQuery {
  page: number
  pageSize: number
  username: string
  deptId: number
  nickname: string
  email: string
  phone: string
  qq: string
  remark: string
  status: number
}

export function getUsers(data?: Partial<UserGetQuery>) {
  return endHttp.get('system/users', data)
}

export function getRoleList() {
  return endHttp.get('system/roles')
}

export interface UserQuery {
  id: string
  username: string
  nickname: string
  avatar: string
  qq: string
  email: string
  phone: string
  remark: string
  status: number
  roleIds: number[]
  dept: string
  password: string
}

export function addUser(query: UserQuery) {
  return endHttp.post('system/users', query)
}

export function updateUser(id: string, query: UserQuery) {
  return endHttp.put(`system/users/${id}`, query)
}

export function deleteUser(id: string) {
  return endHttp.del(`system/users/${id}`)
}

export interface MenuGetQuery {
  /**
   * 菜单路由路径或外链
   */
  component?: string
  /**
   * 外链打开方式
   */
  extOpenMode?: number
  /**
   * 是否外链
   */
  isExt?: boolean
  /**
   * 是否开启页面缓存
   */
  keepAlive?: number
  /**
   * 菜单或权限名称
   */
  name?: string
  /**
   * 前端路由地址
   */
  path?: string
  /**
   * 状态
   */
  status?: number
  /**
   * 菜单类型
   */
  type?: number
}

export function getMenuList(query: MenuGetQuery) {
  return endHttp.get('system/menus', {
    query,
  })
}

export function updateMenu(id: number, query: MenuGetQuery) {
  return endHttp.put(`system/menus/${id}`, query)
}

export function addMenu(query: MenuGetQuery) {
  return endHttp.post('system/menus', query)
}

export function delMenu(id: number) {
  return endHttp.del(`system/menus/${id}`)
}

export function getHistoryList() {
  return endHttp.get('account/login_histories')
}

export function addDept(body: any) {
  return endHttp.post('system/depts', body)
}
