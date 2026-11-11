# SLCCRAOP Build Manual

**Sri Lanka Cyber Crime Registry and Accountability Oversight Project**
Version 1.0 (planning baseline). Place this file at `docs/BUILD_MANUAL.md` in the repository.

---

## 0. Read this first

**Audience.** This manual is written for Cline (an AI coding agent working in VS Code) and for the project owner, who is not a developer and cannot review code line by line. That second fact drives most of the rules below: the build has to be safe by construction, tested automatically, and honest about what it has and has not done.

**Precedence.** If anything in this manual conflicts with convenience, speed or a library default, this manual wins. If something is ambiguous or missing, stop and ask the owner. Do not guess. Record every decision in `docs/DECISIONS.md` (date, decision, reason).

**What this is not.** This is not legal advice. Items marked `[LEGAL REVIEW]` must be reviewed by a Sri Lankan lawyer before launch. Items marked `[VERIFY]` depend on third-party terms, limits or official contact details that must be checked against current official sources. Never fill a `[VERIFY]` item from memory.

**Three absolute rules (never break, even if asked mid-task):**
1. No real victim, suspect or case data is ever used in development, tests or screenshots. Fake data only, clearly marked.
2. No names, images, videos, audio, screenshots, phone numbers, profile links or free-text submitter descriptions ever appear on any public page or public API response.
3. Nobody on the team, and no automated process, stores, views, downloads or archives sexual content involving a minor. See section 5.6.

---

## 1. Project definition

**Mission.** Give the public a safe way to report online sexual abuse and non-consensual sexual content, pass verified cases to the correct Sri Lankan authorities, and publicly show, without naming anyone, how those authorities respond over time.

**In scope (case types):**
- Non-consensual sharing or leaking of intimate images or video
- Sextortion and blackmail involving intimate content
- Online sexual harassment
- Online sexual exploitation or trafficking (adult victims on this platform; minors by referral only, see 6.5)

**Out of scope:** hate speech, defamation disputes, political or expression cases, fraud, any dispute where the harm is not sexual or non-consensual.

**Independence statement.** The site must state clearly on every page footer and on the About page that it is an independent civil-society project and is not part of, endorsed by, or acting for any government body or police force. The word "Registry" in the name must never be presented as implying official status.

**Primary users:** victims reporting for themselves; people reporting on behalf of someone else (with consent); activists; admins (the owner now, volunteers later); and authority liaisons who receive dossiers.

**Success measures:** reports are processed within the published review time; authority replies are logged promptly; the public ledger and ticker are accurate; zero leaks of private data; admins are not overwhelmed (see intake controls, 6.2).

---

## 2. Data classification and vocabulary

Use these exact terms everywhere in code, database, UI copy and documentation.

| Term | Meaning | Who can see it |
|---|---|---|
| **Submitted data** | Everything a reporter provides: descriptions, links, contact details, uploaded screenshots | Admins and authorities only |
| **Source content** | Material captured from platforms (screenshots of groups, member lists, threads, profile pages) | Stored as submitted data. Never shown publicly, even if the origin was public. Content from private groups is never treated as public |
| **Public ledger** | The sanitised board of case rows written by admins | Everyone |
| **Aggregate stats** | Counts shown in the top ticker | Everyone |
| **Quarantined item** | Evidence flagged as possible child-safety material | Nobody through the app; see 5.6 |

Rule: public data is only ever created by copying approved, sanitised fields **into** a separate public table. It is never produced by exposing a view over private tables.

---

## 3. Locked decisions (from planning)

| Area | Decision |
|---|---|
| Hosting budget | Free tier only for now. No paid domain at launch (owner may obtain a donated domain later; design must allow a custom domain with no rebuild) |
| Launch capacity | 30 new reports per week, enforced by an admin-controlled intake state and a daily cap |
| Verification | Phase 1: admin call-back to the reporter. Automated SMS OTP is Phase 2 (needs a paid SMS provider) |
| Evidence | Screenshots only (PNG, JPG, WebP), 10 MB per file. Video or audio: reporter supplies a link to their own cloud storage in a text field; the system never fetches or stores it |
| Explicit content | Reporters are instructed to blur explicit areas before upload. The app must not rely on this and still supports quarantine (5.6) |
| Minors | Never use the report form. Referral hub only. Public board shows aggregate counts only, never rows |
| Public board | Only the fields in Appendix C. No officer names, only the authority |
| Duplicates | Matching is admin-side only. The reporter always receives the same neutral confirmation |
| Wayback Machine | Admin-approved queue, public non-explicit pages only, never member lists, never private-group content, never minors (6.10) |
| Revocation | Reporters may withdraw at any time. Reasons are recorded as anonymous categories and published only as aggregate statistics |
| Languages | English, Sinhala and Tamil at launch. Legal and consent text must be human-translated and reviewed |
| Owner identity | The owner is the public face of the project |
| Case ID format | `SL-YYYY-NNNN`, sequential per year |

---

## 4. Technology and repository

**Stack.**
- **Frontend:** React, Vite and TypeScript (strict mode), Tailwind CSS, React Router, react-i18next, Zod for validation. Static build.
- **Frontend hosting:** Cloudflare Pages (free). Security headers via a `_headers` file.
- **Backend:** Supabase: Postgres with Row Level Security (RLS), Auth with TOTP multi-factor authentication for staff, private Storage buckets, Edge Functions (Deno/TypeScript) for every write path.
- **Bot protection:** Cloudflare Turnstile.
- **Testing and quality:** Vitest, Playwright, axe-core, ESLint, Prettier, `tsc --noEmit`, gitleaks (secret scan), `npm audit`.
- **CI:** GitHub Actions.

Choose the Supabase region closest to Sri Lanka (Mumbai or Singapore). Data residency and cross-border transfer need `[LEGAL REVIEW]`.

**No other third-party services** (no Google Analytics, no external font CDNs, no embedded social widgets, no chat widgets). Self-host fonts: Noto Sans, Noto Sans Sinhala, Noto Sans Tamil.

**Repository layout.**

```
/
  .clinerules
  loop.md
  README.md
  docs/
    BUILD_MANUAL.md
    DECISIONS.md      (every decision, dated)
    SECURITY.md       (threat model and controls)
    RUNBOOK.md        (incidents, backups, quarantine procedure)
    LEGAL_TODO.md     (everything marked [LEGAL REVIEW])
    CHANGELOG.md
  src/
    app/ (routes, layout)
    features/ (public-ledger, report, evidence, admin, referral, legal)
    components/
    lib/ (supabase client, validation, dates, i18n helpers)
    i18n/ (en.json, si.json, ta.json)
    styles/
  supabase/
    migrations/
    functions/ (one folder per edge function)
    tests/ (RLS and function tests)
    seed/ (FAKE data only)
  tests/e2e/
  .github/workflows/
  .env.example
```

**Cross-platform.** All scripts must run on Windows PowerShell and on Unix. Do not write bash-only scripts.

**Environments.** `local`, `staging`, `production`: three separate Supabase projects. Staging holds fake data only. The service-role key exists only in Edge Function secrets and the owner's password manager, never in the frontend, the repo or `.env.example`.

---

## 5. Security architecture

### 5.1 Principles
1. **Default deny.** Every table has RLS enabled and no policy until one is deliberately written.
2. **The browser is untrusted.** The public anon key is public by design. All writes go through Edge Functions that validate input and enforce rules.
3. **Least data.** Collect only what is needed. Hash or encrypt what you need to match but not read.
4. **Everything staff do is logged** to an append-only audit table.
5. **Fail closed.** If a check cannot run, refuse the action.

### 5.2 Roles
- `anon`: read-only access to the public ledger, aggregate stats, intake state and authority list. No other access, no writes.
- `staff.owner`: everything, including staff management and exports.
- `staff.admin`: triage, cases, evidence viewing, ledger publishing.
- Staff roles live in a `staff` table checked by a `SECURITY DEFINER` function with a fixed `search_path`. **Never** derive authorisation from user-editable metadata.
- Every staff policy additionally requires multi-factor authentication (`aal2`). A staff account without enrolled TOTP can do nothing.

### 5.3 Data model (private unless stated)

| Table | Purpose | Key fields |
|---|---|---|
| `submissions` | A reporter's submission | id, case_ref (nullable until accepted), category, platform, structured answers, description (private text), reporter_role (self or on behalf), contact_consent, language, state (new, unverified, verified, duplicate_review, accepted, rejected, withdrawn), created_at |
| `reporter_contacts` | Contact data, separate table | submission_id, phone (AES-256-GCM encrypted by function), phone_hmac (for rate limits and matching), tracking_code_hash |
| `identifiers` | Matching keys | submission_id, type (profile, group, page, username, phone), value_hmac |
| `evidence_items` | Uploaded screenshots | id, submission_id, storage_path, sha256, size, mime, uploaded_at, derived_path, quarantined |
| `cases` | Accepted case | case_ref, submission_ids (supports merge), category, authority_id, authority_case_id, status, forwarded_at, closed_at, close_reason |
| `case_events` | Full private timeline | case_id, type, authority_response_category, note, occurred_at, actor |
| `authorities` | CCID, SLCERT, NCPA, Police units, Other | id, name, public_label |
| `public_ledger` | **Public**, written only by the publish function | See Appendix C |
| `public_stats` | **Public**, counts only | computed from `cases` by a function that returns aggregates, never rows |
| `intake_state` | **Public read**, staff write | mode (open, limited, closed), daily_cap, today_count, disclaimer keys |
| `revocations` | Withdrawals | reason_category (anonymous), occurred_at |
| `archive_requests` | Wayback queue | url, approved_by, status, snapshot_url, failure_reason |
| `audit_log` | Append-only | actor, action, target, occurred_at, ip_hash. Triggers block UPDATE and DELETE |
| `staff` | Staff accounts and roles | user_id, role |

Dates are stored in UTC and displayed in Asia/Colombo.

### 5.4 RLS requirements
- `anon` can `SELECT` only: `public_ledger`, `public_stats`, `intake_state` (non-sensitive columns), `authorities` (public columns).
- No `anon` or `authenticated` `INSERT`, `UPDATE` or `DELETE` on any table. Writes happen in Edge Functions using the service role after validation.
- Staff `SELECT` and function execution require `is_staff()` and `aal2`.
- Never write a policy of `using (true)` on a private table. Never disable RLS to "make it work".
- Test suite proves each rule (section 8).

### 5.5 Edge Functions (all validate with Zod, all return generic errors)

| Function | Caller | Does |
|---|---|---|
| `submit-report` | public | Checks intake state and daily cap, verifies Turnstile, rate-limits per IP hash and phone hash, validates, stores submission, encrypts phone, hashes identifiers, issues tracking code and upload URLs. Always returns the same neutral response shape whether or not a duplicate exists |
| `finalize-evidence` | public (with upload token) | Re-reads the uploaded file, checks magic bytes (not just the extension), enforces 10 MB, computes SHA-256, writes a stripped preview copy, deletes the upload on any failure |
| `add-evidence` | reporter (tracking code) | Same checks. Rate-limited. Cannot read anything back |
| `withdraw-report` | reporter (tracking code) | Marks withdrawn, records anonymous reason category, schedules purge |
| `admin-*` | staff (aal2) | Triage, verify, merge, publish, update status, issue signed evidence URLs (short expiry, logged), quarantine, export |
| `scheduled-maintenance` | scheduler | Resets daily counters, flags overdue authority follow-ups, purges withdrawn data after the retention period |

`[VERIFY]` Edge Function request size and time limits before choosing between direct upload and signed upload URLs. The design above assumes signed upload URLs.

### 5.6 Evidence handling and child-safety quarantine
- Buckets are private. No public bucket policies. Admin access is via short-lived signed URLs generated by a logged function.
- Store the original untouched in the private evidence bucket together with its SHA-256 and upload timestamp (chain of custody). Store a metadata-stripped copy for admin viewing.
- Only PNG, JPG and WebP. Reject SVG, HTML, PDF and anything else. Never render user content as HTML.
- Admin viewer shows images **blurred by default** with click-to-reveal, and logs each reveal. This protects admins from unexpected exposure.
- **Quarantine:** every evidence view has a "Report as child-safety concern" action. It immediately hides the item from every user interface, blocks downloads, blocks archiving, writes an incident record and displays the procedure in `docs/RUNBOOK.md`. The procedure is that nobody opens the item again, and the owner contacts the relevant authority per `[LEGAL REVIEW]` guidance. Automated detection of known abuse material needs a partner organisation and is out of scope for the first release.
- Malware: uploaded files are served only as downloads via signed URLs and never executed or embedded.

### 5.7 Duplicate detection
- Normalise identifiers before hashing: lowercase hostnames, map `m.`, `mbasic.`, `www.` variants to one canonical host, strip tracking parameters, resolve Facebook profile, page and group forms to the stable ID or username where present, phone numbers to E.164 (`+94...`).
- Store keyed hashes (HMAC with a secret pepper held in function secrets), not raw values.
- A match creates an **admin-only** flag. The reporter's response is byte-for-byte the same shape either way (no timing or content difference), so a suspect cannot test whether they have been reported.
- Admins confirm and merge, or accept as separate.

### 5.8 Reporter identity
- On submission the reporter gets a random tracking code (at least 16 characters from an unambiguous alphabet), shown once. Only its hash is stored.
- The tracking code allows adding evidence and withdrawing. It never reveals stored data.
- Phone numbers are collected in international format, encrypted at rest by the function, decrypted only in an admin function that writes an audit entry each time.

### 5.9 Staff security
- Strong passwords plus mandatory TOTP. Owner stores recovery codes offline.
- Session timeout. Re-authentication for exports and staff changes.
- Staff invitations are by the owner only.
- Admin conduct policy (what to do on threats, doxxing, or a suspected breach) lives in `docs/RUNBOOK.md` `[LEGAL REVIEW]`.

### 5.10 Web hardening
- Headers: strict Content-Security-Policy (no inline scripts, no third-party origins except Turnstile and the Supabase project), HSTS, `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, `Permissions-Policy` denying camera, microphone and geolocation, `X-Content-Type-Options: nosniff`.
- No `dangerouslySetInnerHTML`. Escape all output. Sanitise any markdown.
- Lock down CORS to the site origin on every function.
- Pin dependency versions with a lockfile; Dependabot enabled; `npm audit` and gitleaks in CI.

### 5.11 Abuse prevention
Turnstile on every public form, per-IP and per-phone rate limits, a honeypot field, daily intake cap, maximum field lengths, maximum evidence items per submission, an admin block list, and monitoring for bursts.

### 5.12 Privacy of the site itself
No third-party trackers or cookies beyond what is strictly necessary. Privacy-respecting, cookieless analytics only if needed (for example Cloudflare Web Analytics, `[VERIFY]`). Error logs must never contain submission content, contact data or tracking codes.

---

## 6. Feature specifications

### 6.1 Public site
Pages: Home, How it works, Methodology (what is published, what never is), Referral hub, Report an incident, Add to my report, Withdraw my report, Request a correction or removal, About and independence statement, Privacy notice, Terms, Consent and withdrawal, Contact, 404.

**Home** (top to bottom): intake-state banner and emergency-danger banner; the always-visible **stats ticker**; two buttons ("Report an incident" and "Add evidence to my report"); the **public ledger** table.

**Ledger table.** Desktop: sortable table with search and filters (category, authority, status, date range). Mobile: stacked cards. Must have loading, empty and error states, pagination, and a visible "last updated" timestamp.

### 6.2 Intake controls
- Modes: **Open**, **Limited** (daily cap reached, "we review in order" notice), **Closed** (no new reports; shows the referral hub and direct complaint routes).
- Staff toggle modes; the system moves to Limited automatically at the daily cap and resets at midnight Asia/Colombo.
- Disclaimers for every mode live in the database per language and appear instantly on the public site. The emergency-danger banner (contact police if someone is in immediate danger) shows in every mode.

### 6.3 Report flow
1. Choose language.
2. Eligibility: is the affected person under 18? If yes, show the minors referral page and stop (6.5). Are you reporting for yourself or on someone's behalf? On behalf of another adult requires an attestation of their consent.
3. Immediate danger notice.
4. Consent screen (plain language, revocable, what happens to your data, who sees it, your cooperation is voluntary).
5. Questionnaire: platform; harm category; links and usernames (multiple); date range; whether already reported to the platform or police (with reference numbers); evidence summary; preferred contact language.
6. Evidence: screenshots only, 10 MB each, with a blur guide. Video or audio: a text field for the reporter's own storage link, never fetched by the system.
7. Phone number (international format).
8. Turnstile.
9. Confirmation: neutral message plus tracking code, shown once with copy and print options. Never reveal duplicate matches.

Form state is kept in memory only, with a warning that leaving the page loses progress. No drafts in browser storage.

### 6.4 Add evidence and withdraw
By tracking code only. Withdrawal is one clear step with an optional reason category. The reporter never reads back submitted data.

### 6.5 Minors and referral hub
The referral hub explains, step by step, how to complain directly to the correct bodies (CCID, SLCERT, National Child Protection Authority, police women and children's units) and how to preserve evidence safely. Aggregate counts of "minor cases referred" are shown, never rows. Every contact detail is `[VERIFY]` against official sources. **Never invent phone numbers, emails, addresses or hotlines.** Also link the hash-based image-removal tools StopNCII.org (adults) and Take It Down (under 18) after confirming they are available to Sri Lankan users.

### 6.6 Admin dashboard modules
Triage queue; verification (call-back log); case view (structured answers, evidence viewer, decrypted contact with audit); duplicate review and merge; authority forwarding; case events timeline; ledger publish and edit; intake controls; follow-up reminders and overdue list; archive-request queue; revocation statistics; correction-request queue; audit log viewer; staff management (owner only).

### 6.7 Ledger publishing
- A case row is created in `public_ledger` only by `admin-publish-case`.
- The public description is written by an admin from a template, **never copied from the submitter's text**. Maximum length enforced.
- A linter rejects URLs, emails, phone-like digit runs, `@` handles and obvious honorifics followed by a name. It cannot catch every name, so a human check is required. With two or more admins, publishing requires a second approval.
- Authority replies appear as a **status category** and date, not copied text. Only the latest exchange is shown publicly; the full history stays private.

### 6.8 Ticker metrics (definitions must be shown on the Methodology page)
Total cases forwarded; cases per authority; open; awaiting acknowledgement; under investigation; closed resolved; closed unresolved; closed with reasons (breakdown by reason code); withdrawn (aggregate only); minors referred (aggregate only); median days to first authority acknowledgement per authority. Each figure derives only from logged, dated events. "Solved" means a closed event with a resolved outcome recorded from authority correspondence.

### 6.9 Authority follow-up
A configurable reminder schedule (defaults 14, 30 and 60 days after last authority contact). An overdue list. Email drafts generated for the admin to send from their own mailbox; Phase 1 does not auto-send sensitive content. Resubmit requests are logged as events and shown as "Resubmission requested" in the ledger.

### 6.10 Wayback Machine
- An admin adds a URL to the queue; a second check approves it. Nothing archives automatically from a submission.
- Allowed: public, non-explicit pages such as a group or page name and about page. Blocked: member lists, content from private groups, anything involving a minor, anything an admin has flagged as explicit.
- Show a warning in the UI that every capture is permanent and public to anyone who looks up the original URL; takedown requests to the Internet Archive are manual and not guaranteed.
- Store the resulting snapshot URL privately. Handle failures and rate limits; retry with backoff.
- `[VERIFY]` current Internet Archive capture API, account keys and limits.
- Member lists and threads are preserved privately as hashed, time-stamped screenshots from the reporter's own legitimate access. The team must not create fake accounts, infiltrate groups or scrape platforms without legal advice.

### 6.11 Revocation
Withdrawal reasons are anonymous categories (for example: fear of retaliation, lack of authority response, personal reasons, other). Display aggregate counts framed as system barriers, never as a judgement of reporters.

### 6.12 Internationalisation
English, Sinhala, Tamil from day one. All strings in translation files, no hardcoded text. Test long strings, correct font rendering, correct `lang` attribute, and correct date formats. Legal, consent and safety text are human-translated and reviewed `[LEGAL REVIEW]`. Machine translation is for drafts only.

### 6.13 Legal pages
Create the structure and placeholder text marked `[LEGAL REVIEW REQUIRED]` for: Privacy notice, Terms, Consent and withdrawal, Correction and removal procedure (with a published response time), Independence disclaimer. Do not invent legal claims, statutes or guarantees. Retention defaults (to be confirmed by a lawyer): withdrawn submissions purged within 30 days; closed cases retained for 24 months unless an authority requests longer.

### 6.14 Accessibility and performance
WCAG 2.2 AA, full keyboard use, visible focus, sufficient contrast, labelled form fields, screen reader tested. Mobile-first, because most traffic will arrive from Instagram. Budget: initial JavaScript under roughly 150 KB gzipped, no large images, usable on slow connections.

---

## 7. Build phases (loop-ready)

Work in this order. Each task needs: code, tests, a passing `lint`, `typecheck` and `test`, a small commit, and a line in `docs/DECISIONS.md` where a choice was made. **Stop at every GATE and wait for the owner.**

### Phase 0: Foundation
- [ ] T0.1 Initialise repo, strict TypeScript, ESLint, Prettier, Vitest, Playwright, commit conventions
- [ ] T0.2 Create the `docs/` files and `.env.example`
- [ ] T0.3 CI: lint, typecheck, test, build, `npm audit`, gitleaks
- [ ] T0.4 Design tokens, self-hosted fonts, layout shell, i18n scaffold (EN, SI, TA) with language switcher

### Phase 1: Database and security core
- [ ] T1.1 Migrations: tables, enums, sequences, indexes (section 5.3)
- [ ] T1.2 Helper functions: `is_staff`, role and `aal2` checks
- [ ] T1.3 RLS: default deny and the policies in 5.4
- [ ] T1.4 Storage buckets and policies (all private)
- [ ] T1.5 Append-only `audit_log` with blocking triggers
- [ ] T1.6 Seed script with **fake** data, every record visibly marked FAKE
- [ ] T1.7 RLS test suite: anon cannot read any private table; staff without `aal2` cannot read; reporter cannot read others; storage objects not reachable without signed URLs
- **GATE 1:** owner reviews `docs/SECURITY.md` and the test results

### Phase 2: Public site (read-only)
- [ ] T2.1 Ledger table and mobile cards, search, filters, pagination, loading, empty, error states
- [ ] T2.2 Stats ticker
- [ ] T2.3 Static pages and placeholder legal pages
- [ ] T2.4 Referral hub with `[VERIFY]` placeholders
- [ ] T2.5 Intake-state banner and emergency banner

### Phase 3: Intake
- [ ] T3.1 `submit-report` function (validation, Turnstile, rate limits, state check, neutral response)
- [ ] T3.2 Multi-step report form (accessible, in-memory state)
- [ ] T3.3 Evidence upload and `finalize-evidence`
- [ ] T3.4 Tracking-code add-evidence and withdraw
- [ ] T3.5 Minors path and eligibility gate
- [ ] T3.6 Identifier hashing and admin-side duplicate flags
- **GATE 2:** owner tests the full flow on staging with fake data

### Phase 4: Admin core
- [ ] T4.1 Staff login with enforced TOTP
- [ ] T4.2 Staff and role management (owner only)
- [ ] T4.3 Triage queue and verification log
- [ ] T4.4 Case view: logged contact reveal, blurred evidence viewer, notes
- [ ] T4.5 Duplicate review and merge
- [ ] T4.6 Intake controls
- [ ] T4.7 Quarantine flow
- [ ] T4.8 Audit log viewer

### Phase 5: Authority tracking and ledger
- [ ] T5.1 Authorities, forwarding record, case events
- [ ] T5.2 Status taxonomy and latest-exchange logic (Appendix B)
- [ ] T5.3 Publish to ledger with linter and second approval
- [ ] T5.4 Stats computation and ticker definitions
- [ ] T5.5 Follow-up reminders and overdue list
- [ ] T5.6 Resubmit flow
- [ ] T5.7 Revocation tracking and statistics
- [ ] T5.8 Dossier export (structured file plus evidence hash manifest)
- **GATE 3:** owner reviews the public ledger output for any leakage

### Phase 6: Wayback queue
- [ ] T6.1 Approval queue, allowlist, capture integration, error handling

### Phase 7: Hardening
- [ ] T7.1 Headers and CSP verified with a scanner
- [ ] T7.2 Dependency and secret audit
- [ ] T7.3 Accessibility audit (axe plus manual keyboard and screen reader pass)
- [ ] T7.4 Performance budget check on a throttled mobile profile
- [ ] T7.5 Backup and restore drill (encrypted export, tested restore)
- [ ] T7.6 Log review: confirm no personal data in logs
- [ ] T7.7 Security test checklist (section 8.3)
- **GATE 4:** independent security review by a human security professional before any real report is accepted

### Phase 8: Launch readiness
- [ ] T8.1 Legal review items resolved (`docs/LEGAL_TODO.md` empty)
- [ ] T8.2 Translations reviewed by native speakers
- [ ] T8.3 Authority outreach letters sent and responses recorded
- [ ] T8.4 Admin training and runbook rehearsal
- [ ] T8.5 Soft launch with invited reporters, intake in Limited mode
- **GATE 5:** owner approves public launch

---

## 8. Testing and quality

### 8.1 Test layers
Unit tests for validation, normalisation, linters and date handling. Integration tests for each Edge Function including failure paths. **RLS tests are the most important tests in the project.** End-to-end tests for the report, add-evidence, withdraw and admin flows. Accessibility tests. Translation completeness tests (no missing keys in any language).

### 8.2 Definition of done (every task)
Feature works; tests written and passing; lint and typecheck clean; no `TODO` or placeholder left unless logged in `docs/LEGAL_TODO.md` or `docs/DECISIONS.md`; error, loading and empty states handled; accessible; translated in all three languages; no personal data in logs; commit made.

### 8.3 Security test checklist
- Anonymous request to every private table returns nothing
- Staff user without MFA is refused
- A reporter's tracking code cannot read any stored data
- Duplicate and non-duplicate submissions return identical responses (shape and timing within tolerance)
- Upload of a renamed non-image file is rejected
- Oversize and over-count uploads are rejected
- Cross-site scripting payloads in every text field are inert
- Rate limits and Turnstile cannot be bypassed from the browser
- Signed evidence URLs expire and are logged
- Public ledger API never contains a field outside Appendix C
- Quarantined items are unreachable by any route
- Service-role key is not present in the frontend bundle

---

## 9. Risks of AI-generated websites, and the control for each

This is the section to re-read before every phase. The code Cline writes will look plausible even when it is wrong, and the owner cannot spot the difference by looking. The controls below replace that review.

| # | Risk | How it shows up | Control |
|---|---|---|---|
| 1 | Security that only exists in the UI | Hiding buttons instead of enforcing permissions on the server | All authorisation in RLS and functions; RLS test suite is mandatory |
| 2 | RLS enabled but useless | Policies like `using (true)`, or RLS switched off to fix an error | Rule: never; reviewed at Gate 1 |
| 3 | Authorisation from user-editable data | Roles read from client-settable metadata | Roles only from the `staff` table via a fixed-path function |
| 4 | Leaked keys | Service-role or API keys in frontend code, commits or logs | Secrets only in function secrets; gitleaks in CI; check the built bundle |
| 5 | Public storage buckets and guessable URLs | Convenient defaults | All buckets private; signed, expiring URLs |
| 6 | Missing server-side validation | Trusting the form | Zod on every function input; limits on every field |
| 7 | Injection and XSS | String-built queries, `dangerouslySetInnerHTML` | Parameterised queries only; no raw HTML rendering |
| 8 | Hallucinated packages and APIs | Imports of libraries or methods that do not exist, or typo-squatted look-alike packages | Check every new dependency exists, is maintained and is needed; pin versions; log additions in DECISIONS.md |
| 9 | Fake progress | Mocked responses left in, swallowed errors (`catch {}`), "works" claims with no run | Never mock in production paths; log or surface every error; report only what was actually run and passed |
| 10 | Invented content | Fabricated hotlines, emails, statutes, statistics, legal text | Placeholder marked `[VERIFY]` or `[LEGAL REVIEW]`; never from memory |
| 11 | Scope drift | Quietly adding features, changing requirements, "improving" privacy rules | Work only the current task; any deviation needs owner approval and a DECISIONS entry |
| 12 | Over-engineering and bloat | Unneeded frameworks, abstractions, packages | Smallest solution that meets the spec; justify each dependency |
| 13 | Copy-paste duplication and inconsistent patterns | Same logic written three ways | One validation approach, one error shape, one date helper, one fetch wrapper |
| 14 | Personal data in logs and errors | `console.log` of submissions, stack traces to users | Redacting logger; generic user-facing errors; log review in Phase 7 |
| 15 | Timezone and date bugs | Local-time storage, off-by-one days at midnight | UTC in storage; Asia/Colombo only for display and the daily cap boundary |
| 16 | Poor i18n | Hardcoded strings; Sinhala and Tamil render badly or break layouts | All strings in translation files; fonts bundled; long-string tests |
| 17 | Accessibility ignored | No labels, keyboard traps, low contrast | axe in CI plus a manual keyboard and screen reader pass |
| 18 | Missing states | No loading, empty, offline or error handling | Required in the definition of done |
| 19 | Tests that prove nothing | Assertions that always pass, snapshot-only tests | Tests must fail when the behaviour breaks; RLS tests must attempt forbidden access and expect refusal |
| 20 | Dependencies and licences | Unvetted packages, incompatible licences | `npm audit`, Dependabot, licence check before adding |
| 21 | Unsafe destructive actions | Dropping tables, force-pushing, deleting data to "fix" things | Never run destructive commands without owner approval; migrations are forward-only |
| 22 | Optimistic summaries | "All done and tested" after partial work | Each task ends with an honest report: what was done, what ran, what failed, what is unverified |

---

## 10. Making it read as human-engineered

**Engineering hygiene**
- Small, single-purpose commits with conventional messages (`feat(intake): validate phone numbers`). One task per branch, merged only when tests pass.
- Names describe the domain (`submitReport`, `publishCase`), not generic labels (`handleData`, `utils2`).
- Comments explain **why** a decision was made, never restate what the code does. No stray debug code, no commented-out blocks, no unused files or dependencies.
- One consistent folder structure, one error-handling pattern, one API response shape.
- A real `README.md` (setup, scripts, environments, how to deploy, how to restore a backup) and `docs/DECISIONS.md` kept current.
- Environment configuration through `.env.example`, never committed secrets.

**Design and copy**
- Calm, restrained, trustworthy. This is a serious safety project, not a startup landing page: no gradient hero blobs, no decorative illustrations, no emoji in headings, no marketing slogans.
- A deliberate type scale and spacing scale, one accent colour, one icon set used sparingly, strong contrast. The table is the hero on desktop; cards on mobile.
- Plain, human microcopy written for frightened people and for officials: short sentences, no jargon, no blame, no hype. Never "Welcome to our platform" or "Revolutionize".
- Trust cues that are real: the independence statement, "last updated" times, the Methodology page, a visible "what we never publish" list.
- Consistent translations that read naturally in Sinhala and Tamil, reviewed by native speakers.

---

## 11. Launch gate checklist

- [ ] All five gates passed and signed off by the owner
- [ ] Independent security review completed and findings fixed
- [ ] Legal review items resolved and lawyer-approved text in place in all three languages
- [ ] Authority outreach made and responses recorded
- [ ] Staff TOTP enforced, owner recovery codes stored offline
- [ ] Backup and restore tested
- [ ] Incident runbook rehearsed, including the quarantine procedure
- [ ] Intake set to Limited for the soft launch
- [ ] Social media moderation plan in place for the project's Instagram and Facebook pages

---

## Appendix A: `.clinerules` (copy to the repo root)

```
# SLCCRAOP project rules
Read docs/BUILD_MANUAL.md before every session. It overrides defaults.

## Never
- Use real victim, suspect or case data. Fake data only, marked FAKE.
- Put names, images, links, phone numbers or submitter text on any public page or API.
- Store, view, download or archive sexual content involving a minor.
- Put secrets, the service-role key or API keys in the frontend, repo, logs or .env.example.
- Disable RLS, write a policy of "using (true)" on a private table, or take roles from user-editable metadata.
- Invent contact details, hotlines, statutes, statistics or legal text. Use [VERIFY] / [LEGAL REVIEW] placeholders.
- Add a dependency without checking it exists, is maintained and is necessary, and logging it in docs/DECISIONS.md.
- Run destructive commands (drop, truncate, force-push, delete data) without owner approval.
- Leave mocks, swallowed errors, TODOs or placeholder text in finished work.
- Add features or change rules outside the current task.

## Always
- Work one task at a time from loop.md. Stop at every GATE and wait for the owner.
- Validate all input on the server with Zod. Enforce all permissions in RLS and functions.
- After each task run lint, typecheck and tests; commit with a conventional message.
- Add error, loading and empty states; make UI accessible and translated in EN, SI, TA.
- Store dates in UTC; display in Asia/Colombo.
- Write commands that work on Windows PowerShell and Unix.
- End every task with an honest report: done, run and passed, failed, unverified, decisions made.
- Ask the owner when anything is ambiguous.
```

## Appendix B: Status taxonomy and reason codes

**Case status (public ledger shows one at a time):** Submitted to authority; Acknowledged by authority; Under investigation; Additional information requested; Resubmission requested; No response (shown after the configured number of days); Closed: resolved; Closed: unresolved.

**Latest authority exchange category (shown with its date):** Acknowledgement received; Information requested from complainant; Referred to another unit; Action in progress; Closed by authority; No reply.

**Closure reason codes (unresolved):** Insufficient evidence; Suspect not identified; Outside the authority's mandate; Jurisdiction; Complainant withdrew; Duplicate (merged); Other (admin must pick a documented category).

Every status change requires a dated event and, where applicable, an authority reference.

## Appendix C: Public ledger fields (the complete list; nothing else may be published)

Case ID; date created; crime category (broad); sanitised issue description (admin-authored, no names, links or identifiers); authority board; date submitted to authority; authority case ID; latest authority exchange category; latest exchange date; current status; final outcome and reason code (when closed); resubmission-requested flag; last updated timestamp.

Minors referred: shown only in aggregate counts. No row is ever created.

## Appendix D: Open items for the owner, and items to verify

**Owner decisions still open**
1. Final domain (donated or free subdomain) and the visual identity (logo, colours)
2. Who the first volunteer admins are and who vets them
3. Exact reminder schedule and the published admin response time for corrections and takedowns
4. Whether the second-approval publishing rule applies from day one
5. How reporters with no phone or no verified number are handled
6. Retention periods (lawyer to confirm)

**`[VERIFY]` before building the related task**
- Free-tier limits and terms of every service (database size, storage, inactivity pausing of projects, Edge Function limits, MFA availability, Turnstile and Pages limits)
- Internet Archive capture API, keys and rate limits
- StopNCII.org and Take It Down availability for Sri Lankan users
- Every authority contact detail in the referral hub, taken only from official sources
- Current text and status of the Online Safety Act and Personal Data Protection Act, and their effect on a site like this

**`[LEGAL REVIEW]` before launch**
Privacy notice, terms, consent and withdrawal wording, data residency, cross-border transfer, retention, correction and takedown process, quarantine and child-safety procedure, admin conduct policy, and whether to operate through a registered legal entity.
