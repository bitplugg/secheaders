const ru: Record<string, string> = {
  'app.title': 'SecHeaders — Web Security Toolkit',
  'app.description': 'Набор инструментов для анализа безопасности веб-сайтов.',
  'nav.home': 'Главная',
  'nav.tools': 'Инструменты',
  'nav.docs': 'API',
  'scan.title': 'Сканирование заголовков',
  'scan.placeholder': 'Введите URL сайта...',
  'scan.button': 'Сканировать',
  'scan.loading': 'Сканирование...',
  'scan.error': 'Сайт недоступен',
  'scan.history': 'Последние сканирования',
  'common.search': 'Поиск инструментов...',
  'common.export': 'Экспорт',
  'common.share': 'Поделиться',
  'common.start': 'Начать работу',
  'common.noResults': 'Ничего не найдено',
}

const en: Record<string, string> = {
  'app.title': 'SecHeaders — Web Security Toolkit',
  'app.description': 'Web security analysis toolkit.',
  'nav.home': 'Home',
  'nav.tools': 'Tools',
  'nav.docs': 'API',
  'scan.title': 'Header Scanner',
  'scan.placeholder': 'Enter website URL...',
  'scan.button': 'Scan',
  'scan.loading': 'Scanning...',
  'scan.error': 'Website unreachable',
  'scan.history': 'Recent scans',
  'common.search': 'Search tools...',
  'common.export': 'Export',
  'common.share': 'Share',
  'common.start': 'Get started',
  'common.noResults': 'No results found',
}

export type Locale = 'ru' | 'en'
export const locales: Record<Locale, Record<string, string>> = { ru, en }
