import type { GitInvokeResponse } from '../git.types'

interface NotesRemoveOutput {
  stdout: string
}

export async function invokeGitNotesRemove(params: {
  rootPath: string
  refName?: string
}): Promise<string> {
  const res = (await window.api.gitNotesRemove({
    rootPath: params.rootPath,
    refName: params.refName,
  })) as GitInvokeResponse<NotesRemoveOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to remove note.')
  }
  return res.data.stdout
}
