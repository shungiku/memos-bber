import { Resource } from '../types';
import { uploadFileToAPI } from './api';
import mime from 'mime/lite';

/**
 * Read a file as base64
 * @param file File to read
 * @returns Base64 string
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        const base64String = e.target.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a filename with timestamp
 * @param originalFilename Original filename
 * @returns New filename with timestamp
 */
export function generateFilename(originalFilename: string): string {
  const nameParts = originalFilename.split('.');
  const fileExt = nameParts.pop() || '';
  const baseName = nameParts.join('.');
  const timestamp = formatDateForFilename();
  
  return `${baseName}_${timestamp}.${fileExt}`;
}

/**
 * Format date to string in format YYYYMMDDHHmmss
 * @returns Formatted date string
 */
export function formatDateForFilename(): string {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Process file upload
 * @param file File to upload
 * @returns Uploaded resource
 */
export async function processFileUpload(file: File): Promise<Resource> {
  try {
    // Read file as base64
    const base64String = await readFileAsBase64(file);
    
    // Generate new filename with timestamp
    const newFilename = generateFilename(file.name);
    
    // Upload file to API
    return await uploadFileToAPI(base64String, newFilename, file.type);
  } catch (error) {
    console.error('Error processing file upload:', error);
    throw error;
  }
}

/**
 * Extract filename from URL
 * @param url URL string
 * @returns Extracted filename or default name
 */
function extractFilenameFromUrl(url: string): string {
  try {
    // Create URL object to parse the URL
    const urlObj = new URL(url);
    
    // Get the pathname from URL
    const pathname = urlObj.pathname;
    
    // Split path by '/' and get the last part
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    // If last segment exists and contains a filename
    if (lastSegment && lastSegment.length > 0) {
      // Remove any query parameters
      const filename = lastSegment.split('?')[0];
      
      // Remove any hash fragments
      return filename.split('#')[0];
    }
    
    // Return default filename if extraction fails
    return 'file';
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return 'file';
  }
}

/**
 * Convert string URL to File object
 * @param url URL string
 * @returns File object
 */
export async function urlToFile(url: string): Promise<File> {
  try {
    // Fetch the file from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    // Get content type from response headers
    let contentType = response.headers.get('Content-Type') || '';
    
    // Use octet-stream as fallback if content type is not provided
    if (!contentType) {
      contentType = 'application/octet-stream';
    }
    
    // Extract filename from URL
    let filename = extractFilenameFromUrl(url);
    
    // If filename doesn't have extension, add one based on content type
    if (!filename.includes('.')) {
      // Add extension based on content type using mime package
      const extension = mime.getExtension(contentType);
      if (extension) {
        filename = `${filename}.${extension}`;
      }
    }
    
    // Get file content as blob
    const blob = await response.blob();
    
    // Create and return File object with proper name and type
    return new File([blob], filename, { type: contentType });
  } catch (error) {
    console.error('Error converting URL to file:', error);
    throw error;
  }
} 