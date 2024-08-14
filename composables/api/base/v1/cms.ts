import { endHttp } from '../../axios'
import type { IDataResponse, IPageResponse, IStandardPageModel, IStandardResponse } from '../index.type'
import type { IRoleModel, IRoleModelQuery } from './cms.type'

export default {
  role: {
    list(query: IRoleModelQuery) {
      return endHttp.get('system/roles', query) as Promise<IPageResponse<IRoleModel>>
    },
    create(query: IRoleModel) {
      return endHttp.post('system/roles', query)
    },
    get(id: number | string) {
      return endHttp.get(`system/roles/${id}`) as Promise<IDataResponse<IRoleModel>>
    },
    update(id: number | string, query: IRoleModel) {
      return endHttp.put(`system/roles/${id}`, query) as Promise<IDataResponse<IRoleModel>>
    },
    delete(id: number | string) {
      return endHttp.del(`system/roles/${id}`) as Promise<IStandardResponse>
    },
  },
}
