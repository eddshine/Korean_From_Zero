import { Book } from '../types'

const cache = new Map<number, Book>()

async function loadBook(id: number): Promise<Book> {
  if (cache.has(id)) return cache.get(id)!
  let mod: { book1?: Book; book2?: Book; book3?: Book }
  if (id === 1) mod = await import('./book1')
  else if (id === 2) mod = await import('./book2')
  else if (id === 3) mod = await import('./book3')
  else throw new Error(`Unknown book id: ${id}`)
  const key = `book${id}` as keyof typeof mod
  const book = mod[key] as Book
  cache.set(id, book)
  return book
}

const bookLoaders = [loadBook(1), loadBook(2), loadBook(3)]

export async function getBooks(): Promise<Book[]> {
  return Promise.all(bookLoaders)
}

export async function getBookById(id: number): Promise<Book | undefined> {
  try {
    return await loadBook(id)
  } catch {
    return undefined
  }
}

export async function getUnitById(bookId: number, unitId: number) {
  const book = await getBookById(bookId)
  return book?.units.find(u => u.id === unitId)
}

export async function getChapterById(bookId: number, unitId: number, chapterId: number) {
  const unit = await getUnitById(bookId, unitId)
  return unit?.chapters.find(c => c.id === chapterId)
}

export async function getLessonById(bookId: number, unitId: number, chapterId: number, lessonId: number) {
  const chapter = await getChapterById(bookId, unitId, chapterId)
  return chapter?.lessons.find(l => l.id === lessonId)
}

export function makeLessonKey(bookId: number, unitId: number, chapterId: number, lessonId: number): string {
  return `${bookId}-${unitId}-${chapterId}-${lessonId}`
}
