/**
 * Message options interface
 */
export interface MessageOptions {
  message: string;
  time?: number;
  autoClose?: boolean;
  onClose?: () => void;
}

/**
 * Show a message notification
 * @param options Message options or message string
 */
export function showMessage(options: MessageOptions | string): void {
  const defaults: MessageOptions = {
    message: ' Success',
    time: 2000,
    autoClose: true,
    onClose: () => {}
  };

  if (typeof options === 'string') {
    defaults.message = options;
  } else {
    Object.assign(defaults, options);
  }

  // Message template
  const template = `<div class="tip animate bounceIn">
    <p class="tip-info">${defaults.message}</p>
  </div>`;

  // Remove existing messages
  const existingMessages = document.querySelectorAll('.tip');
  existingMessages.forEach(element => element.remove());

  // Create and append new message
  const messageElement = document.createElement('div');
  messageElement.innerHTML = template;
  const tipElement = messageElement.firstChild as HTMLElement;
  document.body.appendChild(tipElement);

  // Center the message
  if (tipElement) {
    tipElement.style.marginLeft = `-${tipElement.offsetWidth / 2}px`;
  }

  let timer: number | undefined;

  // Auto close
  if (defaults.autoClose) {
    timer = window.setTimeout(() => {
      closeFn();
    }, defaults.time);
  }

  // Close function
  const closeFn = () => {
    if (tipElement) {
      tipElement.classList.add('hide');
      tipElement.remove();
    }
    if (defaults.onClose) {
      defaults.onClose();
    }
    if (timer) clearTimeout(timer);
  };
} 