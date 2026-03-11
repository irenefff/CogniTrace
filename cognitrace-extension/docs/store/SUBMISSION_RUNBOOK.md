# Chrome Web Store Submission Runbook (MVP)

## 1) Pre-submit Checks

Run from `cognitrace-extension`:

```bash
npm ci
npm run ci:verify
npm run package
```

Confirm:

- no demo artifacts are used for upload
- only `cognitrace-extension` package output is submitted
- store copy matches current MVP behavior

## 2) Permissions and Scope Audit

- Verify `package.json` manifest permissions are minimal.
- Verify supported hosts are limited to intended MVP domains.
- Verify recording default is OFF and user-initiated.

## 3) Policy Material Preparation

- Privacy policy page published from `docs/store/PRIVACY_POLICY.md`
- Data use answers prepared from `docs/store/DATA_USE_DISCLOSURE.md`
- Listing text prepared from `docs/store/STORE_LISTING_DRAFT.md`
- Support contact and URL finalized

## 4) Asset Checklist

- extension icon set
- screenshots of popup, side panel, replay, certificate export
- optional promo tile

## 5) Submission

1. Upload packaged zip from production build output.
2. Fill listing metadata and category.
3. Complete privacy questionnaire.
4. Submit for review.

## 6) Post-submit Monitoring

- Track review status daily.
- Prepare a quick-fix branch for policy-related review feedback.
- Log all reviewer feedback in release notes for next iteration.
