// src/store/useResourceStore.ts
import { create } from "zustand";
import {
  Resource,
  ResourceCategory,
  resourceLibraryService,
} from "../services/ResourceLibraryService";
import { createBaseStore, BaseState } from "./createBaseStore";

interface ResourceStoreState extends BaseState {
  // State
  resources: Resource[];
  isLoading: boolean;
  currentUserResources: Resource[];

  // Actions
  loadResources: (userId: string) => Promise<void>;
  addResource: (
    userId: string,
    resource: Omit<Resource, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<Resource>;
  updateResource: (
    userId: string,
    resourceId: string,
    updates: Partial<Resource>,
  ) => Promise<Resource>;
  deleteResource: (userId: string, resourceId: string) => Promise<void>;
  activateResource: (userId: string, resourceId: string) => Promise<Resource>;

  // Filtering and sorting
  getResourcesByCategory: (category: ResourceCategory) => Resource[];
  getTopResources: (limit?: number) => Resource[];
  getRecentlyActivatedResources: (limit?: number) => Resource[];
  searchResources: (searchTerm: string) => Resource[];

  // Current user handling
  setCurrentUserResources: (userId: string) => Promise<void>;
  getCurrentUserResources: () => Resource[];
}

export const useResourceStore = createBaseStore<ResourceStoreState>(
  {
    // initial state
    resources: [],
    currentUserResources: [],
    metadata: {
      isLoading: false,
      lastSync: null,
      error: null,
    },
  },
  (set, get) => ({
    // Actions
    loadResources: async (userId: string) => {
      try {
        console.log("Loading resources for user:", userId);
        set({ isLoading: true });
        const resources = await resourceLibraryService.getUserResources(userId);
        set({
          resources,
          isLoading: false,
          currentUserResources: resources,
        });
      } catch (error) {
        console.error("Error loading resources:", error);
        set({ isLoading: false });
      }
    },

    addResource: async (userId: string, resource) => {
      try {
        const newResource = await resourceLibraryService.addResource(
          userId,
          resource,
        );
        set((state) => ({
          resources: [...state.resources, newResource],
          currentUserResources:
            userId === state.currentUserResources[0]?.userId
              ? [...state.currentUserResources, newResource]
              : state.currentUserResources,
        }));
        return newResource;
      } catch (error) {
        console.error("Error adding resource:", error);
        throw error;
      }
    },

    updateResource: async (userId: string, resourceId: string, updates) => {
      try {
        const updatedResource = await resourceLibraryService.updateResource(
          userId,
          resourceId,
          updates,
        );
        set((state) => ({
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
        throw error;
      }
    },

    deleteResource: async (userId: string, resourceId: string) => {
      try {
        await resourceLibraryService.deleteResource(userId, resourceId);
        set((state) => ({
          resources: state.resources.filter((r) => r.id !== resourceId),
          currentUserResources: state.currentUserResources.filter(
            (r) => r.id !== resourceId,
          ),
        }));
      } catch (error) {
        console.error("Error deleting resource:", error);
        throw error;
      }
    },

    activateResource: async (userId: string, resourceId: string) => {
      try {
        const now = new Date().toISOString();
        const updatedResource = await resourceLibraryService.updateResource(
          userId,
          resourceId,
          { lastActivated: now },
        );
        set((state) => ({
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
        throw error;
      }
    },

    getResourcesByCategory: (category: ResourceCategory) => {
      return get().currentUserResources.filter((r) => r.category === category);
    },

    getTopResources: (limit: number = 5) => {
      return [...get().currentUserResources]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    },

    getRecentlyActivatedResources: (limit: number = 5) => {
      return [...get().currentUserResources]
        .filter((r) => r.lastActivated)
        .sort((a, b) => {
          if (!a.lastActivated || !b.lastActivated) return 0;
          return (
            new Date(b.lastActivated).getTime() -
            new Date(a.lastActivated).getTime()
          );
        })
        .slice(0, limit);
    },

    searchResources: (searchTerm: string) => {
      const term = searchTerm.toLowerCase();
      return get().currentUserResources.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          (r.description && r.description.toLowerCase().includes(term)) ||
          (r.activationTips && r.activationTips.toLowerCase().includes(term)),
      );
    },

    setCurrentUserResources: async (userId: string) => {
      try {
        set({ isLoading: true });
        const userResources =
          await resourceLibraryService.getUserResources(userId);
        set({
          currentUserResources: userResources,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error setting current user resources:", error);
        set({ isLoading: false });
      }
    },

    getCurrentUserResources: () => {
      return get().currentUserResources;
    },
  }),
  StorageKeys.RESOURCES,
);
