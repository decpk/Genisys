import { useState, useCallback } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('clipboard')
import { executeTransform } from '../../utils/ai-transform'
import type { TransformAction } from '../../utils/ai-transform'

export function useTransformMenuData(text: string, onTransformComplete: (result: string) => void) {
  const [isTransforming, setIsTransforming] = useState(false)
  const [activeAction, setActiveAction] = useState<TransformAction | null>(null)

  const handleTransform = useCallback(async (action: TransformAction) => {
    setIsTransforming(true)
    setActiveAction(action)

    try {
      const result = await executeTransform(action, text)

      if (result.success) {
        onTransformComplete(result.content)
        toast.success('Transform complete — copied to clipboard')
      } else {
        toast.error(result.error || 'Transform failed')
      }
    } catch {
      toast.error('Transform failed')
    } finally {
      setIsTransforming(false)
      setActiveAction(null)
    }
  }, [text, onTransformComplete])

  return {
    isTransforming,
    activeAction,
    handleTransform,
  }
}
