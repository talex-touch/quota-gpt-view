import type { extend } from 'dayjs'

/**
 * 分组黑名单或白名单
 */
export enum UserModel {
  Mini = 'mini',
  The4O = '4o',
  The5O = '5o',
}

/**
 * 用户订阅分组
 */
export enum UserSubscribe {
  Standard = 'STANDARD',
  Ultimate = 'ULTIMATE',
}

export enum Order {
  Asc = 'ASC',
  Desc = 'DESC',
}

export interface ICreateBannerGroupDto {
  /**
   * 名称
   */
  name: string

  /**
   * 开始时间
   */
  startAt: Date
  /**
   * 结束时间
   */
  endAt: Date
  /**
   * 用户订阅分组
   */
  userSubscribe?: UserSubscribe
  /**
   * 分组黑名单或白名单
   */
  userModel: UserModel

  /**
   * 其他属性
   */
  property?: string
}

export interface IUpdateBannerGroupDto extends CreateBannerGroupDto {
  /**
   * 横幅图片
   */
  posters: string[]
}

export interface IBannerGroupQuery extends CreateBannerGroupDto {
  page?: number
  pageSize?: number

  order?: Order
}


