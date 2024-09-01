export enum QuotaModel {
  // 普通版本，纯问答（类豆包，普通联网）
  QUOTA_THIS_NORMAL = 'this-normal',
  // 中级模型，中级会员可用 （上下文更强，普通联网）
  QUOTA_THIS_NORMAL_TURBO = 'this-normal-turbo',
  // 高级模型，高级会员可用 （全功能，上下文更强，类GPT，高级联网+工具）
  QUOTA_THIS_NORMAL_ULTRA = 'this-normal-ultra',
}

export enum IChatItemStatus {
  /**
   * 正常状态，补全完成后即这个状态
   */
  AVAILABLE,

  /**
   * 已提交至后端，后端还未有任何响应
   */
  WAITING,

  /**
   * 正在补全中，会持续更新，直到补全完成
   */
  GENERATING,

  /**
   * 被用户手动取消
   */
  CANCELLED,

  /**
   * 被服务器拒绝，由于服务器问题被拒绝，比如服务器资源不足
   */
  REJECTED,

  /**
   * 对话超过3分钟，超时
   */
  TIMEOUT,

  /**
   * 对话由于触发服务器风控，被禁止
   */
  BANNED,

  /**
   * 对话进入工具调用状态
   */
  TOOL_CALLING,

  /**
   * 工具调用报错
   */
  TOOL_ERROR,

  /**
   * 未知错误
   */
  ERROR,
}

export enum IChatRole {
  /**
   * 系统内置（即系统提示）
   */
  SYSTEM = 'system',
  ASSISTANT = 'assistant',
  USER = 'user',
}

export interface IChatInnerItemMeta {
  temperature: number

  // TODO: context memory
}

export interface IChatInnerItem {
  role: IChatRole
  model: QuotaModel
  status: IChatItemStatus

  value: string
  meta: IChatInnerItemMeta
}

export interface IChatItem {
  id: string
  timestamp: number
  content: IChatInnerItem[]
}

export enum IConversationSynchronizeStatus {
  SYNCING = 'syncing',
}

export interface IChatConversation {
  /**
   * 对话ID，唯一标识，用于各处确定对话
   */
  id: string
  /**
   * 对话标题（也算是聊天主题）
   */
  topic: string

  messages: ChatItem[]

  lastUpdate: number
  // lastSummarizeIndex: number

  templateId: number
}

export interface IHistoryUploadQuery {
  /**
   * 如果上传的对话不存在会自动创建，若已存在，会自动更新
   */
  chat_id: string

  /**
   * 对话的主题（标题）
   */
  topic: string

  /**
   * 对话详细内容 必须encode
   */
  value: string

  /**
   * 对话的附属信息 必须encode
   */
  meta: string
}
