import type { IHistoryUploadQuery } from './chat.type'
import { endHttp } from '~/composables/api/axios'

export default {
  uploadHistory(history: IHistoryUploadQuery) {
    return endHttp.post('aigc/conversations', history)
  },
}
