"use client"

import { useState } from "react"

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState("")
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (selected && selected.length > 10) {
      setError("一次最多上传 10 个文件")
      e.target.value = ""
      return
    }
    setError("")
    setFiles(selected)
  }

  const handleSubmit = async () => {
    if (!files || files.length === 0) {
      setError("请选择文件")
      return
    }

    setLoading(true)
    setError("")
    setText("")

    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append("file", file))

    try {
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

      let fileIds: string[] = []

      if (Array.isArray(uploadData.results)) {
        uploadData.results.forEach((item: any) => {
          if (item.result && !item.result.error) {
            fileIds.push(item.result.id)
          }
        })
      } else if (uploadData.id) {
        fileIds.push(uploadData.id)
      }

      if (fileIds.length === 0) {
        setError("未能上传任何文件")
        setLoading(false)
        return
      }

      const workflowRes = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: {
            files: fileIds.map((id) => ({
              type: "document",
              transfer_method: "local_file",
              upload_file_id: id,
            })),
          },
        }),
      })

      const workflowData = await workflowRes.json()

      if (!workflowRes.ok) {
        setError(workflowData.error || "执行 workflow 失败")
        setLoading(false)
        return
      }

      const output: string[] =
        workflowData?.data?.outputs?.result || []
      setText(output.join("\n"))
    } catch (e) {
      setError("请求失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">多文件上传</h1>
      <input type="file" multiple onChange={handleChange} />
      <button
        className="ml-2 px-4 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        onClick={handleSubmit}
        disabled={loading}
      >
        上传并处理
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {loading && <p className="mt-2">处理中...</p>}
      {text && (
        <div className="mt-4 whitespace-pre-wrap border p-2 rounded">
          {text}
        </div>
      )}
    </div>
  )
}
