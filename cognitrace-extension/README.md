# CogniTrace Extension (Mainline)

This is the active implementation track for CogniTrace.
It is positioned as a proof-of-process tool for human writing workflows.

## Environment Contract

- Node.js: `20.11+` and `<21` (see `.nvmrc`)
- Package manager: `npm` (lockfile source of truth: `package-lock.json`)
- Install command: `npm ci`

## Local Setup

```bash
npm ci
npm run check:env
npm run dev
```

## Quality Commands

```bash
npm run lint
npm test
npm run healthcheck
```

## Build and Package

```bash
npm run build
npm run package
```

Load unpacked extension from `build/chrome-mv3-dev` in Chrome developer mode.

## MVP Surface Scope

- Google Docs: `https://docs.google.com/*`
- Word Online: `https://word.office.com/*`, `https://*.officeapps.live.com/*`

## Store and Policy Docs

- `docs/store/PRIVACY_POLICY.md`
- `docs/store/DATA_USE_DISCLOSURE.md`
- `docs/store/STORE_LISTING_DRAFT.md`
- `docs/store/SUBMISSION_RUNBOOK.md`
