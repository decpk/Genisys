export function getAnalysisStatusColor(analysisStatus: string): string {
  if (analysisStatus === 'done') return 'text-emerald-500'
  if (analysisStatus === 'failed') return 'text-amber-500'
  return 'text-muted-foreground'
}
