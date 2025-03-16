import { saveConfig } from '../utils/storage';

// Handler for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Context menu for sending selected text
  chrome.contextMenus.create({
    type: 'normal',
    title: chrome.i18n.getMessage("sendTo"),
    id: 'Memos-send-selection',
    contexts: ['selection']
  });

  // Context menu for sending links
  chrome.contextMenus.create({
    type: 'normal',
    title: chrome.i18n.getMessage("sendLinkTo"),
    id: 'Memos-send-link',
    contexts: ['link', 'page']
  });

  // Context menu for sending images
  chrome.contextMenus.create({
    type: 'normal',
    title: chrome.i18n.getMessage("sendImageTo"),
    id: 'Memos-send-image',
    contexts: ['image']
  });
});

// Handler for context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  let tempCont = '';
  
  // Process based on which menu item was clicked
  switch (info.menuItemId) {
    case 'Memos-send-selection':
      // Get selected text
      tempCont = info.selectionText + '\n';
      break;
    case 'Memos-send-link':
      // Get link URL or page URL
      tempCont = (info.linkUrl || info.pageUrl) + '\n';
      break;
    case 'Memos-send-image':
      // Get image URL in Markdown format
      tempCont = `![](${info.srcUrl})` + '\n';
      break;
  }
  
  // Get current settings
  chrome.storage.sync.get(
    { open_action: "save_text", open_content: '' },
    (items) => {
      if (items.open_action === 'upload_image') {
        // Show warning if image upload is in progress
        alert(chrome.i18n.getMessage("picPending"));
      } else {
        // Save text
        saveConfig({
          open_action: "save_text",
          open_content: items.open_content + tempCont
        });
      }
    }
  );
}); 