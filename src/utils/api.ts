import { ApiResponse, Memo, Resource, ResourceItem, Visibility } from '../types';
import { getConfig } from './storage';

/**
 * Send API request
 * @param endpoint API endpoint
 * @param method HTTP method
 * @param data Request data
 * @returns Response
 */
async function fetchAPI<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  data?: any
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    getConfig(async (config) => {
      if (!config.apiUrl) {
        reject(new Error('API URL is not set'));
        return;
      }

      const url = `${config.apiUrl.replace(/\/$/, '')}${endpoint}`;
      
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (config.apiTokens) {
          headers['Authorization'] = `Bearer ${config.apiTokens}`;
        }
        
        const options: RequestInit = {
          method,
          headers,
        };
        
        if (data && method !== 'GET') {
          options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        resolve(result as ApiResponse<T>);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Create a memo
 * @param content Memo content
 * @param visibility Memo visibility
 * @returns Created memo
 */
export async function createMemo(
  content: string,
  visibility: Visibility = 'PUBLIC'
): Promise<Memo> {
  return new Promise((resolve, reject) => {
    getConfig(async (config) => {
      try {
        if (!config.apiUrl) {
          reject(new Error('API URL is not set'));
          return;
        }
        
        const url = `${config.apiUrl.replace(/\/$/, '')}/api/v1/memos`;
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (config.apiTokens) {
          headers['Authorization'] = `Bearer ${config.apiTokens}`;
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content,
            visibility,
          })
        });
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Process API response structure appropriately
        let memo: Memo;
        if (result.data) {
          memo = result.data as Memo;
        } else {
          memo = result as Memo;
        }
        
        // Verify memo ID
        if (!memo.name) {
          // For backward compatibility with older API, generate name from id
          if (memo.id) {
            memo.name = `memos/${memo.id}`;
          } else {
            throw new Error('Invalid memo response: missing name and id properties');
          }
        }
        
        resolve(memo);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Upload a resource (image, etc.)
 * @param file File to upload
 * @returns Uploaded resource
 */
export async function uploadResource(file: File): Promise<Resource> {
  return new Promise((resolve, reject) => {
    getConfig(async (config) => {
      if (!config.apiUrl) {
        reject(new Error('API URL is not set'));
        return;
      }

      try {
        // Try to use FormData upload first
        const url = `${config.apiUrl.replace(/\/$/, '')}/api/v1/resources`;
        
        const formData = new FormData();
        formData.append('file', file);
        
        const headers: HeadersInit = {};
        
        if (config.apiTokens) {
          headers['Authorization'] = `Bearer ${config.apiTokens}`;
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: formData,
        });
        
        if (!response.ok) {
          // If FormData upload fails, try base64 upload
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              if (e.target && typeof e.target.result === 'string') {
                const base64String = e.target.result.split(',')[1];
                
                const resourceData = {
                  content: base64String,
                  filename: file.name,
                  type: file.type
                };
                
                const base64Response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiTokens}`
                  },
                  body: JSON.stringify(resourceData)
                });
                
                if (!base64Response.ok) {
                  throw new Error(`Base64 upload failed: ${base64Response.status} ${base64Response.statusText}`);
                }
                
                const base64Result = await base64Response.json();
                resolve(base64Result.data as Resource);
              } else {
                throw new Error('Failed to read file as base64');
              }
            } catch (error) {
              reject(error);
            }
          };
          
          reader.onerror = (error) => {
            reject(error);
          };
          
          reader.readAsDataURL(file);
        } else {
          const result = await response.json();
          resolve(result.data as Resource);
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Upload a resource using base64 data
 * @param base64String Base64 encoded content
 * @param filename Filename
 * @param type File type
 * @returns Uploaded resource
 */
export async function uploadResourceBase64(
  base64String: string,
  filename: string,
  type: string
): Promise<Resource> {
  return new Promise((resolve, reject) => {
    getConfig(async (config) => {
      if (!config.apiUrl) {
        reject(new Error('API URL is not set'));
        return;
      }

      const url = `${config.apiUrl.replace(/\/$/, '')}/api/v1/resources`;
      
      try {
        const resourceData = {
          content: base64String,
          filename,
          type
        };
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (config.apiTokens) {
          headers['Authorization'] = `Bearer ${config.apiTokens}`;
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(resourceData)
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Process API response structure appropriately
        if (result.data) {
          // New API response format
          resolve(result.data as Resource);
        } else if (result.resource) {
          // Old API response format
          resolve(result.resource as Resource);
        } else if (result) {
          // Response itself is a resource object
          resolve(result as Resource);
        } else {
          throw new Error('Invalid resource response format');
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Link resources to a memo
 * @param memoId Memo ID or name
 * @param resourceIds Resource IDs to link
 * @returns Updated memo
 */
export async function linkResourcesToMemo(
  memoId: string,
  resourceIds: ResourceItem[]
): Promise<Memo> {
  return new Promise((resolve, reject) => {
    getConfig(async (config) => {
      try {
        // Ensure memoId has the correct format: memos/{id}
        const formattedMemoId = memoId.startsWith('memos/') ? memoId : `memos/${memoId}`;
        
        if (!formattedMemoId || formattedMemoId === 'memos/') {
          reject(new Error('Invalid memo ID'));
          return;
        }
        
        if (!resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
          reject(new Error('No resources to link'));
          return;
        }
        
        // Create a simple array containing only resource names according to API spec
        const resources = [];
        for (const item of resourceIds) {
          if (!item) continue;
          
          // Get resource name
          let resourceName = '';
          if (item.name && typeof item.name === 'string') {
            resourceName = item.name.startsWith('resources/') ? item.name : `resources/${item.name}`;
          } else if (item.uid && typeof item.uid === 'string') {
            resourceName = `resources/${item.uid}`;
          } else {
            continue;
          }
          
          // Add object with only name property according to API spec
          resources.push({ name: resourceName });
        }
        
        if (resources.length === 0) {
          reject(new Error('No valid resources to link'));
          return;
        }
        
        const url = `${config.apiUrl.replace(/\/$/, '')}/api/v1/${formattedMemoId}/resources`;
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (config.apiTokens) {
          headers['Authorization'] = `Bearer ${config.apiTokens}`;
        }
        
        // Construct request body according to API spec
        const requestBody = { resources };
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.data) {
          resolve(result.data as Memo);
        } else {
          resolve(result as Memo);
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Get user status
 * @returns User status
 */
export async function getUserStatus(): Promise<any> {
  const response = await fetchAPI<any>('/api/v1/auth/status', 'POST');
  return response.data;
}

/**
 * Get memo tags
 * @param userId User ID
 * @returns Tags with counts
 */
export async function getTags(userId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    getConfig(async (config) => {
      try {
        if (!config.apiUrl) {
          reject(new Error('API URL is not set'));
          return;
        }
        
        // Format the API URL - using user stats endpoint which contains tag information
        const formattedUserId = userId.startsWith('users/') ? userId : `users/${userId}`;
        const url = `${config.apiUrl.replace(/\/$/, '')}/api/v1/${formattedUserId}/stats`;
        
        const headers: HeadersInit = {};
        if (config.apiTokens) {
          headers['Authorization'] = `Bearer ${config.apiTokens}`;
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user stats: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Extract tag information from user stats
        if (result && result.tagCount) {
          // Convert tagCount to tagAmounts format for compatibility
          const tagAmounts: Record<string, number> = {};
          Object.entries(result.tagCount).forEach(([tag, count]) => {
            tagAmounts[tag] = count as number;
          });
          
          resolve({ tagAmounts });
        } else if (result && result.data && result.data.tagCount) {
          // Handle nested data structure
          const tagAmounts: Record<string, number> = {};
          Object.entries(result.data.tagCount).forEach(([tag, count]) => {
            tagAmounts[tag] = count as number;
          });
          
          resolve({ tagAmounts });
        } else {
          resolve({ tagAmounts: {} }); // Return empty tags as fallback
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Get memo by ID
 * @param memoId Memo ID
 * @returns Memo
 */
export async function getMemoById(memoId: string): Promise<Memo> {
  const response = await fetchAPI<Memo>(`/api/v1/${memoId}`, 'GET');
  return response.data;
}

/**
 * Archive memo
 * @param memoName Memo name
 * @param memoUid Memo UID
 * @returns Archived memo
 */
export async function archiveMemo(memoName: string, memoUid: string): Promise<any> {
  const response = await fetchAPI<any>(`/api/v1/${memoName}`, 'PATCH', {
    uid: memoUid,
    rowStatus: 'ARCHIVED'
  });
  return response.data;
} 