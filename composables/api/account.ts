import { endHttp } from './axios'

export function getAccountDetail() {
  return endHttp.get('account/profile')
}

export function getPermissionList() {
  return endHttp.get('account/permissions')
}

export function getMenuList() {
  return endHttp.get('system/menus')
}

export function getDepartmentList() {
  return endHttp.get('system/depts')
}

export interface UserQuery {
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

export function getUsers(data?: Partial<UserQuery>) {
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
}

export function updateUser(id: string, query: UserQuery) {
  return endHttp.put(`system/users/${id}`, query)
}

export function deleteUser(id: string) {
  return endHttp.del(`system/users/${id}`)
}
