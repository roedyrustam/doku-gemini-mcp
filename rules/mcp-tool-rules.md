# MCP Payment Tool Design Rules

## 1. Schema Definition & Validation
- Every MCP Tool definition MUST include explicit JSON Schema types, clear parameter descriptions, and required fields.
- Monetary amount inputs MUST be specified in IDR integer format without decimal points unless specified by bank channel rules.

## 2. Error Handling & LLM Formatting
- MCP Tools MUST catch network and API authorization errors gracefully.
- Do NOT leak raw node process stack traces to the LLM agent context. Return structured, user-friendly JSON output explaining the error code and suggestion.

## 3. Sandbox Defaulting
- DOKU MCP Servers MUST default to `DOKU_IS_PRODUCTION=false` unless explicitly configured for production deployment.
- Provide log notices whenever running in sandbox mode to avoid accidental live financial transactions.
