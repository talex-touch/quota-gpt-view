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

export interface PromptTagDto extends Record<string, any> {
  id?: number
  /**
   * 标签颜色
   */
  color: null | string
  createdAt: Date
  /**
   * 标签描述
   */
  description: string
  /**
   * 标签图标
   */
  icon: null | string
  /**
   * 标签名称
   */
  name: string
  /**
   * 父级标签 ID
   */
  parentTagId: number | null
  /**
   * 关联的提示词
   */
  prompts: any[]
  /**
   * 标签状态
   */
  status: number | null
  updatedAt: Date
  /**
   * 标签权重
   */
  weight: number | null
}

export function createPromptTag(dto: PromptTagDto) {
  return endHttp.post('aigc/prompts/tags/create', dto)
}

export function updatePromptTag(id: number, dto: PromptTagDto) {
  return endHttp.put(`aigc/prompts/tags/${id}`, dto)
}

export interface PromptTagQueryDto extends Partial<PromptTagDto> {
  page: number
  pageSize: number
}

export function getPromptTagList(dto: Partial<PromptTagQueryDto>) {
  return endHttp.post('aigc/prompts/tags/list', dto)
}
