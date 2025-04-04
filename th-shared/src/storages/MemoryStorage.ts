import { Storage } from "./BaseStorage";

/**
 * Memory storage implementation
 */

export class MemoryStorage implements Storage {
  private items: Map<string, any>;

  constructor() {
    this.items = new Map<string, any>();
  }

  /**
   * Save an item
   * @param key Item key
   * @param value Item value
   * @returns Promise resolving to the saved value
   */
  async saveItem(key: string, value: any): Promise<any> {
    this.items.set(key, value);
    return value;
  }

  /**
   * Get an item
   * @param key Item key
   * @returns Promise resolving to the item value or null if not found
   */
  async getItem(key: string): Promise<any> {
    return this.items.get(key) || null;
  }

  /**
   * Remove an item
   * @param key Item key
   * @returns Promise resolving to true if the item was removed, false otherwise
   */
  async removeItem(key: string): Promise<boolean> {
    return this.items.delete(key);
  }

  /**
   * List all items
   * @returns Promise resolving to an array of items
   */
  async listItems(): Promise<Array<{ key: string; value: any; }>> {
    return Array.from(this.items.entries()).map(([key, value]) => ({ key, value }));
  }

  /**
   * Clear all items
   * @returns Promise resolving when all items are cleared
   */
  async clear(): Promise<void> {
    this.items.clear();
  }

  /**
   * Get the number of items
   * @returns Promise resolving to the number of items
   */
  async size(): Promise<number> {
    return this.items.size;
  }

  /**
   * Check if an item exists
   * @param key Item key
   * @returns Promise resolving to true if the item exists, false otherwise
   */
  async hasItem(key: string): Promise<boolean> {
    return this.items.has(key);
  }
}
