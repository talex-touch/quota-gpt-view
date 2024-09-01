export interface ICompletionHandler {
  onTriggerStatus?: (status: CompletionStatus) => void
  onReqCompleted?: () => void
  onFrequentLimit?: () => void
  // return true to deny auto add
  onCompletion?: (name: string, text: string) => boolean
  onCompletionStart?: (name: string) => void
  onChainEnd?: (name: string) => void
  onToolStart?: (name: string, input?: string) => void
  onToolEnd?: (name: string, output?: string) => void
  onError?: () => void
}

export interface IToolHandler {
  onToolStart: (name: string, input?: string) => void
  onToolEnd: (name: string, output?: string) => void
}
