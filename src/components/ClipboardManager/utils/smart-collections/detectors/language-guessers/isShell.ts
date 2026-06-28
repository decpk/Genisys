const SHEBANG = /^#!/
const SHELL_PROMPT = /^\s*[$#]\s/m
const SHELL_COMMANDS = /^\s*(sudo|apt|apt-get|brew|npm|pnpm|yarn|git|cd|ls|cat|echo|curl|wget|chmod|mkdir|rm|cp|mv|grep|find|ssh|docker|kubectl)\s/m

export function isShell(text: string): boolean {
  return SHEBANG.test(text) || SHELL_PROMPT.test(text) || SHELL_COMMANDS.test(text)
}
