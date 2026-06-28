import type { GitInvokeResponse } from '../git.types'

interface ConfigGetOutput {
  stdout: string
}

export type GitConfigScope = 'local' | 'global' | 'system'

export async function invokeGitConfigGet(params: {
  rootPath: string
  key: string
  scope?: GitConfigScope
}): Promise<string> {
  const res = (await window.api.gitConfigGet({
    rootPath: params.rootPath,
    key: params.key,
    scope: params.scope,
  })) as GitInvokeResponse<ConfigGetOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'git config get failed.')
  }
  return res.data.stdout
}
