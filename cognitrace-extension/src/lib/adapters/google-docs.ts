import type { PlatformAdapter } from "./interface";

export class GoogleDocsAdapter implements PlatformAdapter {
  private editorElement: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private cursorElement: HTMLElement | null = null;

  match(url: string): boolean {
    return url.includes("docs.google.com/document");
  }

  init(): void {
    console.log("CogniTrace: Initializing Google Docs Adapter");
    
    // Attempt to find the Kix editor or A11y container
    // Google Docs structure is complex and changes, but 'kix-appview-editor' is common
    // The accessibility iframe is also a target, but often cross-origin restricted if it's an iframe.
    // However, the canvas rendering usually has a DOM cursor companion for A11y.
    
    // Wait for DOM to be ready if needed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            this.findEditor();
            this.startObservation();
        });
    } else {
        this.findEditor();
        this.startObservation();
    }
  }

  private findEditor() {
    // Retry logic could be implemented here if the editor loads lazily
    this.editorElement = document.querySelector(".kix-appview-editor") as HTMLElement;
    
    if (!this.editorElement) {
        // Fallback 1: The main canvas container
        this.editorElement = document.querySelector(".kix-canvas-tile-content") as HTMLElement;
    }

    if (!this.editorElement) {
        // Fallback 2: The entire document body (for broad capture)
        // This is necessary because Google Docs captures events at the body/document level
        this.editorElement = document.body;
        console.log("CogniTrace: Using document.body as editor fallback");
    }
    
    if (this.editorElement) {
        console.log("CogniTrace: Editor element found", this.editorElement.className || this.editorElement.tagName);
    } else {
        console.warn("CogniTrace: Google Docs editor element not found");
    }
  }

  private startObservation() {
    if (!this.editorElement) return;

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // In a real A11y attack, we would parse these mutations
        // to reconstruct the document model or verify text changes.
        // For now, we just log that A11y tree is active.
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
             // This confirms the A11y tree is updating in response to user input
        }
      }
      
      // Update cursor reference if needed
      this.updateCursorRef();
    });

    this.observer.observe(this.editorElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'], // Cursor moves often change style (left/top)
      characterData: true
    });
  }

  private updateCursorRef() {
    // Google Docs often uses a div with class 'kix-cursor-caret'
    const cursor = document.querySelector(".kix-cursor-caret");
    if (cursor) {
        this.cursorElement = cursor as HTMLElement;
    }
  }

  getCursorRect(): DOMRect | null {
    // 1. Try to find the specific cursor element
    if (this.cursorElement) {
        return this.cursorElement.getBoundingClientRect();
    }
    
    // 2. Try to re-query
    const cursor = document.querySelector(".kix-cursor-caret");
    if (cursor) {
        this.cursorElement = cursor as HTMLElement;
        return cursor.getBoundingClientRect();
    }

    // 3. Fallback for A11y: sometimes the active element in the A11y tree 
    // tracks the cursor, but usually that's off-screen.
    
    return null;
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.editorElement = null;
    this.cursorElement = null;
  }
}
