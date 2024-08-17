export interface IUserModel extends Record<string, any> {

  /**
   * 头像
   */
  avatar?: string
  /**
   * 归属大区
   */
  deptId?: number
  /**
   * 邮箱
   */
  email?: string

  /**
   * 呢称
   */
  nickname?: string

  /**
   * 登录密码
   */
  password?: string
  /**
   * 手机号
   */
  phone?: string
  /**
   * QQ
   */
  qq?: string
  /**
   * 备注
   */
  remark?: string
  /**
   * 归属角色
   */
  roleIds?: string[]
  /**
   * 状态
   */
  status?: number
  /**
   * 登录账号
   */
  username?: string

  id?: number
  updatedAt?: string
  createdAt?: string
}
export interface IUserModelQuery extends IUserModel {
  page?: number
  pageSize?: number
}

export interface IRoleModel extends Record<string, any> {
  /**
   * 关联菜单、权限编号
   */
  menuIds?: string[]
  /**
   * 角色名称
   */
  name?: string
  order?: string
  /**
   * 角色备注
   */
  remark?: string
  /**
   * 状态
   */
  status?: number
  /**
   * 角色值
   */
  value?: string

  id?: number
  updatedAt?: string
  createdAt?: string
}

export interface IRoleModelQuery extends IRoleModel {
  page?: number
  pageSize?: number
}

export interface IMenuModel extends Record<string, any> {
  /**
   * 设置当前路由高亮的菜单项，一般用于详情页
   */
  activeMenu?: string
  /**
   * 菜单路由路径或外链
   */
  component?: string
  /**
   * 外链打开方式
   */
  extOpenMode?: number
  /**
   * 菜单图标
   */
  icon?: string
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
   * 排序
   */
  orderNo?: number
  /**
   * 父级菜单
   */
  parentId?: number
  /**
   * 前端路由地址
   */
  path?: string
  /**
   * 对应权限
   */
  permission?: string
  /**
   * 菜单是否显示
   */
  show?: number
  /**
   * 状态
   */
  status?: number
  /**
   * 菜单类型
   */
  type?: number

}
// 这里这个菜单疑惑有没有page,pagesize
export interface IMenuModelQuery extends IMenuModel {
  page: number
  pageSize: number
}

export interface IParamConfigModel extends Record<string, any> {

  /**
   * 参数名称
   */
  name: string
  order?: string
  page?: number
  updatedAt?: string
  createdAt?: string
}

export interface IParamConfigModelQuery extends IParamConfigModel {
  page: number
  pageSize: number
}

export interface IDictTypeModel extends Record<string, any> {

  /**
   * 字典编码
   */
  code: string

  /**
   * 创建者
   */
  creator: string

  /**
   * 字典名称
   */
  name: string
  /**
   * 备注
   */
  remark: string
  /**
   * 状态
   */
  status: number

  /**
   * 更新者
   */
  updater: string

  id?: number
  updatedAt?: string
  createdAt?: string
}

export interface IDictTypeModelQuery extends IDictTypeModel {
  page: number
  pageSize: number
}

export interface IDictItemModel extends Record<string, any> {

  /**
   * 字典编码
   */
  code: string

  /**
   * 字典名称
   */
  name: string
  /**
   * 备注
   */
  remark: string
  /**
   * 状态
   */
  status: number
  /**
   * 创建者
   */
  creator: string

  /**
   * 更新者
   */
  updater: string

  id: number
  updatedAt: string
  createdAt: string
}

export interface IDictItemModelQuery extends IDictItemModel {
  page: number
  pageSize: number
  /**
   * 字典类型 ID
   */
  typeId: number
  /**
   * 字典项值
   */
  value?: string
  /**
   * 字典项键名
   */
  label?: string
}

export interface ITasksModel extends Record<string, any> {

  /**
   * cron表达式
   */
  cron?: string
  /**
   * 执行参数
   */
  data?: string
  /**
   * 结束时间
   */
  endTime?: string
  /**
   * 执行间隔，毫秒单位
   */
  every?: number

  /**
   * 限制执行次数，负数则无限制
   */
  limit?: number
  /**
   * 任务名称
   */
  name?: string

  /**
   * 任务备注
   */
  remark?: string
  /**
   * 调用的服务
   */
  service?: string
  /**
   * 开始时间
   */
  startTime?: string
  /**
   * 任务状态
   */
  status?: number
  /**
   * 任务类别：cron | interval
   */
  type?: number

  id: number
  updatedAt: string
  createdAt: string
}

export interface ITasksModelQuery extends ITasksModel {
  page: number
  pageSize: number

}

// 系统监控
/**
 * ServeStatInfo
 */
export interface ServeStatInfo {
  /**
   * CPU信息
   */
  cpu: Cpu
  /**
   * 磁盘信息
   */
  disk: Disk
  /**
   * 内存信息
   */
  memory: Memory
  /**
   * 运行环境
   */
  runtime: Runtime
}

/**
 * CPU信息
 *
 * Cpu
 */
export interface Cpu {
  /**
   * 品牌
   */
  brand: string
  /**
   * cpu资源消耗
   */
  coresLoad: CoreLoad[]
  /**
   * 制造商
   */
  manufacturer: string
  /**
   * 型号
   */
  model: string
  /**
   * 物理核心数
   */
  physicalCores: number
  /**
   * CPU资源消耗 原始滴答
   */
  rawCurrentLoad: number
  /**
   * 空闲CPU资源 原始滴答
   */
  rawCurrentLoadIdle: number
  /**
   * 速度 in GHz
   */
  speed: number
}

/**
 * CoreLoad
 */
export interface CoreLoad {
  /**
   * 当前CPU资源消耗
   */
  rawLoad: number
  /**
   * 当前空闲CPU资源
   */
  rawLoadIdle: number
}

/**
 * 磁盘信息
 *
 * Disk
 */
export interface Disk {
  /**
   * 可用磁盘空间 (bytes)
   */
  available: number
  /**
   * 磁盘空间大小 (bytes)
   */
  size: number
  /**
   * 已使用磁盘空间 (bytes)
   */
  used: number
}

/**
 * 内存信息
 *
 * Memory
 */
export interface Memory {
  /**
   * 可用内存
   */
  available: number
  /**
   * total memory in bytes
   */
  total: number
}

/**
 * 运行环境
 *
 * Runtime
 */
export interface Runtime {
  /**
   * 服务器架构
   */
  arch: string
  /**
   * Node版本
   */
  nodeVersion: string
  /**
   * Npm版本
   */
  npmVersion: string
  /**
   * 系统
   */
  os: string
}

export interface IDoc extends Record<string, any> {
  /**
   * 文档内容
   */
  content: string
  field: string
  /**
   * 文档元数据
   */
  meta: string
  order: 'ASC' | 'DESC'
  /**
   * 文档权限
   */
  permission: string
  /**
   * 文档标题
   */
  title: string

  id?: number
  updatedAt?: string
  createdAt?: string
}

export interface IDocQuery extends IDoc {
  page?: number
  pageSize?: number
}
