// Type definitions for Memos API

// Action types for content and files
export type ContentActionType = 'SAVE_TEXT' | 'NONE';

// Configuration type
export interface MemosConfig {
  apiUrl: string;
  apiTokens: string;
  memo_lock: 'PUBLIC' | 'PRIVATE' | 'PROTECTED' | '';
  // New fields with better type safety
  contentActionType: ContentActionType;  // Action type for content operations
  pendingContent: string;                // Content waiting to be saved
  tempFileUrl: string;                   // Temporary URL for file being uploaded
  userid: string;
  resourceIdList: ResourceItem[];
}

// Resource item for storage
export interface ResourceItem {
  name: string;
  uid: string;
  type: string;
}

// Memo visibility type
export type Visibility = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

// Memo type
export interface Memo {
  // Updated to match current Memos API
  name?: string;           // Format: memos/{memo}
  creator?: string;        // Format: users/{user}
  createTime?: string;
  updateTime?: string;
  displayTime?: string;
  content: string;
  visibility: Visibility;
  tags?: string[];
  pinned?: boolean;
  resources?: Resource[];
  
  // Legacy fields for backward compatibility
  id?: number;
  rowStatus?: string;
  creatorId?: number;
  createdTs?: number;
  updatedTs?: number;
  resourceList?: Resource[];
  relationList?: any[];
  uid?: string;            // Used in some API responses
}

// Resource (images, etc.) type
export interface Resource {
  // Updated to match current Memos API
  name?: string;           // Format: resources/{resource}
  createTime?: string;
  filename: string;
  content?: string;        // Base64 encoded content
  externalLink?: string;
  type: string;
  size?: string | number;
  memo?: string;           // Related memo name
  
  // Legacy fields for backward compatibility
  id?: string;
  creatorId?: number;
  createdTs?: number;
  updatedTs?: number;
  publicId?: string;
  uid?: string;            // Used in some API responses
} 