export interface InputPlusProperty {
  /**
   * 联网能力
   */
  internet: boolean
}

export const inputProperty = reactive<InputPlusProperty>({
  internet: true,
})
