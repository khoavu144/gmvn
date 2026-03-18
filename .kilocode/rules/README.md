# AI Workspace Operating System (Vibe Coding)

This package provides a structured operating environment for teams that use AI coding agents
inside IDEs such as Cursor, Windsurf, or VS Code with AI extensions.

Purpose:
- Prevent AI agents from damaging architecture
- Keep code changes reviewable
- Provide shared system context for agents
- Standardize development workflow

Core Files:
1. workspace_rules.md — Hard governance rules for AI agents
2. ai_context.md — System context AI should understand before coding
3. architecture_map.md — High‑level architecture map
4. coding_standards.md — Code conventions and patterns
5. agent_tasks.md — How tasks are assigned to AI agents
6. review_protocol.md — Human review protocol for AI-generated code

Recommended repo layout:

repo/
 ├─ app/
 ├─ components/
 ├─ services/
 ├─ utils/
 ├─ tests/
 ├─ core/
 ├─ infra/
 ├─ database/
 ├─ docs/
 ├─ workspace_rules.md
 ├─ ai_context.md
 ├─ architecture_map.md
 ├─ coding_standards.md
 ├─ agent_tasks.md
 └─ review_protocol.md

Usage:
Place these files at the root of your repository so AI agents automatically read them.