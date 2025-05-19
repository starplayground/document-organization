# 项目介绍

这是一个多文档分类的前端项目，技术栈是 nextjs + tailwindcss

# 后端调用流程

## 文件上传

你需要先让用户上传文件：调用 `api/file`中的接口，然后会得到这个 json 响应

```json
{
  "id": "b82a9310-c136-49da-8678-44ec5fcee4bc",
  "name": "Next's SEO 优化.md",
  "size": 10298,
  "extension": "md",
  "mime_type": "text/markdown",
  "created_by": "b2a163c4-9fd0-4576-b46b-a5bf608ef799",
  "created_at": 1747638576,
  "preview_url": null
}
```

## 执行 workflow

你会拿到一串 id，如果是多文件上传，就会返回数组，具体代码在 `api/workflow`，下

```json
{
  "inputs": {
    "files": [
      {
        "type": "document",
        "transfer_method": "local_file",
        "upload_file_id": "b82a9310-c136-49da-8678-44ec5fcee4bc"
      },
      {
        "type": "document",
        "transfer_method": "local_file",
        "upload_file_id": "<other file id>"
      },
      more...
    ]
  }
}
```

# 待做任务

构建一个页面，让用户上传多文件（每次最多 10 个），然后返回 workflow 的结果，渲染最后提取出来的文本
