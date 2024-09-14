import type { IStandardResponse } from '../index.type'

export interface IUploadResponse extends IStandardResponse {
  data: {
    filename: string
  }
}

export interface FeedbackQuery {
  allRate: number
  feedType: string
  feedDesc: string
  feedSuggestion: string
}
