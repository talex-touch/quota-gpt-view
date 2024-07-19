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

export function getUsers() {
  return endHttp.get('system/users')
}

export function getRoleList() {
  return endHttp.get('system/roles')
}
