import { endHttp } from './axios'

export interface IDocGetQuery {
  id?: number
  page?: number
  pageSize?: number
  title?: string
  status?: number
}

export function getDocList(_query: IDocGetQuery) {
  const query = _query

  if (query.title)
    query.title = encodeURIComponent(query.title)

  return endHttp.get('/doc', { query })
}

export interface IDocDataQuery extends IDocGetQuery {
  value?: string
  meta?: string
  permission?: string
}

export function addDoc(data: IDocDataQuery) {
  return endHttp.post('/doc', data)
}

export function updateDoc(id: number, data: IDocDataQuery) {
  return endHttp.put(`/doc/${id}`, data)
}
