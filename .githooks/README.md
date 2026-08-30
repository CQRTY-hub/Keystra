# Local secret scanning (gitleaks)

Why this exists: GitHub's own secret-scanning push protection isn't available for a
private repo on a personal (non-Enterprise) account — see the "GitHub push protection"
discussion in project history. This is the replacement: a local pre-commit check that
scans whatever is staged for hardcoded secrets before the commit is even made.

## One-time setup (per clone / per laptop)

1. Install gitleaks:
   ```
   winget install --id Gitleaks.Gitleaks --exact
   ```
   Then restart your terminal so `gitleaks` is on PATH.
2. Point git at this tracked hooks folder (git ignores `.githooks/` by default —
   `.git/hooks/` is the default location, but that folder isn't committed, so every
   clone needs this one-time command):
   ```
   git config core.hooksPath .githooks
   ```

That's it — every `git commit` from then on runs `gitleaks protect --staged` first.

## What happens on a real hit

The commit is blocked and gitleaks prints which file/line matched and which rule
(e.g. `stripe-access-token`, `aws-access-token`, `generic-api-key`). Remove or replace
the secret, then commit again. If it's a genuine false positive, see gitleaks' own docs
for `.gitleaksignore` / allowlisting a specific fingerprint — don't just disable the hook.

## What happens if gitleaks isn't installed

The hook detects that and lets the commit through anyway, with a warning — it fails
open, not closed, so a fresh clone without gitleaks installed yet doesn't get silently
blocked from committing anything. Install gitleaks (step 1 above) to actually get the
protection.

## Verified 2026-08-30

- Full repository history scanned with `gitleaks git --log-opts="--all"`: no leaks found.
- Hook tested against a fake Stripe-style key: blocked the commit, exit code 1, as
  expected. Tested against a missing-gitleaks PATH: let the commit through with a
  warning, as designed.
