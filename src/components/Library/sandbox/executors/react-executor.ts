import React from 'react'
import ReactDOM from 'react-dom/client'
import { transform } from 'sucrase'
import type { LanguageExecutor, ExecutionResult, OutputLine } from '../types'
import { formatValue } from './javascript-executor'

const TIMEOUT_MS = 5_000

/**
 * Executes JSX/TSX code by transpiling with Sucrase and rendering
 * into a container using the app's own React instance.
 *
 * Supports:
 *   - `export default function App() { ... }`
 *   - `function App() { ... }` (renders last PascalCase function)
 *   - Raw JSX expression: `<div>Hello</div>`
 */
export const reactExecutor: LanguageExecutor = {
  id: 'react',
  label: 'React (JSX/TSX)',

  execute(code: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const output: OutputLine[] = []
      const start = performance.now()

      // Transpile JSX/TSX → React.createElement calls
      let jsCode: string
      try {
        const result = transform(code, {
          transforms: ['typescript', 'jsx'],
          jsxRuntime: 'classic',
          disableESTransforms: true,
        })
        jsCode = result.code
      } catch (err) {
        output.push({ type: 'error', content: err instanceof Error ? err.message : String(err) })
        resolve({ output, duration: performance.now() - start })
        return
      }

      const push = (type: OutputLine['type'], args: unknown[]) => {
        output.push({ type, content: args.map(formatValue).join(' ') })
      }

      const fakeConsole = {
        log: (...args: unknown[]) => push('log', args),
        warn: (...args: unknown[]) => push('warn', args),
        error: (...args: unknown[]) => push('error', args),
        info: (...args: unknown[]) => push('info', args),
        table: (data: unknown) => push('log', [data]),
        dir: (data: unknown) => push('log', [data]),
        debug: (...args: unknown[]) => push('log', args),
        clear: () => { output.length = 0 },
      }

      // Build wrapper that auto-renders the detected component
      const wrappedCode = buildRenderWrapper(jsCode)

      // Container element for rendering — will be moved into CodeSandbox's preview div
      const container = document.createElement('div')

      let finished = false
      let timer: ReturnType<typeof setTimeout> | null = null

      const finish = (error?: string) => {
        if (finished) return
        finished = true
        if (timer) clearTimeout(timer)
        resolve({
          output,
          error,
          duration: performance.now() - start,
          _container: container,
        } as ExecutionResult & { _container: HTMLDivElement })
      }

      timer = setTimeout(() => finish('Execution timed out (5 s)'), TIMEOUT_MS)

      try {
        // Create a React root for the user component
        const root = ReactDOM.createRoot(container)

        // __render receives a component (or element) and renders it
        const __render = (Comp: React.FC | React.ReactElement) => {
          try {
            const el = typeof Comp === 'function'
              ? React.createElement(Comp)
              : Comp
            root.render(el)
          } catch (err) {
            output.push({ type: 'error', content: err instanceof Error ? err.message : String(err) })
          }
        }

        // Provide React, useState, etc. to user code
        const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, Fragment } = React

        const fn = new Function(
          'React', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback',
          'useReducer', 'useContext', 'createContext', 'Fragment',
          'console', '__render',
          `"use strict";\n${wrappedCode}`
        )

        fn(
          React, useState, useEffect, useRef, useMemo, useCallback,
          useReducer, useContext, createContext, Fragment,
          fakeConsole, __render,
        )

        // Give React a tick to render, then resolve
        setTimeout(() => finish(), 100)
      } catch (err) {
        output.push({ type: 'error', content: err instanceof Error ? err.message : String(err) })
        finish()
      }
    })
  },
}

function buildRenderWrapper(jsCode: string): string {
  const hasExportDefault = /export\s+default\s+/.test(jsCode)

  if (hasExportDefault) {
    const cleaned = jsCode.replace(/export\s+default\s+/, 'var __DefaultComp = ')
    return `${cleaned}\n;__render(__DefaultComp);`
  }

  // Find PascalCase function/const declarations (likely components)
  const fnMatches = [...jsCode.matchAll(/(?:function|const|let|var)\s+([A-Z][a-zA-Z0-9]*)/g)]
  if (fnMatches.length > 0) {
    const lastComp = fnMatches[fnMatches.length - 1][1]
    return `${jsCode}\n;__render(${lastComp});`
  }

  // Treat entire code as a JSX expression
  return `__render(function __Wrapper() { return (${jsCode}); });`
}
