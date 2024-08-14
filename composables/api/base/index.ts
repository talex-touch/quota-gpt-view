import AuthApi from './v1/auth'
import CmsApi from './v1/cms'

export const $endApi = {
  v1: {
    auth: AuthApi,
    cms: CmsApi,
  },
}
