import { getConfig, saveConfig } from '../utils/storage';
import { 
  createMemo, 
  uploadResourceBase64, 
  linkResourcesToMemo,
  getTags
} from '../utils/api';
import { Visibility, ResourceItem } from '../types';
import { initializeI18n } from '../utils/i18n';
import { showMessage } from '../utils/message';

// Add ViewImage type definition
declare global {
  interface Window {
    ViewImage?: {
      init: (selector: string) => void;
    };
  }
}

/**
 * Format date to string in format YYYYMMDDHHmmss
 * @returns Formatted date string
 */
function formatDateForFilename(): string {
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
 * Set theme based on user preference or system preference
 */
function setTheme(theme?: 'light' | 'dark'): void {
  // If theme is not specified, check localStorage or system preference
  if (!theme) {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      theme = storedTheme;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
  }

  // Apply theme
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Show light icon (for switching to light mode)
    const darkIcon = document.querySelector('.dark-icon') as HTMLElement;
    const lightIcon = document.querySelector('.light-icon') as HTMLElement;
    if (darkIcon && lightIcon) {
      darkIcon.style.display = 'none';
      lightIcon.style.display = 'block';
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    
    // Show dark icon (for switching to dark mode)
    const darkIcon = document.querySelector('.dark-icon') as HTMLElement;
    const lightIcon = document.querySelector('.light-icon') as HTMLElement;
    if (darkIcon && lightIcon) {
      darkIcon.style.display = 'block';
      lightIcon.style.display = 'none';
    }
  }

  // Save theme preference
  localStorage.setItem('theme', theme);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme(): void {
  const currentTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  setTheme();

  // Initialize i18n
  initializeI18n();

  // Theme toggle event listener
  const themeToggleElement = document.getElementById('theme_toggle');
  if (themeToggleElement) {
    themeToggleElement.addEventListener('click', toggleTheme);
  }

  // Get and display configuration
  getConfig((info) => {
    if (info.status) {
      // Hide settings form if configuration exists
      const blogInfo = document.getElementById('blog_info');
      if (blogInfo) {
        blogInfo.style.display = 'none';
      }
    }

    // Set save button text
    const saveKeyText = document.getElementById('saveKeyText');
    if (saveKeyText) {
      saveKeyText.textContent = chrome.i18n.getMessage("saveBtn");
    }
    
    // Set submit button text
    const submitText = document.getElementById('submitText');
    if (submitText) {
      submitText.textContent = chrome.i18n.getMessage("submitBtn") || "Send";
    }

    // Display memo privacy setting
    const memoNow = info.memo_lock;
    const lockNowElement = document.getElementById('lock-now');
    
    if (memoNow === '') {
      // Default is PUBLIC
      saveConfig({ memo_lock: 'PUBLIC' });
      if (lockNowElement) {
        lockNowElement.textContent = chrome.i18n.getMessage("lockPublic");
      }
    } else if (memoNow === "PUBLIC" && lockNowElement) {
      lockNowElement.textContent = chrome.i18n.getMessage("lockPublic");
    } else if (memoNow === "PRIVATE" && lockNowElement) {
      lockNowElement.textContent = chrome.i18n.getMessage("lockPrivate");
    } else if (memoNow === "PROTECTED" && lockNowElement) {
      lockNowElement.textContent = chrome.i18n.getMessage("lockProtected");
    }

    // Set form values
    const apiUrlElement = document.getElementById('apiUrl') as HTMLInputElement;
    const apiTokensElement = document.getElementById('apiTokens') as HTMLInputElement;
    const textareaElement = document.querySelector("textarea[name=text]") as HTMLTextAreaElement;

    if (apiUrlElement) apiUrlElement.value = info.apiUrl;
    if (apiTokensElement) apiTokensElement.value = info.apiTokens;

    // Restore previous content
    if (info.open_action === 'upload_image') {
      // Image upload mode
      uploadImage(info.open_content);
    } else if (textareaElement) {
      textareaElement.value = info.open_content;
    }
  });

  // Focus on textarea
  const textareaElement = document.querySelector("textarea[name=text]") as HTMLTextAreaElement;
  if (textareaElement) {
    textareaElement.focus();

    // Handle blur event on textarea
    textareaElement.addEventListener('blur', () => {
      saveConfig({
        open_action: 'save_text',
        open_content: textareaElement.value
      });
    });

    // Send memo with Ctrl+Enter
    textareaElement.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
        const submitButton = document.getElementById('content_submit_text');
        if (submitButton) {
          submitButton.click();
        }
      }
    });
  }

  // Settings save button event listener
  const saveKeyElement = document.getElementById('saveKey');
  const apiUrlElement = document.getElementById('apiUrl') as HTMLInputElement;
  const apiTokensElement = document.getElementById('apiTokens') as HTMLInputElement;
  
  // Function to update save button state based on input
  const updateSaveButtonState = () => {
    if (saveKeyElement && apiUrlElement && apiTokensElement) {
      if (apiUrlElement.value.trim() && apiTokensElement.value.trim()) {
        saveKeyElement.classList.add('has-input');
      } else {
        saveKeyElement.classList.remove('has-input');
      }
    }
  };
  
  // Add input event listeners to update button state
  if (apiUrlElement) {
    apiUrlElement.addEventListener('input', updateSaveButtonState);
  }
  
  if (apiTokensElement) {
    apiTokensElement.addEventListener('input', updateSaveButtonState);
  }
  
  // Initial button state
  updateSaveButtonState();
  
  if (saveKeyElement) {
    saveKeyElement.addEventListener('click', () => {
      if (apiUrlElement && apiTokensElement) {
        const apiUrl = apiUrlElement.value.trim();
        const apiTokens = apiTokensElement.value.trim();
        
        // Validate inputs
        if (!apiUrl) {
          showMessage(chrome.i18n.getMessage("placeApiUrl"));
          return;
        }
        
        if (!apiTokens) {
          showMessage(chrome.i18n.getMessage("invalidToken"));
          return;
        }
        
        // Format API URL
        let formattedApiUrl = apiUrl;
        if (formattedApiUrl.length > 0 && !formattedApiUrl.endsWith('/')) {
          formattedApiUrl += '/';
        }
        
        // Check API status
        fetch(`${formattedApiUrl}api/v1/auth/status`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiTokens}`
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('API status check failed');
          }
          return response.json();
        })
        .then(data => {
          console.log("Auth response:", data);
          
          // Extract user ID from name (format: "users/1") or directly from id
          let userId = null;
          if (data && data.name && data.name.startsWith('users/')) {
            userId = data.name.split('/')[1];
          } else if (data && data.id) {
            userId = data.id;
          }
          
          if (userId) {
            // Save config with user ID
            saveConfig({
              apiUrl: formattedApiUrl,
              apiTokens: apiTokens,
              userid: userId
            }, () => {
              showMessage(chrome.i18n.getMessage("saveSuccess"));
              const blogInfo = document.getElementById('blog_info');
              if (blogInfo) {
                blogInfo.style.display = 'none';
              }
            });
          } else {
            showMessage(chrome.i18n.getMessage("invalidToken"));
          }
        })
        .catch(error => {
          console.error('Error checking API status:', error);
          showMessage(chrome.i18n.getMessage("invalidToken"));
        });
      }
    });
  }

  // Blog info edit button event listener
  const blogInfoEditElement = document.getElementById('blog_info_edit');
  if (blogInfoEditElement) {
    blogInfoEditElement.addEventListener('click', () => {
      const blogInfo = document.getElementById('blog_info');
      if (blogInfo) {
        if (blogInfo.style.display === 'none' || blogInfo.style.display === '') {
          blogInfo.style.display = 'block';
        } else {
          blogInfo.style.display = 'none';
        }
      }
    });
  }

  // Tags button event listener
  const tagsElement = document.getElementById('tags');
  if (tagsElement) {
    tagsElement.addEventListener('click', () => {
      getConfig(async (info) => {
        if (!info.status || !info.apiUrl) {
          showMessage(chrome.i18n.getMessage("placeApiUrl"));
          return;
        }

        try {
          // Get tags
          const tagsData = await getTags(info.userid);
          
          if (!tagsData || !tagsData.tagAmounts || Object.keys(tagsData.tagAmounts).length === 0) {
            showMessage(chrome.i18n.getMessage("searchNone") || "No tags found");
            return;
          }
          
          // Create tags HTML
          let tagDom = "";
          Object.entries(tagsData.tagAmounts).forEach(([tag, _]) => {
            tagDom += `<span class="item-container">#${tag}</span>`;
          });
          
          // Display tags
          const taglistElement = document.getElementById('taglist');
          if (taglistElement) {
            taglistElement.innerHTML = tagDom;
            
            // Toggle display
            if (taglistElement.style.display === 'none' || taglistElement.style.display === '') {
              taglistElement.style.display = 'block';
            } else {
              taglistElement.style.display = 'none';
            }
            
            // Add click event for tag items
            const tagItems = document.querySelectorAll('.item-container');
            tagItems.forEach(item => {
              item.addEventListener('click', () => {
                const tagText = (item as HTMLElement).textContent + " ";
                addTextToTextarea(tagText);
              });
            });
          }
        } catch (error) {
          console.error('Error fetching tags:', error);
          showMessage(chrome.i18n.getMessage("memoFailed") || "Failed to fetch tags");
        }
      });
    });
  }

  // Visibility selector event listener
  const lockElement = document.getElementById('lock');
  if (lockElement) {
    lockElement.addEventListener('click', () => {
      const lockWrapperElement = document.getElementById('lock-wrapper');
      if (lockWrapperElement) {
        lockWrapperElement.classList.toggle('!hidden');
      }
    });
  }

  // Visibility options event listeners
  const lockPrivateElement = document.getElementById('lockPrivate');
  const lockProtectedElement = document.getElementById('lockProtected');
  const lockPublicElement = document.getElementById('lockPublic');
  const lockNowElement = document.getElementById('lock-now');

  if (lockPrivateElement && lockNowElement) {
    lockPrivateElement.addEventListener('click', () => {
      saveConfig({ memo_lock: 'PRIVATE' });
      lockNowElement.textContent = chrome.i18n.getMessage("lockPrivate");
      const lockWrapperElement = document.getElementById('lock-wrapper');
      if (lockWrapperElement) {
        lockWrapperElement.classList.add('!hidden');
      }
    });
  }

  if (lockProtectedElement && lockNowElement) {
    lockProtectedElement.addEventListener('click', () => {
      saveConfig({ memo_lock: 'PROTECTED' });
      lockNowElement.textContent = chrome.i18n.getMessage("lockProtected");
      const lockWrapperElement = document.getElementById('lock-wrapper');
      if (lockWrapperElement) {
        lockWrapperElement.classList.add('!hidden');
      }
    });
  }

  if (lockPublicElement && lockNowElement) {
    lockPublicElement.addEventListener('click', () => {
      saveConfig({ memo_lock: 'PUBLIC' });
      lockNowElement.textContent = chrome.i18n.getMessage("lockPublic");
      const lockWrapperElement = document.getElementById('lock-wrapper');
      if (lockWrapperElement) {
        lockWrapperElement.classList.add('!hidden');
      }
    });
  }

  // Memo submit button event listener
  const submitButton = document.getElementById('content_submit_text');
  
  // Function to update submit button state based on textarea content
  const updateSubmitButtonState = () => {
    if (submitButton && textareaElement) {
      if (textareaElement.value.trim()) {
        submitButton.classList.add('has-input');
      } else {
        submitButton.classList.remove('has-input');
      }
    }
  };
  
  // Add input event listener to update button state
  if (textareaElement) {
    textareaElement.addEventListener('input', updateSubmitButtonState);
    
    // Initial button state
    updateSubmitButtonState();
  }
  
  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      if (!textareaElement || !textareaElement.value.trim()) {
        showMessage(chrome.i18n.getMessage("placeContent"));
        return;
      }

      getConfig(async (info) => {
        if (!info.status) {
          showMessage(chrome.i18n.getMessage("placeApiUrl"));
          return;
        }

        try {
          showMessage(chrome.i18n.getMessage("memoUploading"));
          
          // Get memo visibility
          const visibility = info.memo_lock as Visibility;
          
          // Create memo
          const memo = await createMemo(textareaElement.value, visibility);
          console.log('Created memo:', memo);
          
          // If there are resources, link them to the memo
          if (info.resourceIdList && info.resourceIdList.length > 0) {
            console.log('Resource list to link:', info.resourceIdList);
            
            // メモIDの確認
            if (!memo || !memo.name) {
              console.error('Invalid memo object or missing name:', memo);
              throw new Error('Invalid memo object or missing name');
            }
            
            try {
              // リソースリストの検証
              const validResourceList = info.resourceIdList.filter(item => 
                item && (
                  (item.name && typeof item.name === 'string') || 
                  (item.uid && typeof item.uid === 'string')
                )
              );
              
              if (validResourceList.length === 0) {
                console.warn('No valid resources to link');
              } else {
                console.log('Valid resources to link:', validResourceList);
                await linkResourcesToMemo(memo.name, validResourceList);
                console.log('Resources linked successfully');
              }
            } catch (error) {
              console.error('Error linking resources to memo:', error);
              // リソースのリンクに失敗しても、メモの作成自体は成功したと見なす
            }
          }
          
          // Clear textarea on success
          textareaElement.value = '';
          saveConfig({ 
            open_content: '',
            open_action: '',
            resourceIdList: []
          }, () => {
            showMessage(chrome.i18n.getMessage("memoSuccess"));
          });
        } catch (error) {
          console.error('Error creating memo:', error);
          saveConfig({ 
            open_content: '',
            open_action: '',
            resourceIdList: []
          }, () => {
            showMessage(chrome.i18n.getMessage("memoFailed"));
          });
        }
      });
    });
  }

  // Initialize drag & drop for image upload
  initDrag();

  // Resource upload button event listener
  const upresButton = document.getElementById('upres');
  if (upresButton) {
    upresButton.addEventListener('click', () => {
      const inFileElement = document.getElementById('inFile') as HTMLInputElement;
      if (inFileElement) {
        inFileElement.click();
      }
    });
  }

  // New todo button event listener
  const newTodoButton = document.getElementById('newtodo');
  if (newTodoButton) {
    newTodoButton.addEventListener('click', () => {
      const tagHtml = "- [ ] ";
      addTextToTextarea(tagHtml);
    });
  }

  // Get link button event listener
  const getLinkButton = document.getElementById('getlink');
  if (getLinkButton) {
    getLinkButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab && tab.url && tab.title) {
          const linkHtml = ` [${tab.title}](${tab.url}) `;
          addTextToTextarea(linkHtml);
        } else {
          showMessage(chrome.i18n.getMessage("getTabFailed"));
        }
      });
    });
  }

  // File input change event listener
  const inFileElement = document.getElementById('inFile') as HTMLInputElement;
  if (inFileElement) {
    inFileElement.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        uploadImage(target.files[0]);
      }
    });
  }
});

/**
 * Initialize drag & drop functionality
 */
function initDrag(): void {
  const textareaElement = document.querySelector("textarea[name=text]") as HTMLTextAreaElement;
  if (!textareaElement) return;

  textareaElement.addEventListener('dragenter', (ev) => {
    ev.preventDefault();
    if ((ev.target as HTMLElement).className === 'common-editor-inputer') {
      showMessage(chrome.i18n.getMessage("picDrag"));
      document.body.style.opacity = '0.3';
    }
    (ev.dataTransfer as DataTransfer).dropEffect = 'copy';
  });

  textareaElement.addEventListener('dragover', (ev) => {
    ev.preventDefault();
    (ev.dataTransfer as DataTransfer).dropEffect = 'copy';
  });

  textareaElement.addEventListener('drop', (ev) => {
    ev.preventDefault();
    document.body.style.opacity = '1';
    const files = (ev.dataTransfer as DataTransfer).files;
    if (files && files.length > 0) {
      uploadImage(files[0]);
    }
  });

  textareaElement.addEventListener('dragleave', (ev) => {
    ev.preventDefault();
    if ((ev.target as HTMLElement).className === 'common-editor-inputer') {
      showMessage(chrome.i18n.getMessage("picCancelDrag"));
      document.body.style.opacity = '1';
    }
  });
}

/**
 * Upload an image
 * @param file File to upload
 */
async function uploadImage(file: File | string): Promise<void> {
  // If file is a string (from storage), try to convert it to a File object
  if (typeof file === 'string') {
    try {
      // Try to fetch the file from a URL
      const response = await fetch(file);
      const blob = await response.blob();
      file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error converting string to file:', error);
      showMessage(chrome.i18n.getMessage("picFailed"));
      return;
    }
  }

  showMessage(chrome.i18n.getMessage("picUploading"));

  try {
    // Read file as base64
    const base64String = await readFileAsBase64(file);
    
    // Upload the image
    await uploadImageWithBase64(base64String, file);
  } catch (error) {
    console.error('Error uploading image:', error);
    showMessage(chrome.i18n.getMessage("picFailed"));
    
    // Clear upload state
    saveConfig({
      open_action: '',
      open_content: '',
      resourceIdList: []
    });
  }
}

/**
 * Read a file as base64
 * @param file File to read
 * @returns Base64 string
 */
function readFileAsBase64(file: File): Promise<string> {
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
 * Upload an image with base64 data
 * @param base64String Base64 encoded image data
 * @param file Original file
 */
async function uploadImageWithBase64(base64String: string, file: File): Promise<void> {
  getConfig(async (info) => {
    if (!info.status) {
      showMessage(chrome.i18n.getMessage("placeApiUrl"));
      return;
    }

    // Generate a new filename with timestamp
    const oldName = file.name.split('.');
    const fileExt = file.name.split('.').pop() || '';
    const now = formatDateForFilename();
    const newName = `${oldName[0]}_${now}.${fileExt}`;

    try {
      // Upload the resource using base64
      const resource = await uploadResourceBase64(base64String, newName, file.type);
      
      console.log('Uploaded resource:', resource);
      
      // Add resource to the list
      const resourceList = info.resourceIdList || [];
      
      // リソース情報を適切に保存
      const resourceItem: ResourceItem = {
        name: resource.name || '',
        uid: resource.uid || resource.id || '',
        type: resource.type || ''
      };
      
      console.log('Adding resource to list:', resourceItem);
      resourceList.push(resourceItem);

      // Save resource list
      saveConfig({
        open_action: '',
        open_content: '',
        resourceIdList: resourceList
      }, () => {
        showMessage(chrome.i18n.getMessage("picSuccess"));
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Clear upload state
      saveConfig({
        open_action: '',
        open_content: '',
        resourceIdList: []
      }, () => {
        showMessage(chrome.i18n.getMessage("picFailed"));
      });
    }
  });
}

/**
 * Add text to textarea
 * @param text Text to add
 */
function addTextToTextarea(text: string): void {
  const textarea = document.getElementById('content') as HTMLTextAreaElement;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  
  textarea.value = value.substring(0, start) + text + value.substring(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
} 