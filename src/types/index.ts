// Type definitions for Memos API

// Configuration type
export interface MemosConfig {
  apiUrl: string;
  apiTokens: string;
  memo_lock: 'PUBLIC' | 'PRIVATE' | 'PROTECTED' | '';
  open_action: string;
  open_content: string;
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

// Memo state
export type State = 'NORMAL' | 'ARCHIVED' | 'DELETED';

// Memo type
export interface Memo {
  // Updated to match current Memos API
  name?: string;           // Format: memos/{memo}
  state?: State;
  creator?: string;        // Format: users/{user}
  createTime?: string;
  updateTime?: string;
  displayTime?: string;
  content: string;
  visibility: Visibility;
  tags?: string[];
  pinned?: boolean;
  resources?: Resource[];
  relations?: MemoRelation[];
  reactions?: Reaction[];
  
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

// Memo relation type
export interface MemoRelation {
  memo: string;            // Related memo name
  relatedMemo: string;     // Related memo name
  type: string;            // Relation type
}

// Reaction type
export interface Reaction {
  name?: string;           // Format: reactions/{reaction}
  creator?: string;        // Format: users/{user}
  createTime?: string;
  content: string;         // Emoji content
  reactionType?: string;   // Reaction type
}

// API response type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
} 