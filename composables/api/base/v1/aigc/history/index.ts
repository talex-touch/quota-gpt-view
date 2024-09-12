import type { EffectScope } from 'vue'
import type { ThHistory } from '~/components/history/history-types'
import { userStore } from '#imports'
import { $endApi } from '~/composables/api/base'
import type { IChatConversation } from '~/composables/api/base/index.type'
import { encodeObject } from '~/composables/common'

export enum HistoryManageMode {
  OFFLINE,
  ONLINE,
}

export interface IHistoryManager {
  getCurrentMode: () => HistoryManageMode

  /**
   * 触发模式更新，用于抉择历史管理状态
   * 1.离线模式使用 localStorage 管理
   * 2.在线模式需要进行以下步骤：
   *  a) 上传离线模式对话记录
   *  b) 同步历史在线对话记录
   *  c) 接受对话记录更新上传
   */
  triggerUpdateMode: () => void

  uploadHistory: (history: ThHistory, uploadHandler: IUploadHistoryHandler) => Promise<boolean>
}

export interface IUploadHistoryHandler {
  onHistorySyncing: () => void
  onHistoryUploadFailed: (error: Error) => void
  onHistoryUploadSuccess: () => void
}

export class HistoryManager implements IHistoryManager {
  #historyList: ThHistory[] = []

  constructor() {

  }

  #updateScope?: EffectScope

  triggerUpdateMode() {
    if (this.#updateScope)
      this.#updateScope.stop()

    this.#updateScope = effectScope()

    this.#updateScope.run(() => {
      const localHistoryList = useLocalStorage<ThHistory[]>('chat-history', [])

      if (this.getCurrentMode()) {
        this.#historyList = reactive([])

        if (localHistoryList.value.length) {
          // TODO: 上传离线对话记录
          // TODO: 同步历史在线对话记录
        }
      }
      else {
        this.#historyList = reactive(localHistoryList.value)
      }
    })
  }

  async uploadHistory(history: IChatConversation, uploadHandler: IUploadHistoryHandler) {
    uploadHandler.onHistorySyncing()

    async function _innerUpload() {
      if (!history.id?.length)
        throw new Error('history id is empty')

      const uploadTime = new Date()

      const meta: Record<string, any> = {
        sync: true,
        lastUpdate: uploadTime.getTime(),
        templateId: history.templateId || -1, // 兜底策略，兼容以前版本
      }

      const uploadQuery = {
        chat_id: history.id,
        topic: history.topic,
        value: encodeObject(history.messages),
        meta: encodeObject(meta),
      }

      const res = await $endApi.v1.chat.uploadHistory(uploadQuery)

      if (res.code !== 200)
        throw new Error(res.message || 'Upload failed')

      uploadHandler.onHistoryUploadSuccess()

      return true
    }

    try {
      return _innerUpload()
    }
    catch (e: any) {
      uploadHandler.onHistoryUploadFailed(e instanceof Error ? e : new Error(e))
    }

    return false
  }

  getCurrentMode() {
    return userStore.value.isLogin ? HistoryManageMode.ONLINE : HistoryManageMode.OFFLINE
  }
}

export const $historyManager = new HistoryManager()
