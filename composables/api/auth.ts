import { endHttp } from './axios'
import { EndNormalUrl } from '~/constants'

export async function sendSMSCode(phone: string, param: string) {
  return fetch(`${EndNormalUrl}api/auth/sms_code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone,
      param,
    }),
  })
}

export async function useSMSLogin(phone: string, code: string, param: string) {
  return fetch(`${EndNormalUrl}api/auth/sms_login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      phone,
      param,
    }),
  })
}

export function doAccountExist(account?: string) {
  return endHttp.get(`auth/account_exist?account=${account}`)
}
