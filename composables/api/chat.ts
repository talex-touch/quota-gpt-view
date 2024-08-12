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

export function getPromptTemplate(keyword: string) {
  return endHttp.get('aigc/prompts/search', { keyword })
}

export function getTargetPrompt(id: number) {
  return endHttp.get(`aigc/prompts/${id}`)
}

export function getPromptDailyStatistics() {
  return endHttp.get('aigc/prompts/statistics')
}