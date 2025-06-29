---
trigger: always_on
---

Project: Klare-Methode-App
Goal: Production deployment in Autumn 2025.

Guiding Principles:
Production First: Every change must prioritize stability, performance, and code quality suitable for a production environment. Non-essential or experimental features should be avoided as the deadline approaches.
TypeScript is Mandatory: All new code must be written in TypeScript. When modifying existing JavaScript files, they should be migrated to TypeScript to ensure type safety across the application.
Follow Existing Architecture: Adhere to the established project structure. Place new code in the appropriate directories (components, screens, services, store, etc.). All Supabase interactions must be handled within the src/services layer.
State Management with Zustand: Utilize the existing Zustand stores for state management. Access state via selectors to optimize performance and prevent unnecessary re-renders. Keep stores modular and focused on a single domain.
Test Everything: All new features and bug fixes must be accompanied by tests. This includes unit tests with Jest for logic and component tests with React Native Testing Library for UI. E2E flows in Maestro should be updated for major features.
German First: The primary language for UI text and code comments is German. All user-facing strings must be added to the i18n files located in src/translations.
Dependency Management: Before adding new dependencies, evaluate their impact on bundle size and maintenance overhead. Keep existing dependencies up-to-date, but test thoroughly after any upgrades.
Clean Code Practices: Write clean, readable, and self-documenting code. Use the configured linter and formatter to maintain a consistent code style. Remove all console.log statements and debug utilities before creating a pull request for the main branch.