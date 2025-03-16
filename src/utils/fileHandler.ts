import { Resource } from '../types';
import { uploadFileToAPI } from './api';

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
 * Convert string URL to File object
 * @param url URL string
 * @returns File object
 */
export async function urlToFile(url: string): Promise<File> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'file.jpg', { type: 'image/jpeg' });
  } catch (error) {
    console.error('Error converting URL to file:', error);
    throw error;
  }
} 