import type { GitInvokeResponse } from '../git.types'

interface NotesAddOutput {
  stdout: string
}

export async function invokeGitNotesAdd(params: {
  rootPath: string
  message: string
  refName?: string
}): Promise<string> {
  const res = (await window.api.gitNotesAdd({
    rootPath: params.rootPath,
    message: params.message,
    refName: params.refName,
  })) as GitInvokeResponse<NotesAddOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to add note.')
  }
  return res.data.stdout
}
