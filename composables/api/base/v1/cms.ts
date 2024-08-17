import { endHttp } from '../../axios'
import type { IDataResponse, IPageResponse, IStandardPageModel, IStandardResponse } from '../index.type'
import type { IDictItemModel, IDictItemModelQuery, IDictTypeModel, IDictTypeModelQuery, IDoc, IDocQuery, IParamConfigModel, IParamConfigModelQuery, IRoleModel, IRoleModelQuery, ITasksModel, ITasksModelQuery, IUserModel, IUserModelQuery, ServeStatInfo } from './cms.type'

export default {
  doc: {
    list(query: IDocQuery) {
      return endHttp.post('doc/list', query) as Promise<IPageResponse<IDoc>>
    },
    create(body: IDoc) {
      return endHttp.post('doc', body) as Promise<IDataResponse<IDoc>>
    },
    tempSave(id: number, body: IDoc) {
      return endHttp.post(`doc/temp_save?id=${id}`, body) as Promise<IDataResponse<IDoc>>
    },
    update(id: number, body: IDoc) {
      return endHttp.put(`doc/${id}`, body) as Promise<IDataResponse<IDoc>>
    },
  },

  users: {
    list(query: IUserModelQuery) {
      return endHttp.get('system/users', query) as Promise<IPageResponse<IUserModel>>
    },
    create(Body: IUserModel) {
      return endHttp.post('system/users', Body)
    },
    get(id: number | string) {
      return endHttp.get(`system/users/${id}`) as Promise<IDataResponse<IUserModel>>
    },
    update(id: number | string, Body: IUserModel) {
      return endHttp.put(`system/users/${id}`, Body) as Promise<IDataResponse<IUserModel>>
    },
    delete(id: number | string) {
      return endHttp.del(`system/users/${id}`) as Promise<IStandardResponse>
    },
  },

  role: {
    list(query: IRoleModelQuery) {
      return endHttp.get('system/roles', query) as Promise<IPageResponse<IRoleModel>>
    },
    create(Body: IRoleModel) {
      return endHttp.post('system/roles', Body)
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

  dictType: {
    list(query: IDictTypeModelQuery) {
      return endHttp.get('system/dict-type', query) as Promise<IPageResponse<IDictTypeModel>>
    },
    create(Body: IDictTypeModel) {
      return endHttp.post('system/dict-type', Body)
    },
    get(id: number | string) {
      return endHttp.get(`system/dict-type/${id}`) as Promise<IDataResponse<IDictTypeModel>>
    },
    update(id: number | string, query: IDictTypeModel) {
      return endHttp.put(`system/dict-type/${id}`, query) as Promise<IDataResponse<IDictTypeModel>>
    },
    delete(id: number | string) {
      return endHttp.del(`system/dict-type/${id}`) as Promise<IStandardResponse>
    },
  },

  Tasks: {
    list(query: ITasksModelQuery) {
      return endHttp.get('system/tasks', query) as Promise<IPageResponse<ITasksModel>>
    },
    create(Body: ITasksModel) {
      return endHttp.post('system/tasks', Body)
    },
    get(id: number | string) {
      return endHttp.get(`system/tasks/${id}`) as Promise<IDataResponse<ITasksModel>>
    },
    update(id: number | string, query: ITasksModel) {
      return endHttp.put(`system/tasks/${id}`, query) as Promise<IDataResponse<ITasksModel>>
    },
    delete(id: number | string) {
      return endHttp.del(`system/tasks/${id}`) as Promise<IStandardResponse>
    },
  },

  paramConfig: {
    list(query: IParamConfigModelQuery) {
      return endHttp.get('system/param-config', query) as Promise<IPageResponse<IParamConfigModel>>
    },
    create(Body: IParamConfigModel) {
      return endHttp.post('system/param-config', Body)
    },
    get(id: number | string) {
      return endHttp.get(`system/param-config/${id}`) as Promise<IDataResponse<IParamConfigModel>>
    },
    update(id: number | string, Body: IParamConfigModel) {
      return endHttp.post(`system/param-config/${id}`, Body) as Promise<IDataResponse<IParamConfigModel>>
    },
    delete(id: number | string) {
      return endHttp.del(`system/param-config/${id}`) as Promise<IStandardResponse>
    },
  },

  dictItem: {
    list(query: IDictItemModelQuery) {
      return endHttp.get('system/dict-item', query) as Promise<IPageResponse<IDictItemModel>>
    },
    create(Body: IDictItemModel) {
      return endHttp.post('system/dict-item', Body)
    },
    get(id: number | string) {
      return endHttp.get(`system/dict-item/${id}`) as Promise<IDataResponse<IDictItemModel>>
    },
    update(id: number | string, Body: IDictItemModel) {
      return endHttp.post(`system/dict-item/${id}`, Body) as Promise<IDataResponse<IDictItemModel>>
    },
    delete(id: number | string) {
      return endHttp.del(`system/dict-item/${id}`) as Promise<IStandardResponse>
    },
  },

  systemServer: {
    list() {
      return endHttp.get('system/serve/stat') as Promise<IPageResponse<ServeStatInfo>>
    },

  },
}
