import { useCallback, useEffect, useRef, useState } from 'react'

import { downloadBlob } from '@/components/Library/book-export'

import {
  COPY_FEEDBACK_DURATION_MS,
  DOWNLOAD_FILENAME,
  DOWNLOAD_MIME_TYPE,
  ZOOM_STEP,
} from './MermaidViewer.constants'
import type {
  ActionsState,
  MermaidViewerState,
  PanState,
  Point,
  RenderState,
  ZoomState,
} from './MermaidViewer.types'
import { clampScale, initializeMermaid, renderMermaidChart } from './MermaidViewer.utils'

/* ── Render hook — owns mermaid rendering + theme reactivity ── */

function useMermaidRender(chart: string): RenderState {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const isDark = useRef(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    let cancelled = false
    const currentIsDark = document.documentElement.classList.contains('dark')
    isDark.current = currentIsDark

    initializeMermaid(currentIsDark)

    renderMermaidChart(chart)
      .then((styled) => {
        if (!cancelled) {
          setSvg(styled)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
          setSvg('')
        }
      })

    return () => {
      cancelled = true
    }
  }, [chart])

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      const newIsDark = root.classList.contains('dark')
      if (newIsDark !== isDark.current) {
        isDark.current = newIsDark
        initializeMermaid(newIsDark)
        renderMermaidChart(chart)
          .then((styled) => setSvg(styled))
          .catch(() => {})
      }
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [chart])

  return { svg, error }
}

/* ── Zoom hook — owns scale state + wheel listener ── */

function useMermaidZoom(): ZoomState {
  const [scale, setScale] = useState(1)
  const [isZooming, setIsZooming] = useState(false)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const el = svgContainerRef.current
    if (!el) return
    const handleWheel = (e: WheelEvent): void => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP.wheel : ZOOM_STEP.wheel
      setScale((s) => clampScale(s + delta))
      setIsZooming(true)
      clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = setTimeout(() => setIsZooming(false), 150)
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const handleZoomIn = useCallback(
    (): void => setScale((s) => clampScale(s + ZOOM_STEP.button)),
    [],
  )

  const handleZoomOut = useCallback(
    (): void => setScale((s) => clampScale(s - ZOOM_STEP.button)),
    [],
  )

  const handleReset = useCallback((): void => setScale(1), [])

  return {
    scale,
    zoomPercent: Math.round(scale * 100),
    isZooming,
    svgContainerRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
  }
}

/* ── Pan hook — owns translate state + mouse drag ── */

function useMermaidPan(): PanState {
  const [isPanning, setIsPanning] = useState(false)
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 0 })
  const panStart = useRef<Point>({ x: 0, y: 0 })
  const translateStart = useRef<Point>({ x: 0, y: 0 })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY }
      translateStart.current = { ...translate }
    },
    [translate],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return
      setTranslate({
        x: translateStart.current.x + (e.clientX - panStart.current.x),
        y: translateStart.current.y + (e.clientY - panStart.current.y),
      })
    },
    [isPanning],
  )

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  return { isPanning, translate, handleMouseDown, handleMouseMove, handleMouseUp }
}

/* ── Actions hook — owns copy, download, expand ── */

function useMermaidActions(chart: string, svg: string): ActionsState {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        // Consume Escape so collapsing the diagram doesn't also exit native fullscreen.
        e.preventDefault()
        setExpanded(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [expanded])

  const handleCopy = useCallback((): void => {
    navigator.clipboard.writeText(chart)
    setCopied(true)
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS)
  }, [chart])

  const handleDownloadSvg = useCallback(async (): Promise<void> => {
    if (!svg) return
    const blob = new Blob([svg], { type: DOWNLOAD_MIME_TYPE })
    await downloadBlob(blob, DOWNLOAD_FILENAME)
  }, [svg])

  const toggleExpanded = useCallback(() => setExpanded((e) => !e), [])

  return { copied, expanded, handleCopy, handleDownloadSvg, toggleExpanded }
}

/* ── Orchestrator hook — composes all focused hooks ── */

export function useMermaidViewer(chart: string): MermaidViewerState {
  const containerRef = useRef<HTMLDivElement>(null)
  const render = useMermaidRender(chart)
  const zoom = useMermaidZoom()
  const pan = useMermaidPan()
  const actions = useMermaidActions(chart, render.svg)

  return {
    containerRef,
    ...render,
    ...zoom,
    ...pan,
    ...actions,
  }
}
