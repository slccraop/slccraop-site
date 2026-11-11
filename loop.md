# SLCCRAOP build loop
# READ-ONLY for Cline. Never edit this file. Record progress in slccraop-site\docs\PROGRESS.md.
# Specification: SLCCRAOP_BUILD_MANUAL.md (task IDs below match its section 7). Rules: .clinerules.

## How to run the loop
1. Run in PowerShell from E:\SLCCRAOP. Confirm the shell first (see .clinerules section 3).
2. Read .clinerules, this file, the manual and the design file.
3. Open slccraop-site\docs\PROGRESS.md (create it in task L0). Find the first task not marked done.
4. Do that task fully, following the manual section named. Run lint, typecheck, tests and build.
5. Update PROGRESS.md with an honest report. Commit locally.
6. If the task needs a decision or asset not already answered, ask the owner (batched, with a recommended default), wait, then continue.
7. At a GATE, stop and give the owner a short plain-language summary and ask to proceed.
8. Repeat until every task is done. Do not skip, reorder or merge tasks.

## Tasks

### Phase L: Setup
- L0 Create E:\SLCCRAOP\slccraop-site (Test-Path first). Inside it: git init, docs\PROGRESS.md, docs\DECISIONS.md, docs\SECURITY.md, docs\RUNBOOK.md, docs\LEGAL_TODO.md, docs\REQUESTED_CHANGES.md, docs\CHANGELOG.md. Copy the manual to docs\BUILD_MANUAL.md and the design file to design\ (copies only).
- L1 Check Node.js and npm versions in PowerShell. If missing or too old, ask the owner to install the current LTS; do not install system software yourself.

### Phase 0: Foundation (manual T0.1 to T0.4)
- T0.1 to T0.4 as the manual. Rebuild the design file as the app shell, header, footer, theme tokens, language switcher. Ask the owner for logo, favicon and brand preferences.

### Phase 1: Database and security core (T1.1 to T1.7)
- Migrations, helper functions, RLS, private storage, append-only audit log, fake seed, RLS test suite.
- GATE 1: summarise the security design and RLS test results. Ask the owner to approve.

### Phase 2: Public site (T2.1 to T2.5)
- Ledger table and mobile cards exactly in the design file's style, ticker, static pages, referral hub with [VERIFY] placeholders, intake and emergency banners.

### Phase 3: Intake (T3.1 to T3.6)
- submit-report and finalize-evidence functions, multi-step report form, evidence upload, tracking-code add and withdraw, minors path, identifier hashing.
- GATE 2: describe how to test the full flow locally with fake data. Ask the owner to try it.

### Phase 4: Admin core (T4.1 to T4.8)
- Staff login with TOTP, roles, triage queue, case view, duplicate merge, intake controls, quarantine, audit viewer.

### Phase 5: Authority tracking and ledger (T5.1 to T5.8)
- Authorities, events, statuses, publish-to-ledger with linter, stats, reminders, resubmit, revocation stats, dossier export.
- GATE 3: show the public ledger output and confirm no field outside Appendix C is exposed.

### Phase 6: Wayback queue (T6.1)
- Approval queue and integration as the manual. Ask the owner for the Internet Archive keys only when this task starts.

### Phase 7: Hardening (T7.1 to T7.7)
- Headers and CSP, dependency and secret audit, accessibility, performance, backup and restore scripts in PowerShell, log review, security checklist.
- GATE 4: tell the owner an independent human security review is required before any real report is accepted. Do not mark launch-ready.

### Phase 8: Packaging for go-live (new tasks)
- P8.1 Make the site folder self-contained and upload-ready: root .gitignore, no secrets, no node_modules, no build output, README with plain steps.
- P8.2 Cloudflare Pages: confirm build command and output folder, add the _headers file, add SPA fallback rules.
- P8.3 Supabase: complete, ordered migrations; Edge Functions ready to deploy; a PowerShell script (scripts\setup-supabase.ps1) that applies migrations and deploys functions using the Supabase CLI through npx, asking for the project reference interactively. Never store keys in files.
- P8.4 Write DEPLOY.md in plain language for a non-developer: create free Supabase and Cloudflare accounts, create the Turnstile site, which keys go where, exact click-by-click steps, how to upload the folder to GitHub, how to connect Cloudflare Pages, how to create the first staff user and enrol TOTP, how to switch intake open and closed.
- P8.5 Add scripts\preflight.ps1: checks required environment variable names exist, build passes, tests pass, no secrets in files, then prints a go-live checklist.
- P8.6 Final accuracy pass: list every [VERIFY] and [LEGAL REVIEW] item still open in docs\LEGAL_TODO.md.
- GATE 5: give the owner a plain summary of what is done, what still needs their accounts or keys, and what still needs a lawyer and a security reviewer. Ask whether to continue.

## Finished means
Every task done and committed, all tests green, no secrets or real data in the folder, DEPLOY.md and preflight pass, open [VERIFY] and [LEGAL REVIEW] items listed. Never state the site is ready for real reports until the owner confirms Gate 4 and the legal review are complete.


## WORKLIST PROTOCOL v1 (added; takes priority over task tracking above)
Follow .clinerules section 8. Changes to the loop:
- After L0 and L1, do task L2 before anything else.
- L2 PLAN: Read the whole build manual (sections 1 to 11), this file and the design file. Break the complete build into individual work items and create each one with worklist.ps1 -Action NewWork, numbered WL-0001 upward. Cover every task in this file (L0, L1, Phases 0 to 8 and P8.1 to P8.6) split into small checkable steps. Include every GATE as its own item, every owner question and asset request as its own item, all test and verification steps, the packaging and DEPLOY.md work, and a final full-audit item. Use -Depends to order work.
- Expect roughly 150 to 300 items, each completable in one sitting.
- Create the items in dependency order. Run Audit when finished, report the count, and ask the owner to review the list in slccraop-site\worklist. Do not start building until the owner confirms.
- Create work items for L0 and L1 as well, and verify them with the evidence you already have.
- From then on the loop is: Status, Next, do it, NewVerify, Audit. PROGRESS.md becomes a short human summary only; the verify items are the record.