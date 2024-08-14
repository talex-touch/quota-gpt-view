export interface IUserModel extends Record<string, any> {

     /**
     * 头像
     */
     avatar?: string;
     /**
      * 归属大区
      */
     deptId?: number;
     /**
      * 邮箱
      */
     email?: string;
   
     /**
      * 呢称
      */
     nickname?: string;
  
 
     /**
      * 登录密码
      */
     password?: string;
     /**
      * 手机号
      */
     phone?: string;
     /**
      * QQ
      */
     qq?: string;
     /**
      * 备注
      */
     remark?: string;
     /**
      * 归属角色
      */
     roleIds?: string[];
     /**
      * 状态
      */
     status?: number;
     /**
      * 登录账号
      */
     username?: string;




  id?: number
  updatedAt?: string
  createdAt?: string
}
export interface IUserModelQuery extends IUserModel {
  page: number
  pageSize: number
}





export interface IRoleModel extends Record<string, any> {
  /**
   * 关联菜单、权限编号
   */
  menuIds: string[]
  /**
   * 角色名称
   */
  name: string
  order: string
  /**
   * 角色备注
   */
  remark: string
  /**
   * 状态
   */
  status: number
  /**
   * 角色值
   */
  value: string

  id?: number
  updatedAt?: string
  createdAt?: string
}

export interface IRoleModelQuery extends IRoleModel {
  page: number
  pageSize: number
}


export interface IMenuModel extends Record<string, any> {
      /**
     * 设置当前路由高亮的菜单项，一般用于详情页
     */
      activeMenu?: string;
      /**
       * 菜单路由路径或外链
       */
      component?: string;
      /**
       * 外链打开方式
       */
      extOpenMode?: number;
      /**
       * 菜单图标
       */
      icon?: string;
      /**
       * 是否外链
       */
      isExt?: boolean;
      /**
       * 是否开启页面缓存
       */
      keepAlive?: number;
      /**
       * 菜单或权限名称
       */
      name?: string;
      /**
       * 排序
       */
      orderNo?: number;
      /**
       * 父级菜单
       */
      parentId?: number;
      /**
       * 前端路由地址
       */
      path?: string;
      /**
       * 对应权限
       */
      permission?: string;
      /**
       * 菜单是否显示
       */
      show?: number;
      /**
       * 状态
       */
      status?: number;
      /**
       * 菜单类型
       */
      type?: number;

}
//这里这个菜单疑惑有没有page,pagesize
export interface IMenuModelQuery extends IMenuModel {
  page: number
  pageSize: number
}






export interface IDictItemModel extends Record<string, any> {
  /**
   * 字典项键名
   */
  label?: string
  order?: string
  /**
   * 字典类型 ID
   */
  typeId: number
  /**
   * 字典项值
   */
  value?: string

  id?: number
  updatedAt?: string
  createdAt?: string
}

export interface IDictItemModelQuery extends IDictItemModel {
  page: number
  pageSize: number
}
