import AuthApi from './v1/auth'
import CmsApi from './v1/cms'
import CommonApi from './v1/common'

export const $endApi = {
  v1: {
    auth: AuthApi,
    cms: CmsApi,
    common: CommonApi,
  },
}
