# UNBOUND

**Plan what matters. Follow your rhythm. Protect your freedom.**

A standalone, mobile-first Personal Freedom OS prototype built with Next.js App Router, TypeScript, React and Tailwind CSS 4. No account, database, payments, analytics integration or deployment.

## Run locally

Requires Node.js 20.9+ and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Production: `npm run build` then `npm start`.

```sh
npm run typecheck
npm test
npm run build
```

## Implemented

- **Today:** optional date-specific daily anchor and energy check-in; create, complete, reopen and delete tasks; optional real deadlines; light/deep effort; deterministic next-action suggestion. Overdue/due tasks come first; otherwise low energy favors light work, then the earliest deadline. Suggestions never commit the user to anything.
- **Mindspace:** immediate text capture, timestamps, edit and delete. No automatic conversion to tasks. Optional browser speech recognition with explicit user initiation and a text fallback for unsupported browsers, denied microphone permission and speech errors. Captured speech remains editable before saving.
- **Projects:** create and edit name, desired outcome, optional deadline and next action; pause/resume/complete/reopen; Save My Place notes autosave and survive status changes.
- **Reflect:** tasks completed since Monday in the device's local timezone; all outstanding tasks and unfinished projects; optional autonomy, satisfaction and pressure check-ins keyed by week.
- Functional hash navigation including deep links, refresh and browser back/forward. Mobile bottom navigation and desktop sidebar. Light/dark themes, a dark default inspired by the supplied reference, and persisted overrides.
- Versioned, validated localStorage data with demo data on first use; readable error messages; JSON export; confirmed full reset to an empty space. Data controls work on mobile and desktop.
- Semantic forms, visible keyboard focus, a skip link, labeled fields, pressed/current states, minimum 44px controls, safe-area spacing, responsive layouts and reduced-motion support.
- Basic unit tests cover completion/reopening, local calendar deadlines, thought capture, pause/resume, suggestion priority, persisted data validation and Monday week boundaries.

## Architecture

- `src/app`: layout, page entry point, Tailwind entry and theme/layout styles.
- `src/components/Unbound.tsx`: application shell, state and local persistence.
- `src/components/*Screen.tsx`: four independent screen components.
- `src/components/Primitives.tsx`: reusable labeled fields and empty states.
- `src/components/ProjectForm.tsx`: reusable project editor.
- `src/lib/model.ts`: typed entities, demo data, validation and pure domain functions.
- `src/lib/model.test.ts`: Vitest domain tests.
- `src/components/Unbound.test.tsx`: component interaction tests with Testing Library and jsdom.

## Data and privacy

Everything is stored in this browser's localStorage under `unbound.v1`; theme under `unbound.theme`. Clearing site data removes it. Export JSON regularly. Storage errors leave the app usable in memory and prompt export. Malformed stored data is preserved rather than silently overwritten; explicit reset re-enables saving. Export contains the active in-memory state. There is no import UI in this phase.

The app does not call a speech API directly. Browser speech recognition can use the browser vendor's remote service, depending on browser/platform. Do not use voice for sensitive content if that is unsuitable; text capture needs no speech service. No external fonts or image assets are fetched.

## Deliberate limits / remaining work

- Prototype uses a single browser and has no cross-device sync, accounts or cloud backup.
- No import/restore UI, recurring tasks, reminders, calendar integration, task editing or historical reflection browser yet.
- Project next actions remain project text; they do not automatically create duplicate tasks in Today.
- Concurrent editing in multiple browser tabs is not coordinated.
- Day/week boundaries update on the next render; no background rollover scheduler.
- Native speech permission/recognition requires manual testing on intended devices; browser support varies.
- A screen-reader audit and real-device Safari/Android checks remain before production. Unit tests are not a substitute for those checks.
- No service worker or installable/offline PWA shell yet.

## Visual design update

The October 2026 redesign follows the supplied Orchard references: black background, charcoal cards, turquoise pill controls, cyan/yellow/purple accents, sans-serif typography and icon-based bottom navigation. UNBOUND keeps its own four screens and data model. The overview ring uses actual completed/total task counts; the passive week strip shows actual completion days. All/Open/Done filters work locally. No reference photos, avatars, habit categories or streak mechanics were copied.

## Verification

The production build, TypeScript check and all 16 tests pass (seven domain tests, seven component tests and two ID compatibility tests). The redesign was also opened in the cloud browser at a real 393 × 852 mobile iframe viewport and desktop size. Task completion, filtering, thought capture, navigation and light/dark switching were exercised. See `design-qa.md` for evidence, design decisions and remaining manual-device test gaps.

The app is linked to the GitHub repository and Vercel; pushes to main deploy automatically. No accounts, cloud storage of planner data, payment services or third-party speech integration were added.
