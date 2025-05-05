// services/storage/storage.ts
/**
 * Pure JavaScript implementation of storage API
 * Does not depend on AsyncStorage at all
 */

// In-memory fallback storage
const memoryStorage = new Map<string, string>();

// Create a pure JS implementation that matches AsyncStorage API
const SecureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      memoryStorage.set(key, value);
      console.log(`Storage: Saved ${key}`);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = memoryStorage.get(key) || null;
      console.log(`Storage: Retrieved ${key}`);
      return value;
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      memoryStorage.delete(key);
      console.log(`Storage: Removed ${key}`);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      memoryStorage.clear();
      console.log('Storage: Cleared all items');
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  getAllKeys: async (): Promise<string[]> => {
    try {
      // Use spread operator to convert keys iterator to array
      return [...memoryStorage.keys()];
    } catch (error) {
      console.error('Storage error:', error);
      return [];
    }
  },

  multiGet: async (keys: string[]): Promise<[string, string | null][]> => {
    try {
      // Map keys to [key, value] pairs
      return keys.map(key => [key, memoryStorage.get(key) || null]);
    } catch (error) {
      console.error('Storage error:', error);
      return [];
    }
  },

  multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        memoryStorage.set(key, value);
      });
      console.log(`Storage: Set multiple items`);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    try {
      keys.forEach(key => {
        memoryStorage.delete(key);
      });
      console.log(`Storage: Removed multiple items`);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
};

export default SecureStorage;