import { endHttp } from '../../axios'
import type { IDataResponse } from '../index.type'
import type { ILoginToken } from './auth.type'

export default {
  dailyFortune() {
    return endHttp.get('dummy/fortune')
  },
  getUserConfig() {
    return endHttp.get('user-config') as Promise<IDataResponse<any>>
  },
  postUserConfig(pub_info: string, pri_info: string) {
    return endHttp.post('user-config', {
      pub_info,
      pri_info,
    }) as Promise<IDataResponse<any>>
  },
  getTargetUserConfig(uid: number) {
    return endHttp.get(`user-config/user/${uid}`) as Promise<IDataResponse<any>>
  },
  getInvitationRecords() {
    return endHttp.get('invitation/records') as Promise<IDataResponse<any[]>>
  },
}
