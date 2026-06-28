import { FileText, Type } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ClipboardImageHoverTabPanel } from './ClipboardImageHoverTabPanel'
import { clipboardImageHoverTabsStyles as styles } from './ClipboardImageHoverTabs.styles'
import { useClipboardImageHoverTabsData } from './useClipboardImageHoverTabsData'
import type { ClipboardImageHoverTabsProps } from './ClipboardImageHoverTabs.types'

/**
 * Two-tab interactive section rendered below the image preview in the
 * clipboard hover popover. Tab 1 shows the AI description, Tab 2 shows
 * any text extracted from the image (OCR). Each tab body uses
 * `ClipboardImageHoverTabPanel` so the loading / empty / content
 * states are rendered uniformly.
 */
export function ClipboardImageHoverTabs(
  props: ClipboardImageHoverTabsProps
): React.JSX.Element {
  const { item } = props
  const { activeTab, onTabChange } = useClipboardImageHoverTabsData()

  return (
    <div className={styles.root}>
      <Tabs value={activeTab} onValueChange={onTabChange} className={styles.tabs}>
        <TabsList className={styles.list}>
          <TabsTrigger value="description" icon={<FileText size={12} />}>
            Description
          </TabsTrigger>
          <TabsTrigger value="extracted-text" icon={<Type size={12} />}>
            Text in Image
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className={styles.content}>
          <ClipboardImageHoverTabPanel
            text={item.imageDescription}
            status={item.analysisStatus}
            emptyMessage="No AI description yet."
            pendingMessage="Analyzing image…"
          />
        </TabsContent>
        <TabsContent value="extracted-text" className={styles.content}>
          <ClipboardImageHoverTabPanel
            text={item.extractedText}
            status={item.analysisStatus}
            emptyMessage="No text extracted from this image."
            pendingMessage="Extracting text…"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
