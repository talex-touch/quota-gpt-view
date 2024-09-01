import { endHttp } from '../../axios'
import type { IHistoryUploadQuery } from './chat.type'

export default {
  uploadHistory(history: IHistoryUploadQuery) {
    return endHttp.post('aigc/conversations', history)
  },
}
