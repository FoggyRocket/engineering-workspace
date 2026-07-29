# Engineering Workspace

A centralized platform for shared engineering standards, AI-powered review workflows, and developer tooling.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all tools
pnpm build

# Run an AI code review
npx devx review --base main

# Run security review
npx devx security --base main

# Run analytics review
npx devx analytics --base main

# Run full PR check
npx devx pr-check --base main
```

## Structure

| Directory | Purpose |
|---|---|
| `docs/prompts/` | AI prompt templates for each review type |
| `docs/standards/` | Engineering standards documents |
| `docs/workflows/` | Process and workflow documentation |
| `docs/checklists/` | Pre-merge and deployment checklists |
| `tools/cli/` | `devx` CLI — the main developer-facing tool |
| `tools/ai-review/` | Shared AI review engine |
| `configs/` | Shared ESLint, Prettier, TypeScript configs |
| `projects/` | Managed internal projects (monorepo members) |

## CLI Commands

| Command | Description |
|---|---|
| `devx review` | AI-powered general code review |
| `devx security` | Security-focused diff analysis |
| `devx analytics` | Analytics instrumentation review |
| `devx pr-check` | Full pre-PR comprehensive review |

## Adding a New Project

```bash
# Create project folder
mkdir projects/my-new-app
cd projects/my-new-app

# Extend shared configs
echo '{ "extends": "../../configs/typescript/nextjs.json" }' > tsconfig.json
echo 'module.exports = require("../../configs/eslint/base.js")' > .eslintrc.js
```

## Adding a New Prompt

Create a file in `docs/prompts/` following the naming convention:
- `{type}.md` — generic prompt
- `{type}-{projectType}.md` — project-type-specific override

## Contributing

See [docs/workflows/pr-review.md](docs/workflows/pr-review.md) for the PR process.
