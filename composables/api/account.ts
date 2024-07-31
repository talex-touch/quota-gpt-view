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

export interface RoleEditQuery {
  /**
   * 序号
   */
  id?: number

  /**
   * 角色名称
   */
  name: string
  /**
   * 角色值
   */
  value: string
  /**
   * 状态
   */
  status: number
  /**
   * 备注
   */
  remark: string
  /**
   * 菜单id
   */
  menuIds: number[]
  /**
   * 创建时间
   */
  createdAt: string
  /**
   * 更新
   */
  updater: string
}

export interface RoleGetQuery {
  page: number
  pageSize: number
  name: string
  value: string
  remark: string
  status: number
}

export function getRoleList(query?: Partial<UserGetQuery>) {
  return endHttp.get('system/roles', query)
}

// 新增角色
export function addRole(data: RoleEditQuery) {
  return endHttp.get('system/roles', data)
}
// 获取角色信息

export function getRoleInfo(id: number) {
  return endHttp.get(`system/roles/${id}`)
}
// 更新角色
export function updateRole(id: number, body: any) {
  return endHttp.put(`system/roles/${id}`, body)
}
// 删除角色
export function deleteRole(id: number) {
  return endHttp.del(`system/roles/${id}`)
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
  dept: any
  password: string
}

export function addUser(query: UserQuery) {
  return endHttp.post('system/users', query)

  // axios({
  //   method: "POST",
  //   data: query
  // })
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

export function getParamList(Query: any) {
  return endHttp.get('system/param-config', Query)
}

export function addParam(Header: any) {
  return endHttp.post('system/param-config', Header)
}

export function inquireParamInformation(Path: any) {
  return endHttp.get('system/param-config/{id}', Path)
}

export function updateParam(Path: any) {
  return endHttp.post('system/param-config/{id}', Path)
}

export function delParam(Path: any) {
  return endHttp.post('system/param-config/{id}', Path)
}

export function getDictList(Query: any) {
  return endHttp.get('system/dict-type', Query)
}

export function addDict(Header: any) {
  return endHttp.post('system/dict-type', Header)
}

export function getAllDictList(Header: any) {
  return endHttp.get('system/dict-type/select-options', Header)
}

export function inquireDictInformation(Path: any) {
  return endHttp.get('system/dict-type/{id}', Path)
}

export function updateDict(Header: any) {
  return endHttp.post('system/dict-type/{id}', Header)
}

export function delDict(Path: any) {
  return endHttp.post('system/param-config/{id}', Path)
}
