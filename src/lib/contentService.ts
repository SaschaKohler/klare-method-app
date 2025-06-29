// src/lib/contentService.ts
/**
 * @file This file serves as a facade for the content service, re-exporting functionalities
 * from the `HybridContentService`. It ensures backward compatibility for older components
 * that import from `src/lib/contentService`.
 *
 * All new development should directly use `HybridContentService` from `src/services/`.
 */

// Re-export all functions and types from the new HybridContentService
export * from '../services/HybridContentService';
