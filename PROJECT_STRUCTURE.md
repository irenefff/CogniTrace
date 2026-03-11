# CogniTrace Project Structure and Progress Map

## Track Classification

| Track | Path | Status | Purpose |
|---|---|---|---|
| Mainline | `cognitrace-extension` | Active | Core product implementation and release candidate work |
| Demo V2 | `cognitrace-demo/cognitrace-extension-v2` | Reference only | Scenario simulation and roadshow behavior modeling |
| Demo V1 | `cognitrace-demo/cognitrace-extension-v1` | Legacy | Early prototype architecture and interaction references |
| Roadshow Package | `Roadshow_Package_Final` | Archive | Presentation assets and packaged demo snapshot |

## Progress Snapshot

- Implemented in mainline: recorder, adapter selection, storage, analysis, sidepanel metrics, replay, PDF export.
- In progress / pending: production auth/payment/cloud signing integration, compliance hardening, automated quality gates.
- Primary engineering risk: environment drift and demo/mainline mixing during verification.

## Source-of-Truth Decision

For all future development, testing, and CI:

- Use only `cognitrace-extension` as executable baseline.
- Pull ideas from demo folders only as fixtures or documented references.
- Track quality milestones against mainline scripts, tests, and workflows.
