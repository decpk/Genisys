import { useCallback, useEffect, useRef, useState } from 'react'

import type { MockEndpointVariant } from '@/components/MockServer/MockServer.types'

import type { UpdateVariantInput } from '../../../../VariantsTab.types'

const BODY_PERSIST_DELAY = 500

export function useVariantItemData(
  variant: MockEndpointVariant,
  onUpdate: (params: UpdateVariantInput) => void
) {
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState(variant.name)
  const [statusCode, setStatusCode] = useState(variant.status_code)
  const [body, setBody] = useState(variant.response_body)
  const [weight, setWeight] = useState(variant.weight)
  const bodyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Re-sync local drafts when the persisted variant fields change.
  useEffect(() => {
    setName(variant.name)
    setStatusCode(variant.status_code)
    setBody(variant.response_body)
    setWeight(variant.weight)
  }, [variant.name, variant.status_code, variant.response_body, variant.weight])

  useEffect(() => {
    return () => {
      if (bodyTimer.current) clearTimeout(bodyTimer.current)
    }
  }, [])

  const handleNameChange = useCallback((value: string) => setName(value), [])
  const persistName = useCallback(
    () => onUpdate({ id: variant.id, name }),
    [onUpdate, variant.id, name]
  )

  const handleStatusChange = useCallback((value: number) => setStatusCode(value), [])
  const persistStatus = useCallback(
    () => onUpdate({ id: variant.id, statusCode }),
    [onUpdate, variant.id, statusCode]
  )

  const handleWeightChange = useCallback((value: number) => setWeight(value), [])
  const persistWeight = useCallback(
    () => onUpdate({ id: variant.id, weight }),
    [onUpdate, variant.id, weight]
  )

  const handleBodyChange = useCallback(
    (next: string) => {
      setBody(next)
      if (bodyTimer.current) clearTimeout(bodyTimer.current)
      bodyTimer.current = setTimeout(() => {
        onUpdate({ id: variant.id, responseBody: next })
      }, BODY_PERSIST_DELAY)
    },
    [onUpdate, variant.id]
  )

  const handleMatchRulesChange = useCallback(
    (rules: string) => onUpdate({ id: variant.id, matchRules: rules }),
    [onUpdate, variant.id]
  )

  return {
    expanded,
    setExpanded,
    name,
    handleNameChange,
    persistName,
    statusCode,
    handleStatusChange,
    persistStatus,
    body,
    handleBodyChange,
    weight,
    handleWeightChange,
    persistWeight,
    handleMatchRulesChange,
  }
}
