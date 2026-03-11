# Virtual Environment Challenge Scenario Matrix

This matrix defines reusable verification scenarios for authorship integrity behavior.

## Scope

- Baseline track: `cognitrace-extension`
- Fixture data folder: `test-fixtures/analyzer`
- Goal: make human-vs-synthetic signals reproducible across local and CI environments

## Scenario Matrix

| ID | Scenario | Input Pattern | Expected Signal | Target Risk |
|---|---|---|---|---|
| S1 | Normal writing | Keystrokes with variable flight times and low paste volume | Medium/high entropy, high integrity score | False positives against genuine writing |
| S2 | Paste-assisted writing | Typed intro with one medium paste segment | Non-zero paste ratio, integrity score drops but not to zero | Over-penalizing normal citation workflow |
| S3 | Bot-like burst | Repeated fast key events + multiple bulk paste events | Low entropy trend and strong integrity penalty | Missing synthetic automation patterns |
| S4 | Google Docs adaptation | Event stream with focus/input transitions and occasional paste | Stable active time accounting and expected score range | Platform-specific adapter side effects |

## Fixture Mapping

- `test-fixtures/analyzer/normal-writing.json` -> S1
- `test-fixtures/analyzer/paste-assisted.json` -> S2
- `test-fixtures/analyzer/bot-attack.json` -> S3
- `test-fixtures/analyzer/google-docs-mixed.json` -> S4

## Threshold Guidance

- S1 integrity score should remain high (`>= 85`).
- S2 integrity score should be moderate (`45-90`) depending on paste volume.
- S3 integrity score should be low (`<= 40`).
- S4 should keep stable non-zero active time and non-extreme scoring (`30-95`).
