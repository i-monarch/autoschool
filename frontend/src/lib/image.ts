// Strip external vodiy.ua prefix if it leaked through (e.g. stale sessionStorage
// from before the image re-import). All question images live under /media/.
export function normalizeQuestionImage(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('https://vodiy.ua/media/')) return url.slice('https://vodiy.ua'.length)
  if (url.startsWith('http://vodiy.ua/media/')) return url.slice('http://vodiy.ua'.length)
  return url
}
