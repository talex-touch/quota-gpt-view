import type { SubscribeType } from '../index.type'

export enum BannerMode {
  WHITELIST,
  BLACKLIST,
}

export interface IBannerGroup extends Record<string, any> {
  id?: number

  name: string

  startAt?: Date

  endAt?: Date

  user_subscribe?: SubscribeType

  user_model?: BannerMode

  property?: string

  posters?: any[]
}

export interface IBannerGroupQuery extends IBannerGroup {
  page?: number
  pageSize?: number
}
