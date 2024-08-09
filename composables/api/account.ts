import { endHttp } from './axios'


//---------------------用户管理

//获取用户列表
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

/**
 * 获取用户列表
 * @param data 
 * @returns 
 */
export function getUsers(data?: Partial<UserGetQuery>) {
  return endHttp.get('system/users', data)
}
/**
 * 新增用户
 * @param query 
 * @returns 
 */
export function addUser(query: UserQuery) {
  return endHttp.post('system/users', query)

  // axios({
  //   method: "POST",
  //   data: query
  // })
}



/**
 * 更新用户
 * @param id 
 * @param query 
 * @returns 
 */
export function updateUser(id: string, query: UserQuery) {
  return endHttp.put(`system/users/${id}`, query)
}

/**
 * 删除用户
 * @param id 
 * @returns 
 */
export function deleteUser(id: string) {
  return endHttp.del(`system/users/${id}`)
}


//--------------------角色管理


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
  menuIds: number[] |undefined
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

  id?:  number
  page?: number
  pageSize?: number
  name: string
  value: string
  remark: string
  status: number,
  menuIds?:number[] | undefined
  createdAt?: string,
  updater?: string
}


/**
 * 获取角色列表
 * @param query 
 * @returns 
 */
export function getRoleList(query?: Partial<UserGetQuery>) {
  return endHttp.get('system/roles', query)
}

/**
 * 新增角色
 * @param data 
 * @returns 
 */
export function addRole(data: RoleEditQuery) {
  return endHttp.get('system/roles', data)
}


/**
 * 获取角色信息
 * @param id 
 * @returns 
 */ 
export function getRoleInfo(id: number) {
  return endHttp.get(`system/roles/${id}`)
}
/**
 * 更新角色
 * @param id 
 * @param body 
 * @returns 
 */ 
export function updateRole(id: number, body: any) {
  return endHttp.put(`system/roles/${id}`, body)
}
/**
 * 删除角色
 * @param id 
 * @returns 
 */ 
export function deleteRole(id: number) {
  return endHttp.del(`system/roles/${id}`)
}


//----------------------菜单管理

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

/**
 * 获取所有菜单列表
 * @param query 
 * @returns 
 */
export function getMenuList(query: MenuGetQuery) {
  return endHttp.get('system/menus', {
    query,
  })
}
/**
 * 更新菜单或权限
 * @param id 
 * @param query 
 * @returns 
 */
export function updateMenu(id: number, query: MenuGetQuery) {
  return endHttp.put(`system/menus/${id}`, query)
}
/**
 * 新增菜单或权限
 * @param query 
 * @returns 
 */
export function addMenu(query: MenuGetQuery) {
  return endHttp.post('system/menus', query)
}
/**
 * 删除菜单或权限
 * @param id 
 * @returns 
 */
export function delMenu(id: number) {
  return endHttp.del(`system/menus/${id}`)
}

//-------------------------部门

/**
 * 获取部门列表
 * @returns 
 */
export function getDepartmentList() {
  return endHttp.get('system/depts')
}


/**
 * 新增部门
 * @param body 
 * @returns 
 */
export function addDept(body: any) {
  return endHttp.post('system/depts', body)
}
/**
 * 删除部门
 * @param id 
 * @returns 
 */
export function delDept(id:number) {
  return endHttp.del('/system/depts/'+id)
}

/**
 * 更新部门
 * @param id 
 * @returns 
 */
export function UpdateDept(id:number) {
  return endHttp.put('/system/depts/'+id)
}

// ---------------------------------------字典管理

/**
 * 获取字典列表
 * @param Query 
 * @returns 
 */
export function getDictList(Query: any) {
  return endHttp.get('system/dict-type', Query)
}


/**
 * DictTypeDto 新增字典
 */
export interface DictRequest {
  /**
   * 字典类型code
   */
  code?: string;
  createdAt?: Date;
  /**
   * 创建者
   */
  creator?: string;
  id?: number;
  /**
   * 字典类型名称
   */
  name?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 状态
   */
  status?: number;
  updatedAt?: Date;
  /**
   * 更新者
   */
  updater?: string;
  [property: string]: any;
}
/**
 * 新增字典
 * @param Header 
 * @returns 
 */
export function addDict(Body: DictRequest) {
  return endHttp.post('system/dict-type', Body)
}
/**
 * 获取一次性所有字典列表
 * @param Header 
 * @returns 
 */
export function getAllDictList() {
  return endHttp.get('system/dict-type/select-options')
}
/**
 * 查询字典类型信息
 * @param Path 
 * @returns 
 */
export function queryDictInfo(Path: any) {
  return endHttp.get('system/dict-type/'+ Path)
}
/**
 * 更新字典
 * @param Path  id
 * @param Body  
 * @returns 
 */
export function updateDict(Path:number,Body: any) {
  return endHttp.post(`system/dict-type/${Path}`, Body)
}
/**
 * 删除字典
 * @param Path  --id
 * @returns 
 */
export function delDict(Path: any) {
  return endHttp.post(`system/dict-type/${Path}`)
}


//------------------------------任务调度

export function getScheduleList(Query : any) {
  return endHttp.get('system/tasks',Query)
}

export function addSchedule(Header : any) {
  return endHttp.post('system/tasks',Header)
}

export function updateSchedule(Path : any) {
  return endHttp.put('system/tasks/{id}',Path)
}

export function inquireScheduleInfprmation(Path : any) {
  return endHttp.get('system/tasks/{id}',Path)
}

export function delSchedule(Path : any) {
  return endHttp.del('system/tasks/{id}',Path)
}

export function runScheduleOnce(Path : any) {
  return endHttp.put('system/tasks/{id}/once',Path)
}

export function stopSchedule(Path : any) {
  return endHttp.put('system/tasks/{id}/stop',Path)
}

export function startSchedule(Path : any) {
  return endHttp.put('system/tasks/{id}/stop',Path)
}





export function getAccountDetail() {
  return endHttp.get('account/profile')
}

export function getPermissionList() {
  return endHttp.get('account/permissions')
}

export function getAccountMenuList() {
  return endHttp.get('account/menus')
}












export function getHistoryList() {
  return endHttp.get('account/login_histories')
}

// 获取参数列表
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

// 订单
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


