import { endHttp } from '../../axios'
import type { IDataResponse, IPageResponse, IStandardPageModel, IStandardResponse } from '../index.type'
import type { IDictItemModel, IDictItemModelQuery, IRoleModel, IRoleModelQuery, IUserModel, IUserModelQuery } from './cms.type'

export default {

  users: {
    list(query: IUserModelQuery) {
      return endHttp.get('system/roles', query) as Promise<IPageResponse<IUserModel>>
    },
    create(Body : IUserModel) {
      return endHttp.post('system/roles', Body )
    },
    get(id: number | string) {
      return endHttp.get(`system/roles/${id}`) as Promise<IDataResponse<IUserModel>>
    },
    update(id: number | string, Body : IUserModel) {
      return endHttp.put(`system/roles/${id}`, Body ) as Promise<IDataResponse<IUserModel>>
    },
    delete(id: number | string) {
      return endHttp.del(`system/roles/${id}`) as Promise<IStandardResponse>
    },
  },


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
  dictItem: {
    list(query: IDictItemModelQuery) {
      return endHttp.get('system/dict-item', query) as Promise<IPageResponse<IDictItemModel>>
    },
    create(query: IDictItemModel) {
      return endHttp.post('system/dict-item', query)
    },
    get(id: number | string) {
      return endHttp.get(`system/dict-item/${id}`) as Promise<IDataResponse<IDictItemModel>>
    },
    update(id: number | string, query: IDictItemModel) {
      return endHttp.post(`system/dict-item/${id}`, query) as Promise<IDataResponse<IDictItemModel>>
    },
    delete(id: number | string) {
      return endHttp.del(`system/dict-item/${id}`) as Promise<IStandardResponse>
    },
  },

  // paramConfig: {
  //   list(query: IDictItemModelQuery) {
  //     return endHttp.get('system/dict-item', query) as Promise<IPageResponse<IDictItemModel>>
  //   },
  //   create(query: IDictItemModel) {
  //     return endHttp.post('system/dict-item', query)
  //   },
  //   get(id: number | string) {
  //     return endHttp.get(`system/dict-item/${id}`) as Promise<IDataResponse<IDictItemModel>>
  //   },
  //   update(id: number | string, query: IDictItemModel) {
  //     return endHttp.post(`system/dict-item/${id}`, query) as Promise<IDataResponse<IDictItemModel>>
  //   },
  //   delete(id: number | string) {
  //     return endHttp.del(`system/dict-item/${id}`) as Promise<IStandardResponse>
  //   },
  // },
}
