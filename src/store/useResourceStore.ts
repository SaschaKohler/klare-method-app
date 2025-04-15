import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

// Types
export interface Resource {
  id: string;
  name: string;
  description?: string;
  rating: number;
  activationTips?: string;
  lastActivated?: string;
}

export interface Blocker {
  id: string;
  name: string;
  description?: string;
  impact: number;
  transformationStrategy?: string;
  lastTransformed?: string;
}

interface ResourceStore {
  resources: Resource[];
  blockers: Blocker[];
  isLoading: boolean;

  // Actions
  loadResources: () => Promise<void>;
  addResource: (resource: Omit<Resource, "id">) => Promise<void>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  activateResource: (id: string) => Promise<void>;

  // Blocker actions
  addBlocker: (blocker: Omit<Blocker, "id">) => Promise<void>;
  updateBlocker: (id: string, updates: Partial<Blocker>) => Promise<void>;
  deleteBlocker: (id: string) => Promise<void>;
  transformBlocker: (id: string) => Promise<void>;
}

// Storage keys
const RESOURCES_STORAGE_KEY = "l_resources";
const BLOCKERS_STORAGE_KEY = "l_blockers";

// Create the store
export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: [],
  blockers: [],
  isLoading: true,

  // Load resources from AsyncStorage
  loadResources: async () => {
    set({ isLoading: true });
    try {
      const [savedResources, savedBlockers] = await Promise.all([
        AsyncStorage.getItem(RESOURCES_STORAGE_KEY),
        AsyncStorage.getItem(BLOCKERS_STORAGE_KEY),
      ]);

      set({
        resources: savedResources ? JSON.parse(savedResources) : [],
        blockers: savedBlockers ? JSON.parse(savedBlockers) : [],
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading resources:", error);
      set({ isLoading: false });
    }
  },

  // Add a new resource
  addResource: async (resource) => {
    const { resources } = get();
    const newResource: Resource = {
      ...resource,
      id: uuid.v4().toString(),
    };

    const updatedResources = [...resources, newResource];
    set({ resources: updatedResources });

    try {
      await AsyncStorage.setItem(
        RESOURCES_STORAGE_KEY,
        JSON.stringify(updatedResources),
      );
    } catch (error) {
      console.error("Error saving new resource:", error);
    }
  },

  // Update an existing resource
  updateResource: async (id, updates) => {
    const { resources } = get();
    const updatedResources = resources.map((resource) =>
      resource.id === id ? { ...resource, ...updates } : resource,
    );

    set({ resources: updatedResources });

    try {
      await AsyncStorage.setItem(
        RESOURCES_STORAGE_KEY,
        JSON.stringify(updatedResources),
      );
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  },

  // Delete a resource
  deleteResource: async (id) => {
    const { resources } = get();
    const updatedResources = resources.filter((resource) => resource.id !== id);

    set({ resources: updatedResources });

    try {
      await AsyncStorage.setItem(
        RESOURCES_STORAGE_KEY,
        JSON.stringify(updatedResources),
      );
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  },

  // Mark a resource as activated
  activateResource: async (id) => {
    const { resources } = get();
    const updatedResources = resources.map((resource) =>
      resource.id === id
        ? { ...resource, lastActivated: new Date().toISOString() }
        : resource,
    );

    set({ resources: updatedResources });

    try {
      await AsyncStorage.setItem(
        RESOURCES_STORAGE_KEY,
        JSON.stringify(updatedResources),
      );
    } catch (error) {
      console.error("Error activating resource:", error);
    }
  },

  // Add a new blocker
  addBlocker: async (blocker) => {
    const { blockers } = get();
    const newBlocker: Blocker = {
      ...blocker,
      id: uuid.v4().toString(),
    };

    const updatedBlockers = [...blockers, newBlocker];
    set({ blockers: updatedBlockers });

    try {
      await AsyncStorage.setItem(
        BLOCKERS_STORAGE_KEY,
        JSON.stringify(updatedBlockers),
      );
    } catch (error) {
      console.error("Error saving new blocker:", error);
    }
  },

  // Update an existing blocker
  updateBlocker: async (id, updates) => {
    const { blockers } = get();
    const updatedBlockers = blockers.map((blocker) =>
      blocker.id === id ? { ...blocker, ...updates } : blocker,
    );

    set({ blockers: updatedBlockers });

    try {
      await AsyncStorage.setItem(
        BLOCKERS_STORAGE_KEY,
        JSON.stringify(updatedBlockers),
      );
    } catch (error) {
      console.error("Error updating blocker:", error);
    }
  },

  // Delete a blocker
  deleteBlocker: async (id) => {
    const { blockers } = get();
    const updatedBlockers = blockers.filter((blocker) => blocker.id !== id);

    set({ blockers: updatedBlockers });

    try {
      await AsyncStorage.setItem(
        BLOCKERS_STORAGE_KEY,
        JSON.stringify(updatedBlockers),
      );
    } catch (error) {
      console.error("Error deleting blocker:", error);
    }
  },

  // Mark a blocker as transformed
  transformBlocker: async (id) => {
    const { blockers } = get();
    const updatedBlockers = blockers.map((blocker) =>
      blocker.id === id
        ? { ...blocker, lastTransformed: new Date().toISOString() }
        : blocker,
    );

    set({ blockers: updatedBlockers });

    try {
      await AsyncStorage.setItem(
        BLOCKERS_STORAGE_KEY,
        JSON.stringify(updatedBlockers),
      );
    } catch (error) {
      console.error("Error transforming blocker:", error);
    }
  },
}));
