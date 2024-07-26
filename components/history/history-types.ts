export interface ThHistory extends ChatCompletion {
  sync: boolean
  syncing: boolean
}

export interface DisplayHistory extends ThHistory {
  index: number
}

export default {}
