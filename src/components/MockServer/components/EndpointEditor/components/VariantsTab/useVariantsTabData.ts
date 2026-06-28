import { useCallback, useEffect, useMemo } from 'react'

import { useMockServerStore } from '@/store/mock-server-store'
import type {
  MockEndpoint,
  MockEndpointVariant,
  VariantMode,
} from '@/components/MockServer/MockServer.types'

import type { UpdateVariantInput, UseVariantsTabData } from './VariantsTab.types'

const EMPTY_VARIANTS: MockEndpointVariant[] = []

export function useVariantsTabData(): UseVariantsTabData {
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const activeEndpointTabId = useMockServerStore((s) => s.activeEndpointTabId)
  const endpoints = useMockServerStore((s) => s.endpoints)
  const updateEndpoint = useMockServerStore((s) => s.updateEndpoint)
  const loadVariants = useMockServerStore((s) => s.loadVariants)
  const createVariant = useMockServerStore((s) => s.createVariant)
  const updateVariant = useMockServerStore((s) => s.updateVariant)
  const deleteVariant = useMockServerStore((s) => s.deleteVariant)

  const endpoint = useMemo((): MockEndpoint | null => {
    if (!selectedServerId || !activeEndpointTabId) return null
    const list = endpoints[selectedServerId] ?? []
    return list.find((ep) => ep.id === activeEndpointTabId) ?? null
  }, [selectedServerId, activeEndpointTabId, endpoints])

  const endpointId = endpoint?.id ?? null

  const variants = useMockServerStore((s) =>
    endpointId ? (s.variants[endpointId] ?? EMPTY_VARIANTS) : EMPTY_VARIANTS
  )

  const mode = (endpoint?.variant_mode ?? 'single') as VariantMode

  // Load variants for the active endpoint on mount / endpoint change.
  useEffect(() => {
    if (endpointId) loadVariants(endpointId)
  }, [endpointId, loadVariants])

  const setMode = useCallback(
    (next: VariantMode) => {
      if (endpoint) void updateEndpoint({ ...endpoint, variant_mode: next })
    },
    [endpoint, updateEndpoint]
  )

  const handleAddVariant = useCallback(() => {
    if (!endpointId) return
    void createVariant({
      endpointId,
      name: 'New variant',
      statusCode: 200,
      responseBody: '{}',
      responseHeaders: '{}',
      matchRules: '[]',
      weight: 1,
      orderIndex: variants.length,
      isActive: true,
    })
  }, [endpointId, variants.length, createVariant])

  const handleDuplicateVariant = useCallback(
    (id: string) => {
      if (!endpointId) return
      const source = variants.find((v) => v.id === id)
      if (!source) return

      void createVariant({
        endpointId,
        name: `${source.name} copy`,
        statusCode: source.status_code,
        responseBody: source.response_body,
        responseHeaders: source.response_headers,
        matchRules: source.match_rules,
        weight: source.weight,
        orderIndex: variants.length,
        isActive: source.is_active,
      })
    },
    [endpointId, variants, createVariant]
  )

  const handleDeleteVariant = useCallback(
    (id: string) => {
      if (!endpointId) return
      void deleteVariant(id, endpointId)
    },
    [endpointId, deleteVariant]
  )

  const handleUpdateVariant = useCallback(
    (params: UpdateVariantInput) => {
      if (!endpointId) return
      void updateVariant({ endpointId, ...params })
    },
    [endpointId, updateVariant]
  )

  return {
    mode,
    variants,
    endpointId,
    setMode,
    handleAddVariant,
    handleDuplicateVariant,
    handleDeleteVariant,
    handleUpdateVariant,
  }
}
