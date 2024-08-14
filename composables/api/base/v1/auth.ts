import { endHttp } from '../../axios'
import type { ILoginToken } from './auth.type'

export default {
  serverStatus() {
    return endHttp.get('auth/status')
  },
  renewToken(): ILoginToken {
    return endHttp.get('auth/renew_token')
  },
}
