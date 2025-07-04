## Build, Lint, and Test Commands

- **Build & Run:**
  - `npm run ios`
  - `npm run android`
- **Lint:**
  - `npm run lint` (You'll need to add a lint script to `package.json`)
- **Test:**
  - `npm test`
  - To run a single test file: `npm test -- <file_path>`

## Code Style Guidelines

- **Imports:**
  - Use absolute paths with the `@/` prefix for imports within the `src` directory.
- **Formatting:**
  - Follow standard Prettier/ESLint rules for TypeScript/React.
- **Types:**
  - Use TypeScript for all new code.
- **Naming Conventions:**
  - Components: `PascalCase`
  - Variables/Functions: `camelCase`
- **Error Handling:**
  - Use `try...catch` blocks for asynchronous operations and API calls.
