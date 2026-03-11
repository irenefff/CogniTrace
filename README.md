# CogniTrace

Proof-of-process infrastructure for human intellectual work in the AI and agent era.

CogniTrace focuses on **how** a document is created, not only the final output.
The current open-source baseline is a Chrome extension that captures writing-process signals (local-first), analyzes session behavior, and exports process evidence.

## Why CogniTrace

Output-only AI detectors can be unreliable in real workflows.
CogniTrace aims to provide transparent process evidence for:

- students and writers facing false-positive anxiety
- educators or reviewers needing explainable context
- creators and teams proving human-led production

## Current MVP Scope

- Supported surfaces:
  - Google Docs (`https://docs.google.com/*`)
  - Word Online (`https://word.office.com/*`, `https://*.officeapps.live.com/*`)
- Core capabilities:
  - event capture and local session storage
  - process analysis and integrity scoring
  - replayable timeline
  - exportable MVP certificate

## Repository Structure

- `cognitrace-extension`: active implementation track (source of truth)
- `.github`: CI and community templates
- `docs` under `cognitrace-extension`: store policy and launch documentation

## Quick Start

```bash
cd cognitrace-extension
npm ci
npm run check:env
npm run dev
```

## Quality Checks

```bash
npm run lint
npm test
npm run build
```

## Docs

- Public narrative: `PUBLIC_NARRATIVE.md`
- Public roadmap: `ROADMAP_PUBLIC.md`
- Open-source boundary: `OPEN_SOURCE_SCOPE.md`
- Store launch runbook: `cognitrace-extension/docs/store/SUBMISSION_RUNBOOK.md`

## Important Notes

- Recording is opt-in and can be toggled in extension popup.
- Privacy and data-use docs are included for Chrome Web Store readiness.
- Features labeled beta/mock are not cryptographic guarantees yet.
