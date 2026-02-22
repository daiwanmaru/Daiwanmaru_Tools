---
description: How to troubleshoot and fix common technical issues in Daiwanmaru
---
When debugging or troubleshooting, follow this checklist to avoid common pitfalls:

### 1. TypeScript Strictness
- **Implicit Any**: Never declare empty arrays without a type.
  - Fix: Use `let items: ItemType[] = [];`.
- **Prisma Types**: Always cast Prisma results if the automated type inference is lost across package boundaries.

### 2. Data Flow
- **JSON Fields**: Do NOT use `JSON.parse()` on Prisma `Json` fields; they are already objects.
- **Server vs Client**: Prefer Server Components for data fetching to avoid loading flickers and redundant API calls.

### 3. Build Process
- If Prisma fields are missing, run `pnpm turbo build --filter=@daiwanmaru/core`.
- Ensure `.env.local` contains valid database strings for the correct environment.

### 4. Style Guide
- Check for overlapping UI in the Navbar using `lg` and `md` responsive breakpoints.
- Ensure all new headings use the `serif` class.

---
// turbo-all
// Reference docs/agent/debugger-checklist.md for historical bug logs.
