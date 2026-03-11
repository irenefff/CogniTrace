import { Storage } from "@plasmohq/storage"
import { db } from "~lib/db"
import type { InputEvent, WritingSession } from "~types"

const storage = new Storage()

// In-memory map to track active session ID for each tab
// TabID -> SessionID
const activeSessions = new Map<number, string>();

chrome.runtime.onInstalled.addListener(() => {
  console.log("CogniTrace Extension Installed");
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Clean up sessions when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
    if (activeSessions.has(tabId)) {
        console.log(`Background: Cleaning up session for closed tab ${tabId}`);
        activeSessions.delete(tabId);
    }
});

// Example of listening to messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "INIT_SESSION") {
      const tabId = sender.tab?.id;
      if (!tabId) {
          sendResponse({ success: false, error: "No tab ID found" });
          return true;
      }

      // Check if we already have an active session for this tab
      if (activeSessions.has(tabId)) {
          console.log(`Background: Reusing existing session ${activeSessions.get(tabId)} for tab ${tabId}`);
          sendResponse({ success: true, sessionId: activeSessions.get(tabId), isNew: false });
          return true;
      }

      // Create new session
      const newSessionId = crypto.randomUUID();
      const sessionData: WritingSession = {
          ...message.payload,
          id: newSessionId,
          tabId: tabId,
          startTime: Date.now(),
          lastActive: Date.now(),
          integrityScore: 100
      };

      db.sessions.add(sessionData)
          .then(() => {
              activeSessions.set(tabId, newSessionId);
              console.log(`Background: Created new session ${newSessionId} for tab ${tabId}`);
              sendResponse({ success: true, sessionId: newSessionId, isNew: true });
          })
          .catch(err => {
              console.error("Background: Failed to create session", err);
              sendResponse({ success: false, error: err.message });
          });
      
      return true; // Async
  }

  if (message.action === "open_side_panel") {
     // @ts-ignore - sidePanel.open is available in Chrome 116+
     if (sender.tab?.windowId) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
     }
  }
  
  if (message.type === "EVENT_LOG") {
    // Handle event logging or forward to sidepanel
    console.log("Event received:", message.payload);
  }

  // Handle saving sessions
  if (message.type === "SAVE_SESSION") {
    db.sessions.add(message.payload as WritingSession)
      .then(() => sendResponse({ success: true }))
      .catch((err) => {
        console.error("Failed to save session:", err)
        sendResponse({ success: false, error: err.message })
      })
    return true // Async response
  }

  // Handle saving events
  if (message.type === "SAVE_EVENTS") {
    const events = message.payload as InputEvent[];
    if (!events || events.length === 0) {
        console.log("Background: Received empty event list, skipping save.");
        sendResponse({ success: true, skipped: true });
        return true;
    }

    db.events.bulkAdd(events)
      .then(() => {
        console.log(`Background: Saved ${events.length} events for session ${events[0].sessionId}`)
        sendResponse({ success: true })
      })
      .catch((err) => {
        console.error("Failed to save events:", err)
        sendResponse({ success: false, error: err.message })
      })
    return true // Async response
  }

  // Handle getting event count
  if (message.type === "GET_EVENT_COUNT") {
    db.events.count()
      .then((count) => sendResponse({ count }))
      .catch((err) => {
        console.error("Failed to get count:", err)
        sendResponse({ count: 0, error: err.message })
      })
    return true // Async response
  }

  // Handle getting all sessions
  if (message.type === "GET_SESSIONS") {
    db.sessions.orderBy('startTime').reverse().toArray()
      .then((sessions) => sendResponse({ sessions }))
      .catch((err) => {
        console.error("Failed to get sessions:", err)
        sendResponse({ sessions: [], error: err.message })
      })
    return true // Async response
  }

  // Handle getting sessions with event counts
  if (message.type === "GET_SESSIONS_WITH_STATS") {
    console.log("Background: Handling GET_SESSIONS_WITH_STATS");
    db.sessions.orderBy('startTime').reverse().limit(10).toArray()
      .then(async (sessions) => {
        console.log(`Background: Found ${sessions.length} sessions`);
        const sessionsWithStats = await Promise.all(sessions.map(async (s) => {
            const count = await db.events.where('sessionId').equals(s.id).count();
            return { ...s, eventCount: count };
        }));
        console.log("Background: Sessions with stats:", sessionsWithStats);
        sendResponse({ sessions: sessionsWithStats });
      })
      .catch((err) => {
        console.error("Failed to get sessions with stats:", err)
        sendResponse({ sessions: [], error: err.message })
      })
    return true // Async response
  }

  // Handle getting events by session ID
  if (message.type === "GET_EVENTS_BY_SESSION") {
    const sessionId = message.payload;
    if (!sessionId) {
        sendResponse({ events: [], error: "Session ID required" });
        return true;
    }
    
    db.events.where('sessionId').equals(sessionId).sortBy('timestamp')
      .then((events) => sendResponse({ events }))
      .catch((err) => {
        console.error("Failed to get events:", err)
        sendResponse({ events: [], error: err.message })
      })
    return true // Async response
  }
});
