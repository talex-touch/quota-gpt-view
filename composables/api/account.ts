import { endHttp } from './axios'

export function getAccountDetail() {
  return endHttp.get('account/profile')
}

export function getPermissionList() {
  return endHttp.get('account/permissions')
}

export function getAccountMenuList() {
  return endHttp.get('account/menus')
}

export function getDepartmentList() {
  return endHttp.get('system/depts')
}

export interface UserGetQuery {
  page: number
  pageSize: number
  username: string
  deptId: number
  nickname: string
  email: string
  phone: string
  qq: string
  remark: string
  status: number
}

export function getUsers(data?: Partial<UserGetQuery>) {
  return endHttp.get('system/users', data)
}

export interface RoleEditQuery {
  /**
   * 序号
   */
  id?: number

  /**
   * 角色名称
   */
  name: string
  /**
   * 角色值
   */
  value: string
  /**
   * 状态
   */
  status: number
  /**
   * 备注
   */
  remark: string
  /**
   * 菜单id
   */
  menuIds: number[]
  /**
   * 创建时间
   */
  createdAt: string
  /**
   * 更新
   */
  updater: string
}

export interface RoleGetQuery {
  page: number
  pageSize: number
  name: string
  value: string
  remark: string
  status: number
}

export function getRoleList(query?: Partial<UserGetQuery>) {
  return endHttp.get('system/roles', query)
}

// 新增角色
export function addRole(data: RoleEditQuery) {
  return endHttp.get('system/roles', data)
}
// 获取角色信息

export function getRoleInfo(id: number) {
  return endHttp.get(`system/roles/${id}`)
}
// 更新角色
export function updateRole(id: number, body: any) {
  return endHttp.put(`system/roles/${id}`, body)
}
// 删除角色
export function deleteRole(id: number) {
  return endHttp.del(`system/roles/${id}`)
}

export interface UserQuery {
  id: string
  username: string
  nickname: string
  avatar: string
  qq: string
  email: string
  phone: string
  remark: string
  status: number
  roleIds: number[]
  dept: any
  password: string
}

export function addUser(query: UserQuery) {
  return endHttp.post('system/users', query)

  // axios({
  //   method: "POST",
  //   data: query
  // })
}

export function updateUser(id: string, query: UserQuery) {
  return endHttp.put(`system/users/${id}`, query)
}

export function deleteUser(id: string) {
  return endHttp.del(`system/users/${id}`)
}

export interface MenuGetQuery {
  /**
   * 菜单路由路径或外链
   */
  component?: string
  /**
   * 外链打开方式
   */
  extOpenMode?: number
  /**
   * 是否外链
   */
  isExt?: boolean
  /**
   * 是否开启页面缓存
   */
  keepAlive?: number
  /**
   * 菜单或权限名称
   */
  name?: string
  /**
   * 前端路由地址
   */
  path?: string
  /**
   * 状态
   */
  status?: number
  /**
   * 菜单类型
   */
  type?: number
}

export function getMenuList(query: MenuGetQuery) {
  return endHttp.get('system/menus', {
    query,
  })
}

export function updateMenu(id: number, query: MenuGetQuery) {
  return endHttp.put(`system/menus/${id}`, query)
}

export function addMenu(query: MenuGetQuery) {
  return endHttp.post('system/menus', query)
}

export function delMenu(id: number) {
  return endHttp.del(`system/menus/${id}`)
}

export function getHistoryList() {
  return endHttp.get('account/login_histories')
}

export function addDept(body: any) {
  return endHttp.post('system/depts', body)
}

export function getParamList(Query: any) {
  return endHttp.get('system/param-config', Query)
}

export function addParam(Header: any) {
  return endHttp.post('system/param-config', Header)
}

export function inquireParamInformation(Path: any) {
  return endHttp.get('system/param-config/{id}', Path)
}

export function updateParam(Path: any) {
  return endHttp.post('system/param-config/{id}', Path)
}

export function delParam(Path: any) {
  return endHttp.post('system/param-config/{id}', Path)
}

export function getDictList(Query: any) {
  return endHttp.get('system/dict-type', Query)
}

export function addDict(Header: any) {
  return endHttp.post('system/dict-type', Header)
}

export function getAllDictList(Header: any) {
  return endHttp.get('system/dict-type/select-options', Header)
}

export function inquireDictInformation(Path: any) {
  return endHttp.get('system/dict-type/{id}', Path)
}

export function updateDict(Header: any) {
  return endHttp.post('system/dict-type/{id}', Header)
}

export function delDict(Path: any) {
  return endHttp.post('system/param-config/{id}', Path)
}

export function getOrderPlanPrice(type: 'STANDARD' | 'ULTIMATE', time: string) {
  return endHttp.get(`order/price?_time=${Date.now()}`, {
    type,
    time,
    payMethod: 2,
  })
}

export function orderPlanPrice(type: 'STANDARD' | 'ULTIMATE', time: string, couponCode: string) {
  return endHttp.post('order/subscribe', {
    type,
    time,
    payMethod: 2,
    couponCode,
  })
}

export function getUserNearestUnPayOrder() {
  return endHttp.get(`order/target?now=${Date.now()}`)
}

export function getOrderStatus(id: string) {
  return endHttp.get(`order/status/target?time=${Date.now()}`, { id })
}

export function getUserSubscription() {
  return endHttp.get('order/subscribe')
}

export function getCouponList() {
  return endHttp.get('coupon/list')
}

export function userBindCoupon(code: string) {
  return endHttp.post('coupon/add', {
    couponId: code,
  })
}

export interface CreateCouponDto extends Record<string, string | number | boolean | undefined> {
  prefix?: string // 优惠码前缀（必须是6位）
  quantity: number // 优惠码数量，一次性最多不超过1000个
  discountAmount: number // 优惠金额（正数表示优惠金额[单位：分]，负数表示优惠百分比）
  startDate?: string // 有效期开始时间（没有表示通用）
  endDate?: string // 有效期结束时间（没有表示通用）
  maxUsage: number // 最大使用次数
  minimumSpend: number // 最小消费金额（单位：分）
  maximumDiscount?: number // 最大抵扣消费（正数表示消费金额[单位：分]，负数表示消费百分比）
  stackable?: boolean // 是否可叠加使用，默认为false
  newUserOnly?: boolean // 是否仅限新用户使用，默认为false

  code?: string
  user_id?: number
  updater_id?: number
  creator_id?: number
}

export interface CouponListQueryDto extends Partial<CreateCouponDto> {
  page: number
  pageSize: number
}

export function getAllCoupon(query: CouponListQueryDto) {
  return endHttp.post('coupon/all', query)
}

export interface ICouponCode {
  applicableCategories?: null
  code?: string
  createdAt?: string
  creator?: any
  discountAmount?: number
  endDate?: null
  id?: number
  info?: null
  mainCode?: string
  maximumDiscount?: null
  maxUsage?: number
  minimumSpend?: number
  newUserOnly?: boolean
  stackable?: boolean
  startDate?: null
  updatedAt?: string
  usedCount?: number
}

export function createBatchesCodeList(dto: CreateCouponDto) {
  return endHttp.post('coupon/create_batches', dto)
}

export function assignCouponCode(code: string, userId: number) {
  return endHttp.post('coupon/assign', { couponId: code, uid: userId })
}

export function invalidateCouponCode(couponId: string) {
  return endHttp.post('coupon/invalidate', { couponId })
}

export interface IAdminOrderQuery extends Record<string, any> {
  /**
   * 支付时间范围(max)
   */
  maxPayTime?: Date
  /**
   * 购买金额范围(max)
   */
  maxPrice?: number
  /**
   * 支付时间范围(min)
   */
  minPayTime?: Date
  /**
   * 购买金额范围(min)
   */
  minPrice?: number
  page: number
  pageSize: number
  payMethod?: number
  status?: number
  /**
   * 购买用户
   */
  userid?: number
}

export function getAdminOrders(query: IAdminOrderQuery) {
  return endHttp.post('order/admin/list', query)
}

export function getAdminOrderStatistics() {
  return endHttp.get('order/admin/statistics')
}