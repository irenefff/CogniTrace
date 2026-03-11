# Open Source Scope Boundary

This document defines what should be published in the public CogniTrace repository.

## Public (Open Source) Scope

- `cognitrace-extension/src`
- `cognitrace-extension/test-fixtures`
- `cognitrace-extension/docs/store` (policy and launch docs that match public behavior)
- root governance files (`LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`)
- CI workflow files in `.github/workflows`

## Private (Do Not Open Source by Default)

- commercialization strategy and financial documents
- roadshow pitch decks and business-only narratives
- future backend plans not implemented in this repository
- any file containing real private credentials or customer data

## Current Private-leaning Files in This Workspace

- `Chrome_Extension_Commercialization_Plan.md`
- `AI 检测项目商业计划书设计.md`
- `Roadshow_Package_Final/**`

## Public Release Rule

If a document claims a capability, one of the following must be true:

1. implemented and testable in `cognitrace-extension`, or
2. clearly marked as roadmap/beta/mock.

## Pre-publication Checklist

- [ ] Run secret scan and confirm no credentials are tracked.
- [ ] Ensure privacy policy and data-use statements match code behavior.
- [ ] Verify extension permissions are minimal and documented.
- [ ] Ensure demo-only code is not presented as production capability.
