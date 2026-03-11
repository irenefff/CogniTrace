import type { PlasmoCSConfig } from "plasmo"
import { recorder } from "~lib/recorder"
import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: [
    "https://docs.google.com/*",
    "https://word.office.com/*",
    "https://*.officeapps.live.com/*"
  ],
  all_frames: true,
  run_at: "document_start"
}

const storage = new Storage()

const initRecorder = async () => {
  const isTop = window === window.top;
  const url = window.location.href;
  
  // Strict frame filtering to avoid noise
  // 1. Top frame (main document)
  // 2. Google Docs editor iframe (usually about:blank or docs.google.com with no src in some contexts)
  // We can try to detect editor by looking for specific elements or assuming about:blank frames in docs might be editors
  // But for now, let's be restrictive: Top frame OR frames that are explicitly docs.google.com
  
  const isDocs = url.includes('docs.google.com');
  const isEditorFrame = !isTop && (url === 'about:blank' || isDocs);
  
  if (!isTop && !isEditorFrame) {
      // Skip irrelevant iframes (like accounts.google.com, clients6.google.com, etc.)
      console.log("%c CogniTrace: Skipping iframe (Filtered)", "color: gray", url);
      return;
  }

  console.log(`%c CogniTrace Content Script Loaded [${isTop ? 'TOP' : 'IFRAME'}] ${url}`, 'background: #222; color: #bada55; font-size: 14px');
  
  // Watch for recording state changes
  storage.watch({
    "is_recording": (c) => {
      console.log("CogniTrace: Recording state changed:", c.newValue);
      if (c.newValue === true) {
        recorder.start().catch(err => console.error("CogniTrace: Start failed", err));
      } else {
        recorder.stop();
      }
    }
  })

  // Check initial state
  try {
      const isRecording = await storage.get("is_recording") ?? false; // Opt-in by default
      console.log("CogniTrace: Initial recording state:", isRecording);
      
      if (isRecording) {
        recorder.start().catch(err => {
          console.error("Failed to start CogniTrace recorder:", err);
        });
      }
  } catch (e) {
      console.error("CogniTrace: Failed to get storage state", e);
      // Safety-first: do not auto-start when storage read fails
  }
}

initRecorder();

// Optional: Handle page unload to flush remaining events
window.addEventListener("beforeunload", () => {
  recorder.stop();
});
