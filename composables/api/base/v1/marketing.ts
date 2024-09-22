//营销管理

import { endHttp } from '../../axios'
import type { IBannerGroupQuery, ICreateBannerGroupDto, IUpdateBannerGroupDto } from './marketing.type'

export default {
  banner: {
    list(data: IBannerGroupQuery) {
      endHttp.get('marketing/banner/list', data)
    },

    create(data: ICreateBannerGroupDto) {
      return endHttp.post('marketing/banner', data)
    },

    update(id: number, data: IUpdateBannerGroupDto) {
      return endHttp.put(`marketing/banner/${id}`, data)
    },

    delete(id: number) {
      return endHttp.del(`marketing/banner/${id}`)
    },
  },
}
