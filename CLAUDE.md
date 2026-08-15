@AGENTS.md

<!--
Claude Code reads CLAUDE.md, not AGENTS.md. The line above is a memory import:
it pulls AGENTS.md into context at session start. It MUST stay on line 1, at
column 0, unindented and without backticks — quoting or indenting it turns it
into literal text and every project rule is silently lost. Do not add content
above it.

This is deliberately an import and NOT `ln -s AGENTS.md CLAUDE.md`: git stores
a symlink as a 9-byte blob, and a Windows clone (core.symlinks=false, the
Git-for-Windows default) materializes it as a regular file containing the text
"AGENTS.md". Claude Code then loads those 9 bytes as the complete ruleset, with
no error and no warning.

Authoring rule for both files: the import parser skips Markdown code spans and
fenced blocks, but treats a bare @token elsewhere as a live file import. This
repo's FSD path alias IS `@/`, so always keep @-prefixed tokens inside
backticks — `@/entities/pet/api/pet.options`, `@generated/*`,
`@hey-api/openapi-ts`, `shadcn@latest`. A bare @package.json in prose would
silently pull that whole file into context.

Project rules go in AGENTS.md, which Codex, Cursor, Copilot, Gemini CLI, Zed
and other agents read. This file holds only what is specific to Claude Code.

HTML comments are stripped before injection, so this block costs no context.
-->

## Claude Code specifics

### MCP servers (`.mcp.json`)

- **`next-devtools`** — proxy to the Next.js dev-server MCP. Next 16 also
  serves that endpoint directly at `/_next/mcp`, but the proxy is wired
  instead: it discovers the dev server's real port instead of assuming 3000,
  and it starts even with no dev server running, where a direct http entry
  would show as a failed server for everyone who clones the repo.
  `nextjs_docs` works offline — Next 16 ships its docs in
  `node_modules/next/dist/docs/`, matching the installed version exactly.
  Runtime tools (routes, compilation issues, dev-server errors, single-route
  compilation) sit behind `nextjs_call` and need `pnpm dev`.
- **`shadcn`** — `shadcn mcp` from the CLI already in devDependencies, run via
  `pnpm exec` so it stays on the lockfile version. Resolves components against
  this project's `components.json` (base-nova / Base UI), so it won't suggest
  v2-era Radix imports. Do NOT run `shadcn mcp init` — it overwrites
  `.mcp.json` wholesale.
- **`context7`** — hosted docs retrieval, no API key. Covers the libraries
  that have no MCP server of their own (TanStack Query, Tailwind, Base UI,
  Biome, Vitest, Zod, Hey API, steiger).

No MCP server exists for Biome, Zod, steiger, Hey API or TanStack Query —
`pnpm verify` is the interface for those.

### Permissions and skills

- `.claude/settings.json` denies reading `.env*` secrets, pre-approves the
  read-only checks, and always asks before commands that install or execute
  fetched code (`pnpm add`, `pnpm install`, `pnpm dlx`, `pnpx`). Allow rules
  apply only after the workspace-trust dialog is accepted.
- `.claude/skills/fsd-slice/` scaffolds an FSD slice. It declares no
  `allowed-tools`, so it grants no tool access of its own.
