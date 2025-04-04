/**
 * Interface for storage implementations
 */
export interface Storage {
  saveItem(key: string, value: any): Promise<any>;
  getItem(key: string): Promise<any>;
  removeItem(key: string): Promise<boolean>;
  listItems(): Promise<Array<{ key: string; value: any; }>>;
}