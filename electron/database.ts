import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'

let db: ReturnType<typeof Database>

export function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'korean-app.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)
}

export function loadItem(key: string): string | null {
  const row = db.prepare('SELECT value FROM store WHERE key = ?').get(key) as { value: string } | undefined
  return row ? row.value : null
}

export function saveItem(key: string, value: string) {
  db.prepare('INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)').run(key, value)
}

export function removeItem(key: string) {
  db.prepare('DELETE FROM store WHERE key = ?').run(key)
}
