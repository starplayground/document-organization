import { ERROR_CODES, FileUploadSuccess } from "@/types/api/file"

const BASE_URL = "https://api.dify.ai/v1"
const API_KEY = "app-wpTTx8CjhuWTkQaODOqkNJ0Z"

export async function POST(req: Request) {
  const formData = await req.formData()
  const files = formData.getAll("file") as File[]
  const user = (formData.get("user") as string) || "default-user"

  // 检查是否有文件
  if (files.length === 0) {
    return Response.json({ error: ERROR_CODES.no_file_uploaded }, { status: 400 })
  }

  try {
    // 处理所有文件上传
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        // 为每个文件创建新的FormData
        const difyFormData = new FormData()
        difyFormData.append("file", file)
        difyFormData.append("user", user)

        // 调用Dify API上传单个文件
        const response = await fetch(`${BASE_URL}/files/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
          body: difyFormData,
        })

        const data = await response.json()

        // 检查响应状态
        if (!response.ok) {
          const errorCode = data.error?.code || "internal_server_error"
          const error = ERROR_CODES[errorCode] || ERROR_CODES.internal_server_error

          return {
            filename: file.name,
            result: { error },
          }
        }

        return {
          filename: file.name,
          result: data as FileUploadSuccess,
        }
      }),
    )

    // 对于单文件上传，如果发生错误，直接返回错误信息
    if (files.length === 1 && uploadResults[0].result && "error" in uploadResults[0].result) {
      const error = uploadResults[0].result.error
      return Response.json({ error }, { status: error.status })
    }

    // 如果只上传了一个文件并且成功，直接返回该文件的上传结果
    if (files.length === 1 && !("error" in uploadResults[0].result)) {
      return Response.json(uploadResults[0].result)
    }

    return Response.json({
      success: true,
      message: `成功上传${files.length}个文件`,
      results: uploadResults,
    })
  } catch (error) {
    console.error("上传文件到Dify API时出错:", error)
    return Response.json({ error: ERROR_CODES.internal_server_error }, { status: 500 })
  }
}
