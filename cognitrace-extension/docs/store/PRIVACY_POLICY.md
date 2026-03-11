# CogniTrace Privacy Policy (Draft for Chrome Web Store)

Last updated: 2026-03-11

## 1. What CogniTrace Does

CogniTrace helps users generate process-based evidence of human writing activity.
It records interaction metadata during active recording sessions and visualizes analysis locally.

## 2. Data We Process

When recording is ON, CogniTrace may process:

- keystroke event categories (`char`, `space`, `backspace`, `nav`)
- timing metadata (flight time, dwell time, event timestamp)
- paste event length (character count only)
- session metadata (page URL, page title, platform type)

CogniTrace does not intentionally collect account passwords or full clipboard history.

## 3. Local-First Storage

- Session and event data are stored locally in the browser (IndexedDB).
- Recording is opt-in and can be toggled from the extension popup.
- Users can stop recording at any time.

## 4. Data Sharing

Current MVP does not require mandatory cloud upload for core local analysis.
If future optional cloud-signing features are enabled, this policy will be updated before release.

## 5. Permissions Rationale

- `storage`: save recording state and local analysis data.
- `tabs`: read active tab metadata needed for session labeling.
- `sidePanel`: show the CogniTrace dashboard.
- host access (Google Docs / Word Online domains): inject recorder on supported writing surfaces.

## 6. Retention and Deletion

Users can remove extension data through:

1. browser extension storage reset/removal
2. uninstalling the extension

Future versions may provide in-product data deletion controls.

## 7. Contact

For privacy requests or concerns: replace-with-real-support@cognitrace.ai
