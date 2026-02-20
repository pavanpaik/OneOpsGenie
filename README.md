# ops-genie

A TypeScript-based npm CLI that manages a local ops workspace and delegates prompts to your locally installed Claude CLI.

## Overview

`ops-genie` maintains a persistent workspace at `~/.ops-genie` where it stores configuration, a customizable assistant persona, and prompt history. Every prompt you send is routed through the local `claude -p` binary with your persona's system prompt automatically injected — giving you a consistent, opinionated assistant that remembers its role across sessions.

## Requirements

- Node.js ≥ 18
- [Claude CLI](https://github.com/anthropics/claude-code) installed and on your `PATH` (`npm install -g @anthropic-ai/claude-code`)

## Installation

```bash
# From the repo root
npm install
npm run build
npm link          # makes `ops-genie` available globally
```

## Quick Start

```bash
# 1. Initialize the workspace
ops-genie init

# 2. Ask something
ops-genie prompt "How do I rotate AWS credentials safely?"

# 3. Check status
ops-genie status
```

## Commands

### `init`

Creates the workspace directory structure at `~/.ops-genie`.

```bash
ops-genie init
```

Running `init` more than once is safe — existing config and persona are preserved.

**Workspace layout:**
```
~/.ops-genie/
├── config.json    # workspace settings (version, claudePath, defaultModel)
├── persona.json   # assistant persona definition
├── history/       # one JSON file per prompt (timestamped)
└── logs/
```

---

### `prompt`

Sends a message to Claude via the local `claude -p` binary, with the active persona's system prompt injected automatically. Output is streamed to the terminal and saved to history.

```bash
ops-genie prompt "<message>" [options]
```

**Options:**

| Flag | Description |
|---|---|
| `-m, --model <model>` | Override the Claude model |
| `--no-history` | Do not record this prompt in history |
| `-v, --verbose` | Print the full `claude` invocation for debugging |

**Examples:**

```bash
ops-genie prompt "Write a bash script to back up /etc"
ops-genie prompt "Explain Kubernetes readiness vs liveness probes" --no-history
ops-genie prompt "Summarize this week's on-call issues" -v
```

---

### `persona`

View or update the assistant persona. The persona's `systemPrompt` field is prepended to every `claude -p` call, giving Claude its identity and behavioral context.

```bash
ops-genie persona              # same as `persona show`
ops-genie persona show
ops-genie persona set [options]
```

**`set` options:**

| Flag | Description |
|---|---|
| `--name <name>` | Persona display name |
| `--role <role>` | Role/title (e.g. "SRE Assistant") |
| `--description <text>` | Short description |
| `--system-prompt <text>` | Full system prompt injected with every request |
| `--traits <list>` | Comma-separated traits (e.g. `"terse, opinionated"`) |

**Example — create a security-focused persona:**

```bash
ops-genie persona set \
  --name "SecOps" \
  --role "Security Operations Assistant" \
  --system-prompt "You are SecOps, a security-focused assistant. You give concise, actionable advice on threat detection, hardening, and incident response. Always mention relevant CVEs or tools when applicable." \
  --traits "security-focused, concise, actionable"
```

**Default persona:**
```
Name:   OpsGenie
Role:   Operations Assistant
Traits: technical, concise, practical, reliable
```

---

### `history`

Display recent prompt history stored in `~/.ops-genie/history/`.

```bash
ops-genie history              # last 10 entries
ops-genie history -n 25        # last 25 entries
```

---

### `status`

Show a summary of the workspace: initialization state, config, active persona, and history count.

```bash
ops-genie status
```

## How Prompts Work

```
ops-genie prompt "your question"
        │
        ▼
 Load persona.systemPrompt from ~/.ops-genie/persona.json
        │
        ▼
 spawn: claude -p "<message>" --system-prompt "<systemPrompt>"
        │
        ├─ stdout streamed live to terminal
        └─ full response saved to ~/.ops-genie/history/<timestamp>.json
```

The `claude` binary path and default model are configurable in `~/.ops-genie/config.json`.

## Configuration (`~/.ops-genie/config.json`)

```json
{
  "version": "0.1.0",
  "createdAt": "...",
  "updatedAt": "...",
  "defaultModel": "claude",
  "claudePath": "claude"
}
```

Edit this file directly to point `claudePath` at a specific binary or set a different default model.

## Development

```bash
npm install
npm run build        # compile TypeScript → dist/
npm run dev          # run via ts-node (no build step)
```

**Project structure:**
```
src/
├── index.ts              # CLI entry point (commander)
├── workspace.ts          # workspace init, config read/write, history
├── persona.ts            # persona read/write/defaults
└── commands/
    ├── init.ts
    ├── prompt.ts
    ├── persona.ts
    ├── history.ts
    └── status.ts
```

## License

MIT
