import { createContext, useContext, useState, useCallback } from 'react'

export type Locale = 'en' | 'zh'

const translations: Record<Locale, Record<string, string>> = {
  en: {
    chooseAtLeastOneFile: 'Please select at least one file',
    maxFiles: 'You can upload up to 10 files',
    uploadFailed: 'File upload failed',
    noFileId: 'Failed to get file ID',
    workflowFailed: 'Workflow execution failed',
    error: 'An error occurred',
    analysisResult: 'Analysis Result',
    systemTitle: 'Document Analysis System',
    systemSubtitle: 'Upload documents to automatically extract tags and dimensions',
    selectFiles: 'Choose File',
    dragHere: 'Or drag files here',
    supportFormats: 'Supports multiple document formats, up to 10 files',
    selectedFiles: 'Selected {{count}} files:',
    processing: 'Processing...',
    uploadAnalyze: 'Upload and Analyze',
    resultTitle: 'Document Analysis Result',
    rawResultTitle: 'Process Result',
  },
  zh: {
    chooseAtLeastOneFile: '请选择至少一个文件',
    maxFiles: '一次最多上传 10 个文件',
    uploadFailed: '文件上传失败',
    noFileId: '未能获取文件ID',
    workflowFailed: '执行工作流失败',
    error: '发生错误',
    analysisResult: '分析结果',
    systemTitle: '文档分析系统',
    systemSubtitle: '上传文档，自动提取标签和维度',
    selectFiles: '选择文件',
    dragHere: '或拖拽文件到此处',
    supportFormats: '支持多种文档格式，最多10个文件',
    selectedFiles: '已选择 {{count}} 个文件：',
    processing: '处理中...',
    uploadAnalyze: '上传并分析',
    resultTitle: '文档分析结果',
    rawResultTitle: '处理结果',
  },
}

interface I18nContextProps {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined)

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('zh')

  const t = useCallback(
    (key: string, vars: Record<string, string | number> = {}) => {
      const template = translations[locale][key] || key
      return Object.keys(vars).reduce(
        (str, v) => str.replace(`{{${v}}}`, String(vars[v])),
        template
      )
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
