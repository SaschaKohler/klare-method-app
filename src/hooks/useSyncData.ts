// src/hooks/useSyncData.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncOptions {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * A hook for handling offline-first data synchronization with Supabase
 */
export const useSyncData = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncQueue, setSyncQueue] = useState<Array<{
    table: string;
    operation: 'insert' | 'update' | 'delete';
    data: any;
    condition?: Record<string, any>;
  }>>([]);

  /**
   * Add an operation to the sync queue
   */
  const addToSyncQueue = useCallback(async (operation: {
    table: string;
    operation: 'insert' | 'update' | 'delete';
    data: any;
    condition?: Record<string, any>;
  }) => {
    const newQueue = [...syncQueue, operation];
    setSyncQueue(newQueue);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('syncQueue', JSON.stringify(newQueue));
  }, [syncQueue]);

  /**
   * Load sync queue from AsyncStorage
   */
  const loadSyncQueue = useCallback(async () => {
    try {
      const storedQueue = await AsyncStorage.getItem('syncQueue');
      if (storedQueue) {
        setSyncQueue(JSON.parse(storedQueue));
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }, []);

  /**
   * Check if we're online by attempting to connect to Supabase
   */
  const checkOnlineStatus = useCallback(async (options: SyncOptions = {}) => {
    const { timeout = 3000 } = options;
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      );
      
      // Try to get the current session
      const sessionPromise = supabase.auth.getSession();
      
      // Race between timeout and actual network call
      const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;
      
      const isConnected = !!data?.session;
      setIsOnline(isConnected);
      return isConnected;
    } catch (error) {
      console.log('Network connection failed:', error);
      setIsOnline(false);
      return false;
    }
  }, []);

  /**
   * Process the sync queue
   */
  const processSyncQueue = useCallback(async () => {
    if (syncQueue.length === 0 || !isOnline) return;
    
    setIsSyncing(true);
    
    try {
      const newQueue = [...syncQueue];
      
      for (let i = 0; i < newQueue.length; i++) {
        const op = newQueue[i];
        
        try {
          if (op.operation === 'insert') {
            await supabase.from(op.table).insert(op.data);
          } else if (op.operation === 'update') {
            const query = supabase.from(op.table).update(op.data);
            
            // Add conditions if they exist
            if (op.condition) {
              Object.entries(op.condition).forEach(([key, value]) => {
                query.eq(key, value);
              });
            }
            
            await query;
          } else if (op.operation === 'delete') {
            const query = supabase.from(op.table).delete();
            
            // Add conditions if they exist
            if (op.condition) {
              Object.entries(op.condition).forEach(([key, value]) => {
                query.eq(key, value);
              });
            }
            
            await query;
          }
          
          // Remove from queue if successful
          newQueue.splice(i, 1);
          i--; // Adjust index after removal
          
        } catch (error) {
          console.error(`Error processing sync operation for ${op.table}:`, error);
          // Leave in queue to retry later
        }
      }
      
      // Update queue
      setSyncQueue(newQueue);
      await AsyncStorage.setItem('syncQueue', JSON.stringify(newQueue));
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      await AsyncStorage.setItem('lastSyncTime', now.toISOString());
      
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [syncQueue, isOnline]);

  /**
   * Synchronize all data with Supabase
   */
  const syncData = useCallback(async (options: SyncOptions = {}) => {
    const isConnected = await checkOnlineStatus(options);
    
    if (isConnected) {
      await processSyncQueue();
      return true;
    }
    
    return false;
  }, [checkOnlineStatus, processSyncQueue]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncQueue,
    syncData,
    addToSyncQueue,
    loadSyncQueue,
    checkOnlineStatus,
  };
};

export default useSyncData;
