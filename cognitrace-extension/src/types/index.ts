export interface WritingSession {
  id: string;
  tabId?: number; // Added for multi-frame session unification
  url: string;
  title: string;
  startTime: number;
  lastActive: number;
  integrityScore: number;
  platform: 'google-docs' | 'word-online' | 'generic';
}

export interface InputEvent {
  id?: number;
  sessionId: string;
  type: 'keydown' | 'keyup' | 'paste' | 'click' | 'focus' | 'input';
  timestamp: number;
  keyType?: 'char' | 'space' | 'backspace' | 'nav' | 'unknown';
  flightTime?: number; // Time since last key release
  dwellTime?: number;  // Time key was pressed
  pasteLen?: number;
}
