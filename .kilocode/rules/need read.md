# workspace_rules.md
Language: Vietnamese
Scope: Applies to all AI coding agents in this repository

## Guidelines

1. Architecture Integrity

AI agents must respect the existing architecture.

Rules:

Detect project architecture before writing code

Follow existing design patterns

Do NOT introduce new architectural layers

Examples of forbidden actions:

Adding Redux to a project using Zustand
Switching ORM
Introducing a new framework

If architecture change is required:

Agent must propose change before implementation.
2. Minimal Modification Principle

Agents must only modify code strictly related to the task.

Allowed:

Modify targeted files
Add supporting functions

Forbidden:

Large refactor without request
Renaming directories
Moving modules
Reformatting entire files
3. Directory Access Control

Agents may only modify whitelisted directories.

Example:

Editable

/app
/components
/services
/utils

Restricted

/core
/infra
/database
/config

If restricted code must be modified:

Agent must request approval.
4. Code Style Consistency

Agents must match the project's existing code style.

Follow:

naming conventions
file naming patterns
lint rules
formatting style

Example:

Correct

getUserProfile()

Incorrect

get_user_profile()
5. Dependency Governance

Agents must not add new dependencies automatically.

Before installing libraries:

Check if functionality already exists in project

If new dependency is needed:

Agent must propose:

library name
reason
impact
6. Security Safeguards

Agents must never expose secrets.

Forbidden:

hardcoding API keys
logging tokens
committing .env

Sensitive data must always be:

environment variables
secure config
7. Logging Standards

Agents must use the project's logging system.

Allowed:

logger.info()
logger.warn()
logger.error()

Forbidden:

console.log() in production code
8. Error Handling

All operations must handle errors properly.

Forbidden:

try {} catch {}

Required:

catch
log error
return structured response

Example:

{
  success: false,
  error: "USER_NOT_FOUND"
}
9. Test Coverage

If business logic is added or modified:

Agent must add tests.

Required:

unit tests
service tests
edge case tests

Tests must be located in:

/tests
10. API Contract Safety

If an API is modified:

Agent must update:

DTO
validation
API documentation
types/interfaces

Never change API behavior silently.

11. Database Safety

Agents must never modify database schema directly.

Required workflow:

Create migration
Update schema definitions
Update models

Forbidden:

editing production schema manually
12. File Size Limits

Large files must be avoided.

Rule:

400 lines max per file

If exceeded:

split into modules
13. Performance Awareness

Agents must avoid performance anti-patterns.

Examples:

N+1 queries
unbounded loops
blocking operations
large synchronous processing

Prefer:

batch queries
pagination
async processing
14. Deterministic Logic

Business logic must be deterministic.

Avoid:

Math.random()
Date.now()

Unless injected through:

config
service layer
15. Documentation Requirement

New modules must include documentation.

Required:

purpose
usage
dependencies
16. Commit Hygiene

Commits must follow conventional format.

Examples:

feat(auth): add refresh token logic
fix(api): resolve user lookup bug
refactor(user): simplify validation flow
test(auth): add login edge cases
17. Large Diff Protection

Agents must avoid huge commits.

Guideline:

< 20 files changed per task

If larger change is required:

Split into:

multiple commits
18. Review Readiness

Agent output must be human-review friendly.

Avoid:

AI generated boilerplate everywhere
unnecessary comments
overengineering

Prefer:

clean and minimal code
19. Task Confirmation

Before major operations, agents must confirm.

Examples:

refactor module
change API structure
modify database schema
introduce new dependency
20. Golden Rule
AI writes code.
Humans own architecture.

Agents must never redesign the system autonomously.

Recommended Workspace Structure
repo
 ├─ app
 ├─ components
 ├─ services
 ├─ utils
 ├─ tests
 ├─ core
 ├─ infra
 ├─ database
 ├─ docs
 └─ workspace_rules.md
Extra (Highly Recommended)
