import type { ExplorerTemplate } from '../templates'

interface HandleNewFromTemplateParams {
  rootPath: string
  parentPath: string
  template: ExplorerTemplate
}

export async function handleNewFromTemplate(params: HandleNewFromTemplateParams): Promise<void> {
  const { rootPath, parentPath, template } = params
  const normalizedParent = parentPath === '/' ? '' : parentPath.replace(/\/+$/, '')
  const targetPath = normalizedParent === '' ? template.filename : `${normalizedParent}/${template.filename}`
  const result = (await window.api.createFile(rootPath, targetPath, template.content)) as {
    success: boolean
    error?: string
  }
  if (!result.success) {
    throw new Error(result.error ?? `Failed to create ${template.filename}`)
  }
}
