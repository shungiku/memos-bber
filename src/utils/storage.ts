import { MemosConfig } from '../types';

// Default configuration
const defaultConfig: MemosConfig = {
  apiUrl: '',
  apiTokens: '',
  memo_lock: 'PRIVATE',
  contentActionType: 'NONE',
  pendingContent: '',
  tempFileUrl: '',
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
 * @param config Partial configuration to save
 * @param callback Optional callback after save
 */
export function saveConfig(config: Partial<MemosConfig>, callback?: () => void): void {
  chrome.storage.sync.set(config, callback ? callback : () => {});
}

// Text-related helper functions
/**
 * Reset text action state
 * @param callback Optional callback after save
 */
export function resetTextAction(callback?: () => void): void {
  saveConfig({
    contentActionType: 'NONE',
    pendingContent: ''
  }, callback);
}

/**
 * Set pending text content
 * @param text The text content to save
 * @param callback Optional callback after save
 */
export function setPendingText(text: string, callback?: () => void): void {
  saveConfig({
    contentActionType: 'SAVE_TEXT',
    pendingContent: text
  }, callback);
}

// File-related helper functions
/**
 * Reset file upload state
 * @param callback Optional callback after save
 */
export function resetFileUpload(callback?: () => void): void {
  saveConfig({
    tempFileUrl: ''
  }, callback);
}

/**
 * Clear any file upload state
 * @param callback Optional callback after check/reset
 */
export function clearFileUploadState(callback?: () => void): void {
  chrome.storage.sync.get(
    { tempFileUrl: '' },
    (items) => {
      // Always reset file upload state to ensure a clean start
      if (items.tempFileUrl) {
        resetFileUpload(callback);
      } else if (callback) {
        callback();
      }
    }
  );
}

/**
 * Set temporary file URL for upload
 * @param fileUrl The file URL to upload
 * @param callback Optional callback after save
 */
export function setTempFileUrl(fileUrl: string, callback?: () => void): void {
  // Store the URL for the file being uploaded
  saveConfig({
    tempFileUrl: fileUrl
  }, callback);
}

// Resource list management
/**
 * Update resource list
 * @param resourceList The new resource list
 * @param callback Optional callback after save
 */
export function updateResourceList(resourceList: MemosConfig['resourceIdList'], callback?: () => void): void {
  saveConfig({
    resourceIdList: resourceList
  }, callback);
}

// Reset all states
/**
 * Reset all action states
 * @param callback Optional callback after save
 */
export function resetAllActions(callback?: () => void): void {
  saveConfig({
    contentActionType: 'NONE',
    pendingContent: '',
    tempFileUrl: '',
    resourceIdList: []
  }, callback);
} 