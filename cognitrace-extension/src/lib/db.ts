import Dexie, { type Table } from 'dexie';
import type { WritingSession, InputEvent } from '~types';

export class CogniTraceDB extends Dexie {
  sessions!: Table<WritingSession>;
  events!: Table<InputEvent>;

  constructor() {
    super('CogniTraceDB');
    this.version(2).stores({
      sessions: 'id, tabId, url, startTime',
      events: '++id, sessionId, timestamp'
    });
  }
}

export const db = new CogniTraceDB();
