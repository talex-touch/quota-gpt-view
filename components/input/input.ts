export interface InputPlusProperty {
  /**
   * 联网能力
   */
  internet: boolean

  temperature: number
}

export const inputProperty = reactive<InputPlusProperty>({
  internet: true,
  temperature: 50,
})

export const prompts = ['作为通用智能领域的专业人士，具备深厚的数学知识和技能。运用数学原理和算法解决复杂的机器学习和数据分析问题，推动人工智能技术的发展和应用。在科研机构、高校或科技公司工作，致力于创新和推动人工智能技术的不断进步。']
