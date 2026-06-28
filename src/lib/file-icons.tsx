import {
  SiTypescript,
  SiJavascript,
  SiReact,
  SiPython,
  SiHtml5,
  SiCss,
  SiJson,
  SiMarkdown,
  SiDocker,
  SiGit,
  SiYaml,
  SiRust,
  SiGo,
  SiOpenjdk,
  SiC,
  SiCplusplus,
  SiSwift,
  SiKotlin,
  SiDart,
  SiLua,
  SiRuby,
  SiPhp,
  SiGraphql,
  SiVuedotjs,
  SiSvelte,
  SiAstro,
  SiPrisma,
  SiWebassembly,
  SiTerraform,
  SiScala,
  SiElixir,
  SiClojure,
  SiR,
  SiZig,
  SiToml,
  SiPerl,
  SiHaskell,
  SiGradle,
  SiDotnet,
  SiVite,
  SiEslint,
  SiTailwindcss,
  SiPostcss,
  SiWebpack,
  SiBabel,
  SiJest,
  SiVitest,
  SiCypress,
  SiStorybook
} from 'react-icons/si'
import { SiNpm, SiNodedotjs, SiPrettier } from 'react-icons/si'
import { VscFile, VscTerminalBash, VscBeaker, VscGear, VscLock, VscDatabase, VscLaw, VscFilePdf, VscFileZip, VscFileBinary } from 'react-icons/vsc'
import { FiImage, FiCode, FiFileText, FiVideo, FiMusic, FiBook, FiType } from 'react-icons/fi'
import { MdFolder, MdFolderOpen } from 'react-icons/md'
import type { ComponentType } from 'react'

interface IconEntry {
  icon: ComponentType<{ size?: number; className?: string }>
  className: string
}

const SPECIAL_FILE_MAP = new Map<string, IconEntry>([
  ['dockerfile', { icon: SiDocker, className: 'text-info' }],
  ['docker-compose.yml', { icon: SiDocker, className: 'text-info' }],
  ['docker-compose.yaml', { icon: SiDocker, className: 'text-info' }],
  ['package.json', { icon: SiNpm, className: 'text-destructive' }],
  ['package-lock.json', { icon: SiNpm, className: 'text-destructive' }],
  ['tsconfig.json', { icon: SiTypescript, className: 'text-info' }],
  ['tsconfig.app.json', { icon: SiTypescript, className: 'text-info' }],
  ['tsconfig.node.json', { icon: SiTypescript, className: 'text-info' }],
  ['tsconfig.build.json', { icon: SiTypescript, className: 'text-info' }],
  ['.gitignore', { icon: SiGit, className: 'text-destructive' }],
  ['.gitattributes', { icon: SiGit, className: 'text-destructive' }],
  ['.gitmodules', { icon: SiGit, className: 'text-destructive' }],
  ['.npmrc', { icon: SiNpm, className: 'text-destructive' }],
  ['.nvmrc', { icon: SiNodedotjs, className: 'text-success' }],
  ['.prettierrc', { icon: SiPrettier, className: 'text-info' }],
  ['.prettierrc.json', { icon: SiPrettier, className: 'text-info' }],
  ['.prettierrc.yml', { icon: SiPrettier, className: 'text-info' }],
  ['.prettierrc.yaml', { icon: SiPrettier, className: 'text-info' }],
  ['.prettierrc.js', { icon: SiPrettier, className: 'text-info' }],
  ['.prettierrc.cjs', { icon: SiPrettier, className: 'text-info' }],
  ['.prettierrc.mjs', { icon: SiPrettier, className: 'text-info' }],
  ['.prettierignore', { icon: SiPrettier, className: 'text-info' }],
  ['.browserslistrc', { icon: VscGear, className: 'text-muted-foreground' }],
  ['.editorconfig', { icon: VscGear, className: 'text-muted-foreground' }],
  ['.env', { icon: VscLock, className: 'text-warning' }],
  ['.env.local', { icon: VscLock, className: 'text-warning' }],
  ['.env.development', { icon: VscLock, className: 'text-warning' }],
  ['.env.production', { icon: VscLock, className: 'text-warning' }],
  ['cargo.toml', { icon: SiRust, className: 'text-warning' }],
  ['cargo.lock', { icon: SiRust, className: 'text-muted-foreground' }],
  ['go.mod', { icon: SiGo, className: 'text-info' }],
  ['go.sum', { icon: SiGo, className: 'text-muted-foreground' }],
  ['gemfile', { icon: SiRuby, className: 'text-destructive' }],
  ['gemfile.lock', { icon: SiRuby, className: 'text-muted-foreground' }],
  ['makefile', { icon: VscTerminalBash, className: 'text-warning' }],
  ['license', { icon: VscLaw, className: 'text-warning' }],
  ['license.md', { icon: VscLaw, className: 'text-warning' }],
  ['license.txt', { icon: VscLaw, className: 'text-warning' }],
  ['build.gradle', { icon: SiGradle, className: 'text-info' }],
  ['build.gradle.kts', { icon: SiGradle, className: 'text-info' }],
  ['settings.gradle', { icon: SiGradle, className: 'text-info' }],
  ['requirements.txt', { icon: SiPython, className: 'text-info' }],
  ['pipfile', { icon: SiPython, className: 'text-info' }],
  ['pyproject.toml', { icon: SiPython, className: 'text-info' }],
  ['composer.json', { icon: SiPhp, className: 'text-info' }],
  ['pubspec.yaml', { icon: SiDart, className: 'text-info' }],
  ['vite.config.ts', { icon: SiVite, className: 'text-info' }],
  ['vite.config.js', { icon: SiVite, className: 'text-info' }],
  ['vite.config.mts', { icon: SiVite, className: 'text-info' }],
  ['vitest.config.ts', { icon: SiVitest, className: 'text-success' }],
  ['vitest.config.js', { icon: SiVitest, className: 'text-success' }],
  ['eslint.config.js', { icon: SiEslint, className: 'text-info' }],
  ['eslint.config.mjs', { icon: SiEslint, className: 'text-info' }],
  ['eslint.config.cjs', { icon: SiEslint, className: 'text-info' }],
  ['eslint.config.ts', { icon: SiEslint, className: 'text-info' }],
  ['.eslintrc', { icon: SiEslint, className: 'text-info' }],
  ['.eslintrc.js', { icon: SiEslint, className: 'text-info' }],
  ['.eslintrc.json', { icon: SiEslint, className: 'text-info' }],
  ['.eslintrc.yml', { icon: SiEslint, className: 'text-info' }],
  ['.eslintignore', { icon: SiEslint, className: 'text-info' }],
  ['tailwind.config.js', { icon: SiTailwindcss, className: 'text-info' }],
  ['tailwind.config.ts', { icon: SiTailwindcss, className: 'text-info' }],
  ['tailwind.config.cjs', { icon: SiTailwindcss, className: 'text-info' }],
  ['postcss.config.js', { icon: SiPostcss, className: 'text-destructive' }],
  ['postcss.config.cjs', { icon: SiPostcss, className: 'text-destructive' }],
  ['postcss.config.mjs', { icon: SiPostcss, className: 'text-destructive' }],
  ['webpack.config.js', { icon: SiWebpack, className: 'text-info' }],
  ['webpack.config.ts', { icon: SiWebpack, className: 'text-info' }],
  ['babel.config.js', { icon: SiBabel, className: 'text-warning' }],
  ['babel.config.json', { icon: SiBabel, className: 'text-warning' }],
  ['.babelrc', { icon: SiBabel, className: 'text-warning' }],
  ['jest.config.js', { icon: SiJest, className: 'text-destructive' }],
  ['jest.config.ts', { icon: SiJest, className: 'text-destructive' }],
  ['cypress.config.js', { icon: SiCypress, className: 'text-success' }],
  ['cypress.config.ts', { icon: SiCypress, className: 'text-success' }],
  ['.storybook', { icon: SiStorybook, className: 'text-destructive' }]
])

const COMPOUND_EXT_MAP = new Map<string, IconEntry>([
  ['.test.ts', { icon: VscBeaker, className: 'text-success' }],
  ['.test.tsx', { icon: VscBeaker, className: 'text-success' }],
  ['.spec.ts', { icon: VscBeaker, className: 'text-success' }],
  ['.spec.tsx', { icon: VscBeaker, className: 'text-success' }],
  ['.config.ts', { icon: VscGear, className: 'text-muted-foreground' }],
  ['.config.js', { icon: VscGear, className: 'text-muted-foreground' }],
  ['.config.mjs', { icon: VscGear, className: 'text-muted-foreground' }]
])

const EXTENSION_ICON_MAP = new Map<string, IconEntry>([
  ['.tsx', { icon: SiReact, className: 'text-info' }],
  ['.jsx', { icon: SiReact, className: 'text-info' }],
  ['.ts', { icon: SiTypescript, className: 'text-info' }],
  ['.js', { icon: SiJavascript, className: 'text-warning' }],
  ['.mjs', { icon: SiJavascript, className: 'text-warning' }],
  ['.cjs', { icon: SiJavascript, className: 'text-warning' }],
  ['.json', { icon: SiJson, className: 'text-warning' }],
  ['.md', { icon: SiMarkdown, className: 'text-foreground' }],
  ['.mdx', { icon: SiMarkdown, className: 'text-foreground' }],
  ['.css', { icon: SiCss, className: 'text-info' }],
  ['.scss', { icon: SiCss, className: 'text-info' }],
  ['.less', { icon: SiCss, className: 'text-info' }],
  ['.html', { icon: SiHtml5, className: 'text-warning' }],
  ['.py', { icon: SiPython, className: 'text-info' }],
  ['.yml', { icon: SiYaml, className: 'text-muted-foreground' }],
  ['.yaml', { icon: SiYaml, className: 'text-muted-foreground' }],
  ['.svg', { icon: FiImage, className: 'text-success' }],
  ['.png', { icon: FiImage, className: 'text-success' }],
  ['.jpg', { icon: FiImage, className: 'text-success' }],
  ['.jpeg', { icon: FiImage, className: 'text-success' }],
  ['.gif', { icon: FiImage, className: 'text-success' }],
  ['.ico', { icon: FiImage, className: 'text-success' }],
  ['.webp', { icon: FiImage, className: 'text-success' }],
  ['.sh', { icon: VscTerminalBash, className: 'text-success' }],
  ['.bash', { icon: VscTerminalBash, className: 'text-success' }],
  ['.zsh', { icon: VscTerminalBash, className: 'text-success' }],
  ['.xml', { icon: FiCode, className: 'text-warning' }],
  ['.lock', { icon: VscLock, className: 'text-muted-foreground' }],
  ['.jsonc', { icon: SiJson, className: 'text-warning' }],
  ['.json5', { icon: SiJson, className: 'text-warning' }],
  ['.rs', { icon: SiRust, className: 'text-warning' }],
  ['.go', { icon: SiGo, className: 'text-info' }],
  ['.java', { icon: SiOpenjdk, className: 'text-warning' }],
  ['.c', { icon: SiC, className: 'text-info' }],
  ['.cpp', { icon: SiCplusplus, className: 'text-info' }],
  ['.cc', { icon: SiCplusplus, className: 'text-info' }],
  ['.cxx', { icon: SiCplusplus, className: 'text-info' }],
  ['.h', { icon: SiC, className: 'text-info' }],
  ['.hpp', { icon: SiCplusplus, className: 'text-info' }],
  ['.swift', { icon: SiSwift, className: 'text-warning' }],
  ['.kt', { icon: SiKotlin, className: 'text-info' }],
  ['.kts', { icon: SiKotlin, className: 'text-info' }],
  ['.dart', { icon: SiDart, className: 'text-info' }],
  ['.lua', { icon: SiLua, className: 'text-info' }],
  ['.rb', { icon: SiRuby, className: 'text-destructive' }],
  ['.php', { icon: SiPhp, className: 'text-info' }],
  ['.sql', { icon: VscDatabase, className: 'text-warning' }],
  ['.graphql', { icon: SiGraphql, className: 'text-destructive' }],
  ['.gql', { icon: SiGraphql, className: 'text-destructive' }],
  ['.toml', { icon: SiToml, className: 'text-muted-foreground' }],
  ['.ini', { icon: VscGear, className: 'text-muted-foreground' }],
  ['.cfg', { icon: VscGear, className: 'text-muted-foreground' }],
  ['.proto', { icon: FiCode, className: 'text-info' }],
  ['.vue', { icon: SiVuedotjs, className: 'text-success' }],
  ['.svelte', { icon: SiSvelte, className: 'text-destructive' }],
  ['.astro', { icon: SiAstro, className: 'text-warning' }],
  ['.prisma', { icon: SiPrisma, className: 'text-foreground' }],
  ['.wasm', { icon: SiWebassembly, className: 'text-info' }],
  ['.tf', { icon: SiTerraform, className: 'text-info' }],
  ['.hcl', { icon: SiTerraform, className: 'text-info' }],
  ['.scala', { icon: SiScala, className: 'text-destructive' }],
  ['.ex', { icon: SiElixir, className: 'text-info' }],
  ['.exs', { icon: SiElixir, className: 'text-info' }],
  ['.clj', { icon: SiClojure, className: 'text-success' }],
  ['.cljs', { icon: SiClojure, className: 'text-success' }],
  ['.r', { icon: SiR, className: 'text-info' }],
  ['.zig', { icon: SiZig, className: 'text-warning' }],
  ['.pl', { icon: SiPerl, className: 'text-info' }],
  ['.pm', { icon: SiPerl, className: 'text-info' }],
  ['.hs', { icon: SiHaskell, className: 'text-info' }],
  ['.cs', { icon: SiDotnet, className: 'text-info' }],
  ['.fs', { icon: SiDotnet, className: 'text-info' }],
  ['.gradle', { icon: SiGradle, className: 'text-info' }],
  // Documents
  ['.pdf', { icon: VscFilePdf, className: 'text-destructive' }],
  ['.doc', { icon: FiFileText, className: 'text-info' }],
  ['.docx', { icon: FiFileText, className: 'text-info' }],
  ['.odt', { icon: FiFileText, className: 'text-info' }],
  ['.rtf', { icon: FiFileText, className: 'text-info' }],
  ['.txt', { icon: FiFileText, className: 'text-muted-foreground' }],
  ['.log', { icon: FiFileText, className: 'text-muted-foreground' }],
  ['.csv', { icon: FiFileText, className: 'text-success' }],
  ['.tsv', { icon: FiFileText, className: 'text-success' }],
  // Presentations & Spreadsheets
  ['.ppt', { icon: FiFileText, className: 'text-warning' }],
  ['.pptx', { icon: FiFileText, className: 'text-warning' }],
  ['.xls', { icon: FiFileText, className: 'text-success' }],
  ['.xlsx', { icon: FiFileText, className: 'text-success' }],
  ['.ods', { icon: FiFileText, className: 'text-success' }],
  // Archives
  ['.zip', { icon: VscFileZip, className: 'text-warning' }],
  ['.tar', { icon: VscFileZip, className: 'text-warning' }],
  ['.gz', { icon: VscFileZip, className: 'text-warning' }],
  ['.bz2', { icon: VscFileZip, className: 'text-warning' }],
  ['.xz', { icon: VscFileZip, className: 'text-warning' }],
  ['.7z', { icon: VscFileZip, className: 'text-warning' }],
  ['.rar', { icon: VscFileZip, className: 'text-warning' }],
  // Binaries & Installers
  ['.dmg', { icon: VscFileBinary, className: 'text-muted-foreground' }],
  ['.iso', { icon: VscFileBinary, className: 'text-muted-foreground' }],
  ['.exe', { icon: VscFileBinary, className: 'text-muted-foreground' }],
  ['.msi', { icon: VscFileBinary, className: 'text-muted-foreground' }],
  ['.deb', { icon: VscFileBinary, className: 'text-muted-foreground' }],
  ['.rpm', { icon: VscFileBinary, className: 'text-muted-foreground' }],
  ['.app', { icon: VscFileBinary, className: 'text-muted-foreground' }],
  ['.bin', { icon: VscFileBinary, className: 'text-muted-foreground' }],
  // Video
  ['.mp4', { icon: FiVideo, className: 'text-info' }],
  ['.mov', { icon: FiVideo, className: 'text-info' }],
  ['.avi', { icon: FiVideo, className: 'text-info' }],
  ['.mkv', { icon: FiVideo, className: 'text-info' }],
  ['.webm', { icon: FiVideo, className: 'text-info' }],
  ['.flv', { icon: FiVideo, className: 'text-info' }],
  // Audio
  ['.mp3', { icon: FiMusic, className: 'text-info' }],
  ['.wav', { icon: FiMusic, className: 'text-info' }],
  ['.flac', { icon: FiMusic, className: 'text-info' }],
  ['.aac', { icon: FiMusic, className: 'text-info' }],
  ['.ogg', { icon: FiMusic, className: 'text-info' }],
  ['.m4a', { icon: FiMusic, className: 'text-info' }],
  // Fonts
  ['.ttf', { icon: FiType, className: 'text-muted-foreground' }],
  ['.otf', { icon: FiType, className: 'text-muted-foreground' }],
  ['.woff', { icon: FiType, className: 'text-muted-foreground' }],
  ['.woff2', { icon: FiType, className: 'text-muted-foreground' }],
  ['.eot', { icon: FiType, className: 'text-muted-foreground' }],
  // eBooks
  ['.epub', { icon: FiBook, className: 'text-warning' }]
])

// Module-level cache: getFileIcon is pure (same args → same element), so we cache
// the returned ReactElement to avoid re-creating JSX on every render.
// Bounded LRU (capped at ICON_CACHE_MAX) so projects with thousands of
// unique filenames don't grow this cache without limit.
const ICON_CACHE_MAX = 2000
const iconCache = new Map<string, React.ReactElement>()

export function getFileIcon(
  filename: string,
  isFolder: boolean,
  size: number = 16,
  isExpanded: boolean = false
): React.ReactElement {
  const cacheKey = `${filename}\0${isFolder}\0${size}\0${isExpanded}`
  const cached = iconCache.get(cacheKey)
  if (cached) {
    // Refresh recency: Map preserves insertion order, so deleting and
    // re-inserting moves this key to the most-recent position.
    iconCache.delete(cacheKey)
    iconCache.set(cacheKey, cached)
    return cached
  }

  const element = resolveFileIcon(filename, isFolder, size, isExpanded)
  if (iconCache.size >= ICON_CACHE_MAX) {
    // Evict the least-recently-used entry (oldest insertion).
    const oldestKey = iconCache.keys().next().value
    if (oldestKey !== undefined) iconCache.delete(oldestKey)
  }
  iconCache.set(cacheKey, element)
  return element
}

function resolveFileIcon(
  filename: string,
  isFolder: boolean,
  size: number,
  isExpanded: boolean
): React.ReactElement {
  if (isFolder) {
    const FolderIcon = isExpanded ? MdFolderOpen : MdFolder
    return <FolderIcon size={size} className="text-info" />
  }

  const lower = filename.toLowerCase()

  const special = SPECIAL_FILE_MAP.get(lower)
  if (special) {
    const Icon = special.icon
    return <Icon size={size} className={special.className} />
  }

  if (lower.startsWith('tsconfig')) {
    return <SiTypescript size={size} className="text-info" />
  }
  if (lower.startsWith('vite.config') || lower.startsWith('vitest.config')) {
    return <SiVite size={size} className="text-info" />
  }
  if (lower.startsWith('eslint')) {
    return <SiEslint size={size} className="text-info" />
  }

  for (const [ext, entry] of COMPOUND_EXT_MAP) {
    if (lower.endsWith(ext)) {
      const Icon = entry.icon
      return <Icon size={size} className={entry.className} />
    }
  }

  const dotIdx = lower.lastIndexOf('.')
  if (dotIdx !== -1) {
    const ext = lower.slice(dotIdx)
    const entry = EXTENSION_ICON_MAP.get(ext)
    if (entry) {
      const Icon = entry.icon
      return <Icon size={size} className={entry.className} />
    }
  }

  // RC config files (e.g. .commitlintrc, .lintstagedrc, .hygen)
  if (
    lower.endsWith('rc') ||
    lower.endsWith('rc.js') ||
    lower.endsWith('rc.json') ||
    lower.endsWith('rc.yml')
  ) {
    return <VscGear size={size} className="text-muted-foreground" />
  }

  // Ignore files (e.g. .eslintignore, .dockerignore)
  if (lower.endsWith('ignore')) {
    return <VscGear size={size} className="text-muted-foreground" />
  }

  return <VscFile size={size} className="text-muted-foreground" />
}
