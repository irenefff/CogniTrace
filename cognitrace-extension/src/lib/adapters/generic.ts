import type { PlatformAdapter } from "./interface";

export class GenericAdapter implements PlatformAdapter {
  match(url: string): boolean {
    return true; // Default fallback
  }

  init(): void {
    // Standard DOM requires no special initialization for basic tracking
  }

  getCursorRect(): DOMRect | null {
    // Try to get coordinates from the current selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      return range.getBoundingClientRect();
    }
    return null;
  }

  destroy(): void {
    // No-op
  }
}
