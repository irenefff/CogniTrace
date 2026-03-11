// Removed unused import
import type { InputEvent, WritingSession } from '~types';
import type { PlatformAdapter } from './adapters/interface';
import { GoogleDocsAdapter } from './adapters/google-docs';
import { GenericAdapter } from './adapters/generic';

export class Recorder {
  private sessionId: string | null = null;
  private lastKeyUpTime: number = 0;
  private keyDownMap: Map<string, number> = new Map(); // code -> timestamp
  private isRecording: boolean = false;
  private buffer: InputEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly FLUSH_DELAY = 2000;
  
  private adapter: PlatformAdapter | null = null;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }
  
  private initAdapter() {
      const url = window.location.href;
      if (new GoogleDocsAdapter().match(url)) {
          this.adapter = new GoogleDocsAdapter();
      } else {
          this.adapter = new GenericAdapter();
      }
      this.adapter.init();
      console.log('CogniTrace: Adapter initialized', this.adapter.constructor.name);
  }

  public async start() {
    if (this.isRecording) return;
    
    this.initAdapter(); // Initialize adapter on start

    // Get session ID from background (unified for all frames in tab)
    try {
        const response = await chrome.runtime.sendMessage({
            type: "INIT_SESSION",
            payload: {
                url: window.location.href,
                title: document.title,
                platform: this.detectPlatform()
            }
        });

        if (response && response.success) {
            this.sessionId = response.sessionId;
            console.log(`CogniTrace Recorder started [Unified Session]: ${this.sessionId} (New: ${response.isNew})`);
        } else {
            console.error("CogniTrace: Failed to init unified session", response?.error);
            // Fallback to local session ID (legacy behavior)
            this.sessionId = crypto.randomUUID();
            console.warn(`CogniTrace: Falling back to local session ID: ${this.sessionId}`);
        }
    } catch (e) {
        console.error("CogniTrace: Failed to contact background for session", e);
        this.sessionId = crypto.randomUUID();
    }

    this.isRecording = true;
    this.lastKeyUpTime = Date.now();
    
    // Legacy: We don't save session here anymore, Background handles it.
    
    this.attachListeners();
    this.startFlushing();
  }

  public stop() {
    if (!this.isRecording) return;
    
    this.detachListeners();
    this.stopFlushing();
    this.flushBuffer();
    
    if (this.adapter) {
        this.adapter.destroy();
        this.adapter = null;
    }

    this.isRecording = false;
    this.sessionId = null;
    console.log('CogniTrace Recorder stopped');
  }

  private attachListeners() {
    // Using capture phase (true) is critical for Google Docs
    const options = { capture: true };
    
    // Attach to window
    window.addEventListener('keydown', this.handleKeyDown, options);
    window.addEventListener('keyup', this.handleKeyUp, options);
    // Remove window paste listener to avoid duplication with document listener
    // window.addEventListener('paste', this.handlePaste, options); 
    window.addEventListener('input', this.handleInput, options);

    // Also attach to document (redundancy for iframes)
    document.addEventListener('keydown', this.handleKeyDown, options);
    document.addEventListener('keyup', this.handleKeyUp, options);
    document.addEventListener('paste', this.handlePaste, options); // Keep this one

    console.log(`CogniTrace [${window.location.origin}] Listeners attached to WINDOW & DOCUMENT`);
  }

  private detachListeners() {
    const options = { capture: true } as any; 
    
    window.removeEventListener('keydown', this.handleKeyDown, options);
    window.removeEventListener('keyup', this.handleKeyUp, options);
    window.removeEventListener('paste', this.handlePaste, options);
    window.removeEventListener('input', this.handleInput, options);
    
    document.removeEventListener('keydown', this.handleKeyDown, options);
    document.removeEventListener('keyup', this.handleKeyUp, options);
    document.removeEventListener('paste', this.handlePaste, options);
  }

  private detectPlatform(): 'google-docs' | 'word-online' | 'generic' {
    const host = window.location.hostname;
    if (host.includes('docs.google.com')) return 'google-docs';
    if (host.includes('office.live.com') || host.includes('word.office.com')) return 'word-online';
    return 'generic';
  }

  private getKeyType(key: string): 'char' | 'space' | 'backspace' | 'nav' | 'unknown' {
    if (key.length === 1) return key === ' ' ? 'space' : 'char';
    if (key === 'Backspace' || key === 'Delete') return 'backspace';
    if (key.startsWith('Arrow') || key === 'Home' || key === 'End') return 'nav';
    return 'unknown';
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Debug Log: Always log keydown to prove listeners are working
    console.log(`CogniTrace RAW KeyDown: ${e.code} in [${window.location.href}]`);

    if (!this.sessionId) return;
    
    // In Google Docs, input events might be consumed by the editor's event handlers
    // We need to ensure we're capturing events even if stopPropagation was called
    // 'true' in addEventListener (capture phase) should handle this, but let's debug
    
    const now = Date.now();
    const code = e.code;
    
    // Calculate flight time (time since last key up)
    let flightTime = 0;
    if (this.lastKeyUpTime > 0) {
      flightTime = now - this.lastKeyUpTime;
    }
    
    // Record key down time for dwell time calculation
    if (!e.repeat) {
        this.keyDownMap.set(code, now);
    }

    const event: InputEvent = {
      sessionId: this.sessionId,
      type: 'keydown',
      timestamp: now,
      keyType: this.getKeyType(e.key),
      flightTime: flightTime > 0 ? flightTime : undefined
    };

    this.buffer.push(event);
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (!this.sessionId) return;

    const now = Date.now();
    const code = e.code;
    this.lastKeyUpTime = now;

    let dwellTime = 0;
    if (this.keyDownMap.has(code)) {
      const downTime = this.keyDownMap.get(code)!;
      dwellTime = now - downTime;
      this.keyDownMap.delete(code);
    }

    const event: InputEvent = {
      sessionId: this.sessionId,
      type: 'keyup',
      timestamp: now,
      keyType: this.getKeyType(e.key),
      dwellTime: dwellTime > 0 ? dwellTime : undefined
    };

    this.buffer.push(event);
  }

  private handlePaste(e: ClipboardEvent) {
    if (!this.sessionId) return;
    
    const pasteContent = e.clipboardData?.getData('text') || '';
    
    const event: InputEvent = {
      sessionId: this.sessionId,
      type: 'paste',
      timestamp: Date.now(),
      pasteLen: pasteContent.length
    };
    
    this.buffer.push(event);
  }

  private handleInput(e: Event) {
      // Input events capture the result of the keypress/composition
      // Useful for integrity checks, but keydown/up are primary for biometrics
  }

  private startFlushing() {
    this.flushInterval = setInterval(() => this.flushBuffer(), this.FLUSH_DELAY);
  }

  private stopFlushing() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  private async flushBuffer() {
    console.log(`CogniTrace [${window.location.origin}] Flushing buffer. Count: ${this.buffer.length}`);
    if (this.buffer.length === 0) return;
    
    const eventsToSave = [...this.buffer];
    this.buffer = [];
    
    try {
      // Send to background instead of direct DB write
      await chrome.runtime.sendMessage({
        type: "SAVE_EVENTS",
        payload: eventsToSave
      });
      console.log(`CogniTrace Recorder [${window.location.origin}]: Sent ${eventsToSave.length} events to background`);
      
      // Update session last active
    } catch (err) {
      console.error('CogniTrace: Failed to save events', err);
      // Put events back in buffer if save failed? 
      // For now, just log error to avoid infinite loops if DB is broken
    }
  }
}

export const recorder = new Recorder();
