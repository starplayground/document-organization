'use client'
import { useI18n, Locale } from '@/i18n'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale)
  }
  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={locale}
      onChange={handleChange}
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  )
}
