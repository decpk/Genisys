import { useCallback, useState } from 'react'

import type { QueryResult, SavedQuery } from './DbExplorer.types'
import { SAVED_QUERIES } from './DbExplorer.constants'

export function useDbExplorer() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [tables, setTables] = useState<string[]>([])
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{ query: string; timestamp: number }>>([])

  const loadTables = useCallback(async () => {
    try {
      const tableNames = await window.api.getTableNames()
      setTables(tableNames)
    } catch {
      setTables([])
    }
  }, [])

  const executeQuery = useCallback(async (sql: string, isWrite: boolean) => {
    if (!sql.trim()) return
    setIsRunning(true)
    setResult(null)
    try {
      const res = await window.api.executeRawQuery(sql, isWrite)
      setResult(res as QueryResult)
      setHistory((prev) => [{ query: sql, timestamp: Date.now() }, ...prev].slice(0, 20))
    } catch (err) {
      setResult({ success: false, error: String(err) })
    } finally {
      setIsRunning(false)
    }
  }, [])

  const runCurrentQuery = useCallback(
    (sql?: string) => {
      const trimmed = (sql ?? query).trim()
      if (!trimmed) return
      const isWrite = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b/i.test(trimmed)
      void executeQuery(trimmed, isWrite)
    },
    [query, executeQuery]
  )

  const runSavedQuery = useCallback(
    (saved: SavedQuery) => {
      setQuery(saved.query)
      setActiveQueryId(saved.id)
      void executeQuery(saved.query, saved.isWrite)
    },
    [executeQuery]
  )

  const selectTableQuery = useCallback(
    (table: string) => {
      const sql = `SELECT * FROM ${table} LIMIT 50;`
      setQuery(sql)
      setActiveQueryId(null)
      void executeQuery(sql, false)
    },
    [executeQuery]
  )

  const describeTable = useCallback(
    (table: string) => {
      const sql = `PRAGMA table_info('${table}');`
      setQuery(sql)
      setActiveQueryId(null)
      void executeQuery(sql, false)
    },
    [executeQuery]
  )

  return {
    query,
    setQuery,
    result,
    isRunning,
    tables,
    activeQueryId,
    history,
    savedQueries: SAVED_QUERIES,
    loadTables,
    runCurrentQuery,
    runSavedQuery,
    selectTableQuery,
    describeTable,
    executeQuery,
  }
}
