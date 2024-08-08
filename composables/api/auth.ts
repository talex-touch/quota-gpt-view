import { endHttp } from './axios'
import { globalOptions } from '~/constants'

export async function sendSMSCode(phone: string, param: string) {
  return fetch(`${globalOptions.getEndsUrl()}api/auth/sms_code`, {
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

export async function useSMSLogin(phone: string, code: string, param: string, state?: string) {
  return fetch(`${globalOptions.getEndsUrl()}api/auth/sms_login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      phone,
      param,
      state,
    }),
  })
}

export function doAccountExist(account?: string) {
  return endHttp.get(`auth/account_exist?account=${account}`)
}

export enum Platform {
  WECHAT = 'wechat',
}

export function postQrCodeReq(platform: Platform) {
  return endHttp.post('platform/qrcode', { platform })
}

export function getQrCodeStatus(platform: Platform, key: string) {
  return endHttp.get('platform/qrcode/status', { platform, key })
}

export function qrCodeLogin(code: string) {
  return endHttp.get('auth/platform_login', { code })
}

export function feishuLogin(code: string) {
  return endHttp.get('auth/platform_login/feishu', { code })
}
