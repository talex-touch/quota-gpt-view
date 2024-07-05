export interface ThHistory extends ChatCompletion {
  sync: boolean
}

export interface DisplayHistory extends ThHistory {
  index: number
}

export default {}
