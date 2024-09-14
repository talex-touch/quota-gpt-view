import { endHttp } from '../../axios'
import type { FeedbackQuery, IUploadResponse } from './common.type'

export default {
  upload(file: File): Promise<IUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return this.uploadCustom(formData)
  },
  uploadCustom(formData: FormData): Promise<IUploadResponse> {
    return endHttp.post('tools/upload', formData)
  },

  Feedback:{
    create(data:FeedbackQuery){
      return endHttp.post('feedback',data)
    },

    list(){
      
    }

  }

}
