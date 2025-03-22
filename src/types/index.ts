// Type definitions for Memos API

// Action types for content and files
export type ContentActionType = 'SAVE_TEXT' | 'NONE';

/**
 * Configuration type for Memos extension
 */
export interface MemosConfig {
  /** API URL for Memos server */
  apiUrl: string;
  /** API access token */
  apiTokens: string;
  /** Memo visibility setting */
  memo_lock: 'PUBLIC' | 'PRIVATE' | 'PROTECTED' | '';
  /** Action type for content operations */
  contentActionType: ContentActionType;
  /** Content waiting to be saved */
  pendingContent: string;
  /** Temporary URL for file being uploaded */
  tempFileUrl: string;
  /** User identifier */
  userid: string;
  /** List of resources to be linked with next memo */
  resourceIdList: ResourceItem[];
}

/**
 * Resource item for storage in extension state
 */
export interface ResourceItem {
  /** Resource filename */
  name: string;
  /** Resource unique identifier */
  uid: string;
  /** MIME type of the resource */
  type: string;
}

/**
 * Memo visibility type
 */
export type Visibility = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

/**
 * Memo type definition that supports both new and legacy API versions
 */
export interface Memo {
  // Current API fields
  /** Resource name in format: memos/{memo} */
  name?: string;
  /** Creator in format: users/{user} */
  creator?: string;
  /** ISO timestamp when memo was created */
  createTime?: string;
  /** ISO timestamp when memo was last updated */
  updateTime?: string;
  /** ISO timestamp for display purposes */
  displayTime?: string;
  /** Memo text content */
  content: string;
  /** Memo visibility setting */
  visibility: Visibility;
  /** Tags list */
  tags?: string[];
  /** Whether memo is pinned */
  pinned?: boolean;
  /** Attached resources */
  resources?: Resource[];
  
  // Legacy API fields
  /** Legacy numeric ID, can be used in older API versions */
  id?: number;
  /** Legacy row status in database */
  rowStatus?: string;
  /** Legacy creator ID numeric format */
  creatorId?: number;
  /** Legacy Unix timestamp in milliseconds for creation time */
  createdTs?: number;
  /** Legacy Unix timestamp in milliseconds for update time */
  updatedTs?: number;
  /** Legacy resource list format */
  resourceList?: Resource[];
  /** Legacy relation list format */
  relationList?: any[];
  /** UID for compatibility with some API responses */
  uid?: string;
}

/**
 * Resource (images, files, etc.) type definition that supports both new and legacy API versions
 */
export interface Resource {
  // Current API fields
  /** Resource name in format: resources/{resource} */
  name?: string;
  /** ISO timestamp when resource was created */
  createTime?: string;
  /** Original filename */
  filename: string;
  /** Base64 encoded content */
  content?: string;
  /** External link URL */
  externalLink?: string;
  /** MIME type of the resource */
  type: string;
  /** File size in bytes or human-readable format */
  size?: string | number;
  /** Related memo name */
  memo?: string;
  
  // Legacy API fields
  /** Legacy resource ID string format */
  id?: string;
  /** Legacy creator ID numeric format */
  creatorId?: number;
  /** Legacy Unix timestamp in milliseconds for creation time */
  createdTs?: number;
  /** Legacy Unix timestamp in milliseconds for update time */
  updatedTs?: number;
  /** Legacy public ID */
  publicId?: string;
  /** UID for compatibility with some API responses */
  uid?: string;
} 