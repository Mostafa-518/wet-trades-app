import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['class'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitizes text content to prevent injection attacks
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

/**
 * Creates safe text content for display
 */
export const createSafeTextContent = (element: HTMLElement, text: string): void => {
  element.textContent = sanitizeText(text);
};

/**
 * Validates and sanitizes user input
 */
export const validateUserInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Trim and limit length
  const trimmed = input.trim().substring(0, maxLength);
  
  // Sanitize the input
  return sanitizeText(trimmed);
};