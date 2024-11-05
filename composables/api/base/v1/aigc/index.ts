import type { IPageResponse } from '../../index.type'
import type { IHistoryUploadQuery } from './completion-types'
import type { HistoryQuery } from './history/index.type'
import { endHttp } from '~/composables/api/axios'

export default {
  uploadHistory(history: IHistoryUploadQuery) {
    return endHttp.post('aigc/conversations', history)
  },
  getConversations(query: Partial<HistoryQuery>): Promise<IPageResponse<any>> {
    return endHttp.get('aigc/conversations', query)
  },
  deleteConversation(id: string) {
    return endHttp.del(`aigc/conversations/${id}`)
  },
  getPrompt(page: number) {
    return endHttp.get('aigc/prompts/search', {
      page,
      pageSize: 25,
      keyword: '',
    }) as Promise<IPageResponse<any>>
  },
  getPromptDetail(id: number) {
    return endHttp.get(`aigc/prompts/detail/${id}`)
  },
  createShareMessage(chat_id: string) {
    return endHttp.post(`aigc/conversation/share/${chat_id}`)
  },
  getShareMessage(uuid: string) {
    return endHttp.get(`aigc/conversation/share/${uuid}`)
  },
  getChatShareMessage(chat_id: string) {
    return endHttp.get(`aigc/conversation/share_chat/${chat_id}`)
  },
  getUserShareList(page: number, pageSize: number) {
    return endHttp.get('aigc/conversation/share_list', {
      page,
      pageSize,
    })
  },
}
