// src/services/ResourceLibraryService.ts
import { unifiedStorage, StorageKeys } from "../storage/unifiedStorage";
import uuid from "react-native-uuid";
import { supabase } from "../lib/supabase";
import { RawResourceData } from "../types/store";

// Types
export interface Resource {
  id: string;
  userId: string;
  name: string;
  description?: string;
  rating: number;
  category: ResourceCategory;
  activationTips?: string;
  lastActivated?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ResourceCategory {
  ACTIVITY = "activity",
  PERSONAL_STRENGTH = "personal_strength",
  RELATIONSHIP = "relationship",
  PLACE = "place",
  MEMORY = "memory",
  CUSTOM = "custom",
}

// Storage keys
// Using StorageKeys.RESOURCES instead

class ResourceLibraryService {
  // Cache resources in memory for faster access
  private resourcesCache: Record<string, Resource[]> = {};

  // Get all resources for a user
  async getUserResources(userId: string): Promise<Resource[]> {
    try {
      // Check cache first
      if (this.resourcesCache[userId]) {
        return this.resourcesCache[userId];
      }

      // Try to get from local storage
      const localData = unifiedStorage.getString(StorageKeys.RESOURCES);

      let resources: Resource[] = [];

      if (localData) {
        try {
          resources = JSON.parse(localData);
          
          // Check for duplicate IDs and fix them
          const idMap = new Map<string, boolean>();
          const cleanedResources = resources.filter((resource) => {
            if (!resource.id) {
              // Skip resources without IDs
              return false;
            }
            if (idMap.has(resource.id)) {
              // Duplicate found, skip it
              console.warn(`Duplicate resource ID found: ${resource.id}`);
              return false;
            }
            idMap.set(resource.id, true);
            return true;
          });
          
          // If we found and removed duplicates, update storage
          if (cleanedResources.length !== resources.length) {
            console.log(`Fixed ${resources.length - cleanedResources.length} duplicate resources`);
            resources = cleanedResources;
            unifiedStorage.set(StorageKeys.RESOURCES, JSON.stringify(cleanedResources));
          }
        } catch (error) {
          console.error("Error parsing resources from storage:", error);
          resources = [];
        }
      }

      // If online, try to sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          const { data, error } = await supabase
            .from("resources")
            .select("*")
            .eq("user_id", userId);

          if (!error && data) {
            // Transform server data to match our interface
            resources = data.map(
              (item: RawResourceData): Resource => ({
                id: item.id,
                userId: item.user_id,
                name: item.name,
                description: item.description,
                rating: item.rating,
                category: item.category,
                activationTips: item.activation_tips,
                lastActivated: item.last_activated,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
              }),
            );

            // Update local storage with server data
            unifiedStorage.set(
              StorageKeys.RESOURCES,
              JSON.stringify(resources),
            );
          }
        } catch (error) {
          console.error("Error fetching resources from server:", error);
          // Continue with local data
        }
      }

      // Update cache
      this.resourcesCache[userId] = resources;

      return resources;
    } catch (error) {
      console.error("Error loading resources:", error);
      return [];
    }
  }

  // Add a new resource
  async addResource(
    userId: string,
    resource: Omit<Resource, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<Resource> {
    try {
      const now = new Date().toISOString();

      // Generate a unique ID ensuring it doesn't already exist
      let resourceId = uuid.v4().toString();
      
      // Get existing resources
      const resources = await this.getUserResources(userId);
      console.log("Resources before adding:", resources);
      
      // Check if ID already exists (very unlikely with UUID, but just to be safe)
      const existingIds = new Set(resources.map(r => r.id));
      while (existingIds.has(resourceId)) {
        resourceId = uuid.v4().toString();
      }

      const newResource: Resource = {
        ...resource,
        id: resourceId,
        userId,
        createdAt: now,
        updatedAt: now,
      };

      // Add new resource
      resources.push(newResource);

      // Update local storage
      unifiedStorage.set(StorageKeys.RESOURCES, JSON.stringify(resources));

      // Update cache
      this.resourcesCache[userId] = resources;

      // If online, sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          await supabase.from("resources").insert({
            id: newResource.id,
            user_id: userId,
            name: newResource.name,
            description: newResource.description,
            rating: newResource.rating,
            category: newResource.category,
            activation_tips: newResource.activationTips,
            last_activated: newResource.lastActivated,
            created_at: newResource.createdAt,
            updated_at: newResource.updatedAt,
          });
        } catch (error) {
          console.error("Error adding resource to server:", error);
          // Continue with local data
        }
      }

      return newResource;
    } catch (error) {
      console.error("Error adding resource:", error);
      throw error;
    }
  }

  // Update an existing resource
  async updateResource(
    userId: string,
    resourceId: string,
    updates: Partial<Resource>,
  ): Promise<Resource> {
    try {
      // Get existing resources
      const resources = await this.getUserResources(userId);

      // Find the resource to update
      const resourceIndex = resources.findIndex((r) => r.id === resourceId);
      if (resourceIndex === -1) {
        throw new Error("Resource not found");
      }

      // Update the resource
      const now = new Date().toISOString();
      const updatedResource = {
        ...resources[resourceIndex],
        ...updates,
        updatedAt: now,
      };

      resources[resourceIndex] = updatedResource;

      // Update local storage
      unifiedStorage.set(StorageKeys.RESOURCES, JSON.stringify(resources));

      // Update cache
      this.resourcesCache[userId] = resources;

      // If online, sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          // Convert to snake_case for server
          const serverUpdates: any = {
            updated_at: now,
          };

          if (updates.name) serverUpdates.name = updates.name;
          if (updates.description !== undefined)
            serverUpdates.description = updates.description;
          if (updates.rating !== undefined)
            serverUpdates.rating = updates.rating;
          if (updates.category) serverUpdates.category = updates.category;
          if (updates.activationTips !== undefined)
            serverUpdates.activation_tips = updates.activationTips;
          if (updates.lastActivated)
            serverUpdates.last_activated = updates.lastActivated;

          await supabase
            .from("resources")
            .update(serverUpdates)
            .eq("id", resourceId)
            .eq("user_id", userId);
        } catch (error) {
          console.error("Error updating resource on server:", error);
          // Continue with local data
        }
      }

      return updatedResource;
    } catch (error) {
      console.error("Error updating resource:", error);
      throw error;
    }
  }

  // Delete a resource
  async deleteResource(userId: string, resourceId: string): Promise<void> {
    try {
      // Get existing resources
      const resources = await this.getUserResources(userId);

      // Filter out the resource to delete
      const updatedResources = resources.filter((r) => r.id !== resourceId);

      // Update local storage
      unifiedStorage.set(
        StorageKeys.RESOURCES,
        JSON.stringify(updatedResources),
      );

      // Update cache
      this.resourcesCache[userId] = updatedResources;

      // If online, sync with server
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        try {
          await supabase
            .from("resources")
            .delete()
            .eq("id", resourceId)
            .eq("user_id", userId);
        } catch (error) {
          console.error("Error deleting resource from server:", error);
          // Continue with local data
        }
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      throw error;
    }
  }

  // Mark a resource as activated
  async activateResource(
    userId: string,
    resourceId: string,
  ): Promise<Resource> {
    const now = new Date().toISOString();
    return this.updateResource(userId, resourceId, { lastActivated: now });
  }

  // Get resources by category
  async getResourcesByCategory(
    userId: string,
    category: ResourceCategory,
  ): Promise<Resource[]> {
    const resources = await this.getUserResources(userId);
    return resources.filter((r) => r.category === category);
  }

  // Get top-rated resources
  async getTopResources(
    userId: string,
    limit: number = 5,
  ): Promise<Resource[]> {
    const resources = await this.getUserResources(userId);
    return [...resources].sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  // Get recently activated resources
  async getRecentlyActivatedResources(
    userId: string,
    limit: number = 5,
  ): Promise<Resource[]> {
    const resources = await this.getUserResources(userId);
    return [...resources]
      .filter((r) => r.lastActivated)
      .sort((a, b) => {
        if (!a.lastActivated || !b.lastActivated) return 0;
        return (
          new Date(b.lastActivated).getTime() -
          new Date(a.lastActivated).getTime()
        );
      })
      .slice(0, limit);
  }

  // Clear cache for testing or logout
  clearCache(userId?: string): void {
    if (userId) {
      delete this.resourcesCache[userId];
    } else {
      this.resourcesCache = {};
    }
  }
}

// Singleton instance
export default new ResourceLibraryService();
