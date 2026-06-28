import type { GitInvokeResponse } from '../git.types'

interface NotesShowOutput {
  stdout: string
}

export async function invokeGitNotesShow(params: {
  rootPath: string
  refName?: string
}): Promise<string> {
  const res = (await window.api.gitNotesShow({
    rootPath: params.rootPath,
    refName: params.refName,
  })) as GitInvokeResponse<NotesShowOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to read note.')
  }
  return res.data.stdout
}
