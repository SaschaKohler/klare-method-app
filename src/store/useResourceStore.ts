// src/store/useResourceStore.ts
import ResourceLibraryService, {
  Resource,
  ResourceCategory,
} from "../services/ResourceLibraryService";
import { createBaseStore, BaseState } from "./createBaseStore";

export type { Resource };
export { ResourceCategory };

export interface ResourceStoreState extends BaseState {
  // State
  resources: Resource[];
  currentUserResources: Resource[];

  // Actions
  loadResources: (userId: string) => Promise<void>;
  addResource: (
    userId: string,
    resource: Omit<Resource, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<Resource | undefined>;
  updateResource: (
    userId: string,
    resourceId: string,
    updates: Partial<Resource>,
  ) => Promise<Resource | undefined>;
  deleteResource: (userId: string, resourceId: string) => Promise<void>;
  activateResource: (userId: string, resourceId: string) => Promise<Resource | undefined>;

  // Selectors
  getResourcesByCategory: (category: ResourceCategory) => Resource[];
  getTopResources: (limit: number) => Resource[];
  searchResources: (query: string) => Resource[];
  getRecentlyActivatedResources: (limit: number) => Resource[];
  getCurrentUserResources: () => Resource[];

  // Current user handling
  setCurrentUserResources: (userId: string) => Promise<void>;
}

export const useResourceStore = createBaseStore<ResourceStoreState>(
  {},
  (set, get) => ({
    // Initial state
    resources: [],
    currentUserResources: [],

    // Actions
    loadResources: async (userId: string) => {
      const { setLoading, setError, updateLastSync } = get();
      setLoading(true);
      try {
        console.log("Loading resources for user:", userId);
        const resources = await ResourceLibraryService.getUserResources(userId);
        set((state) => ({
          ...state,
          resources,
          currentUserResources: resources,
        }));
        updateLastSync();
      } catch (error) {
        console.error("Error loading resources:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },

    addResource: async (userId: string, resource) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const newResource = await ResourceLibraryService.addResource(
          userId,
          resource,
        );
        set((state) => ({
          ...state,
          resources: [...state.resources, newResource],
          currentUserResources:
            userId === state.currentUserResources[0]?.userId
              ? [...state.currentUserResources, newResource]
              : state.currentUserResources,
        }));
        return newResource;
      } catch (error) {
        console.error("Error adding resource:", error);
        setError(error as Error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },

    updateResource: async (userId: string, resourceId: string, updates) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const updatedResource = await ResourceLibraryService.updateResource(
          userId,
          resourceId,
          updates,
        );
        set((state) => ({
          ...state,
          resources: state.resources.map((r) =>
            r.id === resourceId ? updatedResource : r,
          ),
          currentUserResources: state.currentUserResources.map((r) =>
            r.id === resourceId ? updatedResource : r,
          ),
        }));
        return updatedResource;
      } catch (error) {
        console.error("Error updating resource:", error);
        setError(error as Error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },

    deleteResource: async (userId: string, resourceId: string) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        await ResourceLibraryService.deleteResource(userId, resourceId);
        set((state) => ({
          ...state,
          resources: state.resources.filter((r) => r.id !== resourceId),
          currentUserResources: state.currentUserResources.filter(
            (r) => r.id !== resourceId,
          ),
        }));
      } catch (error) {
        console.error("Error deleting resource:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },

    activateResource: async (userId: string, resourceId: string) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const now = new Date().toISOString();
        const updatedResource = await ResourceLibraryService.updateResource(
          userId,
          resourceId,
          { lastActivated: now },
        );
        set((state) => ({
          ...state,
          resources: state.resources.map((r) =>
            r.id === resourceId ? updatedResource : r,
          ),
          currentUserResources: state.currentUserResources.map((r) =>
            r.id === resourceId ? updatedResource : r,
          ),
        }));
        return updatedResource;
      } catch (error) {
        console.error("Error activating resource:", error);
        setError(error as Error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },

    getResourcesByCategory: (category: ResourceCategory) => {
      const resources = get().currentUserResources;
      return Array.isArray(resources)
        ? resources.filter((r) => r.category === category)
        : [];
    },

    getTopResources: (limit: number = 5) => {
      const resources = get().currentUserResources;
      return Array.isArray(resources)
        ? [...resources].sort((a, b) => b.rating - a.rating).slice(0, limit)
        : [];
    },

    getRecentlyActivatedResources: (limit: number = 5) => {
      const resources = get().currentUserResources;
      return Array.isArray(resources)
        ? [...resources]
            .filter((r) => r.lastActivated)
            .sort((a, b) => {
              if (!a.lastActivated || !b.lastActivated) return 0;
              return (
                new Date(b.lastActivated).getTime() -
                new Date(a.lastActivated).getTime()
              );
            })
            .slice(0, limit)
        : [];
    },

    searchResources: (searchTerm: string) => {
      const resources = get().currentUserResources;
      const term = searchTerm.toLowerCase();
      return Array.isArray(resources)
        ? resources.filter(
            (r) =>
              r.name.toLowerCase().includes(term) ||
              (r.description && r.description.toLowerCase().includes(term)) ||
              (r.activationTips &&
                r.activationTips.toLowerCase().includes(term)),
          )
        : [];
    },

    setCurrentUserResources: async (userId: string) => {
      const { setLoading, setError } = get();
      setLoading(true);
      try {
        const userResources =
          await ResourceLibraryService.getUserResources(userId);
        set((state) => ({
          ...state,
          currentUserResources: userResources,
        }));
      } catch (error) {
        console.error("Error setting current user resources:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    },

    getCurrentUserResources: () => {
      return get().currentUserResources;
    },
  }),
  "resources",
);
