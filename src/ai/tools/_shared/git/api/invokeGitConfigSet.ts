import type { GitInvokeResponse } from '../git.types'
import type { GitConfigScope } from './invokeGitConfigGet'

interface ConfigSetOutput {
  stdout: string
}

export async function invokeGitConfigSet(params: {
  rootPath: string
  key: string
  value: string
  scope?: GitConfigScope
}): Promise<string> {
  const res = (await window.api.gitConfigSet({
    rootPath: params.rootPath,
    key: params.key,
    value: params.value,
    scope: params.scope,
  })) as GitInvokeResponse<ConfigSetOutput>
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'git config set failed.')
  }
  return res.data.stdout
}
