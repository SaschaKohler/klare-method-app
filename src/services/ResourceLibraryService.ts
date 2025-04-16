// src/services/ResourceLibraryService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { supabase } from "../lib/supabase";

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
const RESOURCES_STORAGE_KEY = "user_resources";

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
      const localKey = `${RESOURCES_STORAGE_KEY}_${userId}`;
      const localData = await AsyncStorage.getItem(localKey);

      let resources: Resource[] = [];

      if (localData) {
        resources = JSON.parse(localData);
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
            resources = data.map((item: any) => ({
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
            }));

            // Update local storage with server data
            await AsyncStorage.setItem(localKey, JSON.stringify(resources));
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

      const newResource: Resource = {
        ...resource,
        id: uuid.v4().toString(),
        userId,
        createdAt: now,
        updatedAt: now,
      };

      // Get existing resources
      const resources = await this.getUserResources(userId);
      console.log("Resources before adding:", resources);
      // Add new resource
      resources.push(newResource);

      // Update local storage
      const localKey = `${RESOURCES_STORAGE_KEY}_${userId}`;
      await AsyncStorage.setItem(localKey, JSON.stringify(resources));

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
      const localKey = `${RESOURCES_STORAGE_KEY}_${userId}`;
      await AsyncStorage.setItem(localKey, JSON.stringify(resources));

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
      const localKey = `${RESOURCES_STORAGE_KEY}_${userId}`;
      await AsyncStorage.setItem(localKey, JSON.stringify(updatedResources));

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
export const resourceLibraryService = new ResourceLibraryService();
