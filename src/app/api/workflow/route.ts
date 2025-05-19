const BASE_URL = "https://api.dify.ai/v1"
const API_KEY = "app-wpTTx8CjhuWTkQaODOqkNJ0Z"

import { WorkflowResponse } from "@/types"

export async function POST(req: Request) {
  const {
    inputs,
    transfer_method,
    upload_file_id,
    response_mode = "blocking",
    user = "user-default",
  } = await req.json()

  try {
    const response = await fetch(`${BASE_URL}/workflows/run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs,
        response_mode,
        user,
        transfer_method,
        upload_file_id,
      }),
    })

    // 如果是流式响应，返回原始流
    if (response_mode === "streaming") {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    // 如果是非流式响应，直接返回JSON
    const data = (await response.json()) as WorkflowResponse
    return Response.json(data)
  } catch (error) {
    console.error("Workflow API error:", error)
    return Response.json({ error: "调用工作流API失败" }, { status: 500 })
  }
}
