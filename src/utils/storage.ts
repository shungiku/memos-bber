import { MemosConfig } from '../types';

// Default configuration
const defaultConfig: MemosConfig = {
  apiUrl: '',
  apiTokens: '',
  memo_lock: 'PUBLIC',
  open_action: '',
  open_content: '',
  userid: '',
  resourceIdList: []
};

/**
 * Get configuration from storage
 * @param callback Callback function to receive the configuration
 */
export function getConfig(callback: (config: MemosConfig & { status: boolean }) => void): void {
  chrome.storage.sync.get(
    defaultConfig,
    (items: MemosConfig) => {
      const flag = items.apiUrl !== '';
      const returnObject = {
        ...items,
        status: flag
      };
      
      if (callback) callback(returnObject);
    }
  );
}

/**
 * Save configuration to storage
 * @param config Configuration to save
 * @param callback Callback function to execute after saving
 */
export function saveConfig(
  config: Partial<MemosConfig>,
  callback?: () => void
): void {
  chrome.storage.sync.set(config, callback ? callback : () => {});
}

/**
 * Get a specific configuration value
 * @param key Key to get
 * @param defaultValue Default value
 * @param callback Callback function to receive the value
 */
export function getConfigValue<K extends keyof MemosConfig>(
  key: K,
  defaultValue: MemosConfig[K],
  callback: (value: MemosConfig[K]) => void
): void {
  chrome.storage.sync.get({ [key]: defaultValue }, (items) => {
    callback(items[key] as MemosConfig[K]);
  });
} 