import { getAccountDetail, getPermissionList } from './api/account'
import { EndNormalUrl } from '~/constants'

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
}

export const userStore = useLocalStorage<Partial<AccountDetail>>('user', {})

Object.defineProperty(userStore.value, 'isAdmin', {
  get() {
    return !!userStore.value.roles?.find((item: any) => item.id === 1)
  },
})

watch(() => userStore.value.token, async () => {
  if (!userStore.value.token)
    return

  const res = await getAccountDetail()
  Object.assign(userStore.value, res.data)

  const permissions = await getPermissionList()
  userStore.value.permissions = permissions.data
}, { deep: true, immediate: true })

export function updateAccountDetail(obj: { nickname: string, avatar: string }) {
  return fetch(`${EndNormalUrl}/api/account/update`, {
    method: 'PUT',
    headers: {
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userStore.value.token}`,
    },
    body: JSON.stringify(obj),
  })
}

export function userHavePermission(permission: string) {
  return userStore.value.permissions?.includes(permission)
}
