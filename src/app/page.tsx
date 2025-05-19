"use client"

import { useState } from "react"

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [parsedResult, setParsedResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setSelectedFiles(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setParsedResult(null)

    if (selectedFiles.length === 0) {
      setError("请选择至少一个文件")
      return
    }

    if (selectedFiles.length > 10) {
      setError("一次最多上传 10 个文件")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append("file", file))

      const uploadRes = await fetch("/api/file", {
        method: "POST",
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        setError(uploadData.error?.message || "文件上传失败")
        setLoading(false)
        return
      }

      const ids: string[] = []

      if (Array.isArray(uploadData.results)) {
        uploadData.results.forEach((item: any) => {
          const res = item.result
          if (res && !res.error && res.id) {
            ids.push(res.id)
          }
        })
      } else if (uploadData.id) {
        ids.push(uploadData.id)
      }

      if (ids.length === 0) {
        setError("未能获取文件ID")
        setLoading(false)
        return
      }

      const wfRes = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: {
            files: ids.map((id) => ({
              type: "document",
              transfer_method: "local_file",
              upload_file_id: id,
            })),
          },
        }),
      })

      const wfData = await wfRes.json()
      if (!wfRes.ok) {
        setError(wfData.error || "执行工作流失败")
        setLoading(false)
        return
      }

      // 保存原始结果
      const rawResult = wfData?.data?.outputs?.result ?? null
      setResult(rawResult)

      // 解析JSON结果
      if (rawResult) {
        try {
          const parsed = JSON.parse(rawResult)
          setParsedResult(parsed)
        } catch (err) {
          console.error("解析JSON结果失败", err)
        }
      }
    } catch (err) {
      console.error(err)
      setError("发生错误")
    } finally {
      setLoading(false)
    }
  }

  // 渲染整个结果
  const renderResult = () => {
    if (!parsedResult) return null

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">分析结果</h3>

          {Object.entries(parsedResult).map(([category, content]: [string, any]) => (
            <div key={category} className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                {category}
              </h4>

              <div className="ml-1">
                {Object.entries(content).map(([label, tags]: [string, any]) => (
                  <div key={label} className="mb-3">
                    <div className="flex items-start">
                      <span className="text-sm font-medium text-gray-700 mr-2 min-w-24">
                        {label}:
                      </span>
                      <div className="flex-1 flex flex-wrap gap-1.5">
                        {Array.isArray(tags) &&
                          tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        {!Array.isArray(tags) && (
                          <span className="text-sm text-gray-600">{String(tags)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">文档分析系统</h1>
          <p className="mt-2 text-gray-600">上传文档，自动提取标签和维度</p>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-2">
                  选择文件
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>选择文件</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">或拖拽文件到此处</p>
                    </div>
                    <p className="text-xs text-gray-500">支持多种文档格式，最多10个文件</p>
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">已选择 {selectedFiles.length} 个文件：</p>
                    <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="truncate">
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      处理中...
                    </>
                  ) : (
                    "上传并分析"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 分析结果 */}
        {parsedResult && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">文档分析结果</h2>
            {renderResult()}
          </div>
        )}

        {/* 如果解析失败，显示原始结果 */}
        {result && !parsedResult && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">处理结果</h2>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <pre className="whitespace-pre-wrap break-all text-sm overflow-auto max-h-96">
                {result}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
