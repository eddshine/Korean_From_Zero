import { useEffect, useState } from 'react'
import { Book, Unit, Chapter, Lesson } from '../types'
import { getBookById, getUnitById, getChapterById, getLessonById, getBooks } from './index'

export function useBook(bookId: number | null) {
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    if (bookId === null) { setBook(null); setLoading(false); return }
    getBookById(bookId).then(b => { setBook(b ?? null); setLoading(false) })
  }, [bookId])
  return { book, loading }
}

export function useUnit(bookId: number | null, unitId: number | null) {
  const [unit, setUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    if (bookId === null || unitId === null) { setUnit(null); setLoading(false); return }
    getUnitById(bookId, unitId).then(u => { setUnit(u ?? null); setLoading(false) })
  }, [bookId, unitId])
  return { unit, loading }
}

export function useChapter(bookId: number | null, unitId: number | null, chapterId: number | null) {
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    if (bookId === null || unitId === null || chapterId === null) { setChapter(null); setLoading(false); return }
    getChapterById(bookId, unitId, chapterId).then(c => { setChapter(c ?? null); setLoading(false) })
  }, [bookId, unitId, chapterId])
  return { chapter, loading }
}

export function useLesson(bookId: number | null, unitId: number | null, chapterId: number | null, lessonId: number | null) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    if (bookId === null || unitId === null || chapterId === null || lessonId === null) { setLesson(null); setLoading(false); return }
    getLessonById(bookId, unitId, chapterId, lessonId).then(l => { setLesson(l ?? null); setLoading(false) })
  }, [bookId, unitId, chapterId, lessonId])
  return { lesson, loading }
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getBooks().then(b => { setBooks(b); setLoading(false) })
  }, [])
  return { books, loading }
}
