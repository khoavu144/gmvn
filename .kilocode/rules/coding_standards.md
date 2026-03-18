# Coding Standards

## Naming

Functions:
camelCase

Classes:
PascalCase

Constants:
UPPER_CASE

## File Naming

service files:
userService.ts

components:
UserProfile.tsx

## Code Style

Prefer:
- small functions
- explicit logic
- descriptive names

Avoid:
- deep nesting
- hidden side effects
- overly generic utilities

## Logging

Use structured logging:

logger.info("User created", { userId })