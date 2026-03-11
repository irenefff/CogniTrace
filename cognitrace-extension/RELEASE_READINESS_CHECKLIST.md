# CogniTrace Extension Release Readiness Checklist

Use this list before any beta/store submission.

## 1) Build and Quality Gates

- [ ] `npm ci` succeeds on a clean machine.
- [ ] `npm run check:env` passes with supported Node baseline.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` and `npm run package` both succeed.

## 2) Privacy and Data Governance

- [ ] Data captured is documented (keystroke metadata, paste length, timestamps, session metadata).
- [ ] No raw sensitive user content is persisted unless explicitly designed and disclosed.
- [ ] Data retention policy and local deletion behavior are documented.
- [ ] Privacy policy links match behavior in implementation.

## 3) Chrome Extension Permissions Review

- [ ] `manifest` permissions are minimal and justified.
- [ ] `host_permissions` are explained in user-facing docs/store listing.
- [ ] Side panel behavior and content script scope are validated on target sites.

## 4) Store Materials Consistency

- [ ] Extension name/description are consistent across package metadata and store copy.
- [ ] Icons/screenshots use current UI and feature set.
- [ ] Policy/website/support links are valid and reachable.

## 5) Virtual-Environment Scenario Validation

- [ ] Scenario matrix in `TEST_SCENARIO_MATRIX.md` is reviewed and up to date.
- [ ] Analyzer fixtures in `test-fixtures/analyzer` reflect current detection assumptions.
- [ ] Integrity score behavior is validated for S1-S4 in automated tests.

## 6) Release Traceability

- [ ] Planned milestones are mapped to issues/tasks with owners.
- [ ] Build artifact version aligns with release note version.
- [ ] Known limitations are documented for stakeholders.
