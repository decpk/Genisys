export interface ExplorerTemplate {
  id: string
  label: string
  filename: string
  content: string
}

const NODE_GITIGNORE = `node_modules/
dist/
build/
coverage/
.env
.env.local
.DS_Store
*.log
`

const PYTHON_GITIGNORE = `__pycache__/
*.py[cod]
*.egg-info/
.venv/
venv/
.pytest_cache/
.mypy_cache/
.coverage
dist/
build/
.DS_Store
`

const RUST_GITIGNORE = `/target
**/*.rs.bk
Cargo.lock
.DS_Store
`

const README_MD = `# Project Name

Brief description of the project.

## Getting Started

Installation, setup, and usage instructions.

## License

TBD
`

const PACKAGE_JSON = `{
  "name": "package-name",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "start": "node index.js"
  }
}
`

const EDITORCONFIG = `root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
`

export const EXPLORER_TEMPLATES: ExplorerTemplate[] = [
  { id: 'gitignore-node', label: '.gitignore (Node)', filename: '.gitignore', content: NODE_GITIGNORE },
  { id: 'gitignore-python', label: '.gitignore (Python)', filename: '.gitignore', content: PYTHON_GITIGNORE },
  { id: 'gitignore-rust', label: '.gitignore (Rust)', filename: '.gitignore', content: RUST_GITIGNORE },
  { id: 'readme-md', label: 'README.md', filename: 'README.md', content: README_MD },
  { id: 'package-json', label: 'package.json', filename: 'package.json', content: PACKAGE_JSON },
  { id: 'editorconfig', label: '.editorconfig', filename: '.editorconfig', content: EDITORCONFIG }
]
