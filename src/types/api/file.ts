// 定义文件上传成功响应类型
export interface FileUploadSuccess {
  id: string // UUID
  name: string
  size: number // 文件大小(byte)
  extension: string // 文件后缀
  mime_type: string // 文件mime-type
  created_by: string // UUID 上传人ID
  created_at: string // timestamp 上传时间
}

// 定义错误响应类型
export interface FileUploadError {
  code: string // 错误代码
  message: string // 错误描述信息
  status: number // HTTP状态码
}

// 定义文件上传响应的通用类型
export type FileUploadResponse = FileUploadSuccess | { error: FileUploadError }

// 错误代码映射
export const ERROR_CODES: Record<string, FileUploadError> = {
  no_file_uploaded: { code: "no_file_uploaded", message: "必须提供文件", status: 400 },
  too_many_files: { code: "too_many_files", message: "目前只接受一个文件", status: 400 },
  unsupported_preview: { code: "unsupported_preview", message: "该文件不支持预览", status: 400 },
  unsupported_estimate: { code: "unsupported_estimate", message: "该文件不支持估算", status: 400 },
  file_too_large: { code: "file_too_large", message: "文件太大", status: 413 },
  unsupported_file_type: {
    code: "unsupported_file_type",
    message: "不支持的扩展名，当前只接受文档类文件",
    status: 415,
  },
  s3_connection_failed: {
    code: "s3_connection_failed",
    message: "无法连接到 S3 服务",
    status: 503,
  },
  s3_permission_denied: {
    code: "s3_permission_denied",
    message: "无权限上传文件到 S3",
    status: 503,
  },
  s3_file_too_large: { code: "s3_file_too_large", message: "文件超出 S3 大小限制", status: 503 },
  internal_server_error: { code: "internal_server_error", message: "文件上传失败", status: 500 },
}
