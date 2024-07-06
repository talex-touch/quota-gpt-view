export const models = reactive([
  {
    name: 'QuotaGPT 标准模型',
    value: 'gpt-3.5-turbo',
    features: [
      '标准的主力模型(Lite)',
      '适合处理部分复杂任务',
      '32k上下文窗口的推理',
      '支持高级数据分析',
      '支持静态图表生成',
      '支持普通数学公式',
      '有限联网分析能力',
    ],
  },
  {
    name: 'QuotaGPT 强化模型',
    value: 'gpt-3o-turbo',
    valuable: true,
    features: [
      '强化的主力模型(Pro)',
      '适合处理部分复杂任务',
      '32+k上下文窗口的推理',
      '支持高级数据分析',
      '支持动态图表生成',
      '支持普通数学公式',
      '强化联网分析能力',
      '无限制的角色能力',
      '图像上下文能力支持',
      '文件上下文能力支持',
    ],
  },
  {
    name: 'QuotaGPT 高级模型',
    value: 'gpt-4-turbo',
    valuable: true,
    features: [
      '强化的主力模型(Pro)',
      '适合处理部分复杂任务',
      '128+k上下文窗口的推理',
      '支持高级数据分析',
      '支持动态图表生成',
      '支持高级数学公式',
      '完全联网分析能力',
      '无限制的角色能力',
      '图像上下文能力支持',
      '文件上下文能力支持',
    ],
  },
])
