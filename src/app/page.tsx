"use client"

import { useState } from "react"

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setSelectedFiles(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

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

      setResult(wfData?.data?.outputs?.result ?? null)
    } catch (err) {
      console.error(err)
      setError("发生错误")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
        <div>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          <p className="text-sm text-gray-500 mt-1">可一次上传最多 10 个文件</p>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "处理中..." : "上传并执行"}
        </button>
      </form>
      {result && (
        <div className="mt-8 w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-2">Workflow 结果</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap break-all">
            {result}
          </pre>
        </div>
      )}
    </main>
  )
}
