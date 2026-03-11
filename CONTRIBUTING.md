# Contributing to CogniTrace

Thanks for helping improve process-based human authorship verification.

## Scope

- Main contribution target: `cognitrace-extension`
- Demo folders are reference-only unless a maintainer labels an issue otherwise.

## Development Setup

```bash
cd cognitrace-extension
npm ci
npm run check:env
npm run dev
```

## Before Opening a PR

Run:

```bash
npm run lint
npm test
npm run build
```

## Contribution Types

- bug fixes
- test coverage improvements
- adapter reliability across supported editors
- privacy and documentation hardening

## Pull Request Guidelines

- Keep PRs focused and small.
- Include rationale and risk notes.
- Add/update tests for behavior changes.
- Update docs when permissions, data handling, or UX changes.

## Commit Message Style

Use concise imperative messages, for example:

- `fix recorder session reuse on iframe reload`
- `add analyzer fixture for paste-assisted scenario`

## Code of Conduct

By participating, you agree to follow `CODE_OF_CONDUCT.md`.
