// src/store/createPersistentStore.ts
import { create, StateCreator, StoreApi, UseBoundStore } from "zustand";
import { persist, PersistOptions, StorageValue } from "zustand/middleware";

/**
 * Creates a persistent store with enhanced error handling for storage issues
 *
 * @param storeInitializer The store initializer function
 * @param persistOptions The persist middleware options
 * @returns A zustand store with persistence
 */
export function createPersistentStore<T extends object>(
  storeInitializer: StateCreator<T, [["zustand/persist", unknown]]>,
  persistOptions: PersistOptions<T>,
): UseBoundStore<StoreApi<T>> {
  // Ensure a name is always present in persistOptions to avoid 'undefined' as storage key
  if (!persistOptions.name || persistOptions.name === 'undefined') {
    console.warn('Store created without a valid name. Setting default name to prevent storage issues.');
    persistOptions.name = `klare-store-${Date.now()}`;
  }
  
  // Enhanced onRehydrateStorage to properly handle storage failures
  const enhancedOptions: PersistOptions<T> = {
    ...persistOptions,
    onRehydrateStorage: (state) => {
      // Keep original handler if provided
      const originalHandler = persistOptions.onRehydrateStorage?.(state);

      return (hydrated, error) => {
        // Call original handler if it exists
        if (originalHandler) {
          originalHandler(hydrated, error);
        }

        // Add our enhanced error handling
        const storeName = persistOptions.name || "unnamed store";

        if (error) {
          console.warn(
            `[zustand persist middleware] Rehydration failed for ${storeName}:`,
            error,
          );

          // Return a fallback store state - this prevents the store from being stuck
          return {
            ...state,
            _hasHydrationError: true,
            _lastHydrationError: error.message,
          } as unknown as T;
        } else if (!hydrated) {
          console.log(`No data to rehydrate for ${storeName}`);
          return state as T;
        } else {
          console.log(`Successfully rehydrated ${storeName}`);
          return hydrated as T;
        }
      };
    },
  };

  // Create the store with enhanced persistence
  return create<T>()(persist(storeInitializer, enhancedOptions));
}

/**
 * Create a store that gracefully falls back to memory if persistence fails
 *
 * @param storeInitializer The store initializer function
 * @param persistOptions The persist middleware options
 * @returns A zustand store that works even if persistence fails
 */
export function createResilientStore<T extends object>(
  storeInitializer: StateCreator<T, [], []>,
  persistOptions: PersistOptions<T>,
): UseBoundStore<StoreApi<T>> {
  // Ensure a name is always present
  if (!persistOptions.name || persistOptions.name === 'undefined') {
    console.warn('Store created without a valid name. Setting default name to prevent storage issues.');
    persistOptions.name = `klare-store-${Date.now()}`;
  }
  
  try {
    return createPersistentStore(storeInitializer, persistOptions);
  } catch (error) {
    console.error(
      `Failed to create persistent store: ${persistOptions.name}`,
      error,
    );

    // Fall back to a non-persistent store
    return create<T>()(storeInitializer);
  }
}
