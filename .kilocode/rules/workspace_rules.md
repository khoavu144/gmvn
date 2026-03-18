# Workspace Rules (AI Governance)

These rules apply to all AI coding agents working in this repository.

## 1. Architecture Integrity
Agents must follow the existing architecture.
Do not introduce new frameworks, architectural patterns, or system layers.

## 2. Minimal Modification
Modify only files necessary for the task.
Avoid refactoring unrelated modules.

## 3. Directory Permissions

Editable:
- /app
- /components
- /services
- /utils

Restricted:
- /core
- /infra
- /database

Changes in restricted directories require approval.

## 4. Dependency Policy
Agents must not install new libraries automatically.
If a dependency is required, propose it first.

## 5. Security
Never expose:
- API keys
- tokens
- secrets

Use environment variables.

## 6. Logging
Use the project logging system.
Avoid console.log in production.

## 7. Error Handling
All failures must return structured errors.

Example:
{
  "success": false,
  "error": "USER_NOT_FOUND"
}

## 8. Tests
If business logic changes, tests must be added.

## 9. File Size Limit
Maximum 400 lines per file.

## 10. Golden Rule
AI writes code.
Humans own architecture.