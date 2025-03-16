/**
 * Initialize i18n messages for the popup
 */
export function initializeI18n(): void {
  const saveKeyElement = document.getElementById("saveKey");
  const apiUrlElement = document.getElementById("apiUrl") as HTMLInputElement;
  const apiTokensElement = document.getElementById("apiTokens") as HTMLInputElement;
  const contentElement = document.getElementById("content") as HTMLTextAreaElement;
  const lockPrivateElement = document.getElementById("lockPrivate");
  const lockProtectedElement = document.getElementById("lockProtected");
  const lockPublicElement = document.getElementById("lockPublic");
  const contentSubmitTextElement = document.getElementById("content_submit_text");

  if (saveKeyElement) saveKeyElement.textContent = chrome.i18n.getMessage("saveBtn");
  
  if (apiUrlElement) apiUrlElement.placeholder = chrome.i18n.getMessage("placeApiUrl");
  if (apiTokensElement) apiTokensElement.placeholder = chrome.i18n.getMessage("placeApiTokens");
  if (contentElement) contentElement.placeholder = chrome.i18n.getMessage("placeContent");
  
  if (lockPrivateElement) lockPrivateElement.textContent = chrome.i18n.getMessage("lockPrivate");
  if (lockProtectedElement) lockProtectedElement.textContent = chrome.i18n.getMessage("lockProtected");
  if (lockPublicElement) lockPublicElement.textContent = chrome.i18n.getMessage("lockPublic");
  
  if (contentSubmitTextElement) contentSubmitTextElement.textContent = chrome.i18n.getMessage("submitBtn");
} 