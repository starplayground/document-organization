// 定义工作流响应类型

// 工作流输出结果
export interface WorkflowOutputs {
  result: string | string[]
  [key: string]: any // 允许其他可能的输出字段
}

// 工作流数据
export interface WorkflowData {
  id: string
  workflow_id: string
  status: "running" | "succeeded" | "failed" | string
  outputs: WorkflowOutputs
  error?: any
  elapsed_time: number
  total_tokens: number
  total_steps: number
  created_at: number
  finished_at: number
}

// 工作流响应
export interface WorkflowResponse {
  task_id: string
  workflow_run_id: string
  data: WorkflowData
}
