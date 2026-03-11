# Feedback to Test Mapping

Use this mapping to ensure user evidence updates both product and regression tests.

## Mapping Rules

- If a case changes analyzer expectations, add/update fixtures in `test-fixtures/analyzer`.
- If a case reveals adapter/platform bugs, add targeted integration notes and checks.
- If a case exposes policy confusion, update `docs/store/*` and release checklist.

## Traceability Table

| Case ID | User Scenario | Product Issue | Test Update | Status |
|---|---|---|---|---|
| EXAMPLE-001 | False positive after normal writing | adjust score explanation UI | add fixture and assertion for normal variance | template |

## Definition of Done

- A case is not closed until:
  - product issue is resolved or explicitly rejected
  - corresponding test/document update is linked
  - outcome is communicated back to reporter (when available)
