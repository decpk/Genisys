import { Server, Zap, Globe, Sparkles, Plus, FolderPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useMockServerEmptyStateData } from './useMockServerEmptyStateData'
import * as styles from './MockServerEmptyState.styles'

export function MockServerEmptyState() {
  const { handleCreateServer, handleCreateProject } = useMockServerEmptyStateData()

  return (
    <div className={styles.wrapper}>
      <div className={styles.iconBox}>
        <Server className={styles.icon} />
      </div>

      <div className={styles.header}>
        <h2 className={styles.title}>Mock Server</h2>
        <p className={styles.description}>
          Spin up a mock API server with custom endpoints and AI-generated
          responses in seconds.
        </p>
      </div>

      <div className={styles.actions}>
        <Button size="lg" onClick={handleCreateServer}>
          <Plus />
          Create Server
        </Button>
        <Button variant="outline" size="lg" onClick={handleCreateProject}>
          <FolderPlus />
          New Project
        </Button>
      </div>

      <div className={styles.featureRow}>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span>Instant setup</span>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>
            <Globe className="h-3.5 w-3.5" />
          </div>
          <span>Custom endpoints</span>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span>AI responses</span>
        </div>
      </div>
    </div>
  )
}
