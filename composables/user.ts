import { getAccountDetail, getPermissionList, getUserSubscription } from './api/account'
import { endHttp } from './api/axios'

export interface AccountDetail {
  id: number
  token: string
  createdAt: string
  updatedAt: string
  username: string
  nickname: string
  avatar: string
  qq: string
  email: string
  phone: string
  remark: string
  status: number
  roles: string[]
  permissions: string[]
  isAdmin: boolean
  subscription: any
}

export const userStore = useLocalStorage<Partial<AccountDetail>>('user', {})

Object.defineProperty(userStore.value, 'isAdmin', {
  get() {
    if (!userStore.value.token)
      return false

    return !!userStore.value.roles?.find((item: any) => item.id === 1)
  },
})

watch(() => userStore.value.token, async () => {
  if (!userStore.value.token)
    return

  await refreshCurrentUserRPM()
  await refreshUserSubscription()
}, { deep: true, immediate: true })

export async function refreshUserSubscription() {
  const { data } = await getUserSubscription()
  if (!data)
    return

  userStore.value.subscription = data
}

/**
 * RPM: Role Permission Menu
 */
export async function refreshCurrentUserRPM() {
  const res = await getAccountDetail()
  Object.assign(userStore.value, res.data)

  const permissions = await getPermissionList()
  userStore.value.permissions = permissions.data
}

export function updateAccountDetail(obj: { nickname: string, avatar: string }) {
  return endHttp.put(`account/update`, obj)
}

export function userHavePermission(permission: string) {
  return userStore.value.permissions?.includes(permission)
}
