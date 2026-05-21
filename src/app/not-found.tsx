import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
      <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">404</div>
      <h1 className="text-2xl font-bold">Страница не найдена</h1>
      <p className="text-gray-500">Такого инструмента нет. Возможно, он появится в будущем.</p>
      <div className="flex justify-center gap-3">
        <Link href="/" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
          На главную
        </Link>
        <Link href="/docs" className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          API Docs
        </Link>
      </div>
    </div>
  )
}
