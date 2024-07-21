import { endHttp } from './axios'

export interface HistoryPostQuery {
  topic: string
  value: string // messages
  meta: string
  uid: string
}

export function postHistory(history: HistoryPostQuery) {
  return endHttp.post('aigc/conversations', history)
}

export interface HistoryQuery {
  page: number
  pageSize: number
  topic: string
}

export function getConversations(query: Partial<HistoryQuery>) {
  return endHttp.get('aigc/conversations', query)
}
