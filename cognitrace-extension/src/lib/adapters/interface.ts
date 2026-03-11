export interface PlatformAdapter {
  /**
   * Detect if this adapter is applicable for the current page
   */
  match(url: string): boolean;

  /**
   * Initialize the adapter (find DOM elements, setup specific observers)
   */
  init(): void;

  /**
   * Get the current cursor position (bounding rect)
   * Used for UI following and spatial tracking
   */
  getCursorRect(): DOMRect | null;

  /**
   * Get the current content context (optional)
   * e.g. the current paragraph text, to verify integrity
   */
  getContentContext?(): string;

  /**
   * Cleanup listeners
   */
  destroy(): void;
}
