import type { extend } from 'dayjs'

export enum BannerMode {
  WHITELIST,
  BLACKLIST,
}

// 时间搓，所以字符串
export interface IBannerGroup extends Record<string, any> {
  id?: number
  name: string
  startAt: number
  endAt: number
  posters: []
  property: string
  user_subscribe: SubscribeType
  user_mode: BannerMode
}

export interface IBannerModelQuery extends IBannerGroup {
  page?: number
  pageSize?: number
}
