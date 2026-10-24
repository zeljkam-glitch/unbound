# UNBOUND

**Plan what matters. Follow your rhythm. Protect your freedom.**

UNBOUND is a responsive, local-first Personal Life OS built with Next.js, React and TypeScript. It is designed for flexible planning around real energy, focus, health and changing days — not rigid productivity streaks.

## Run locally

Requires Node.js 20.9+ and npm. Install with npm ci, then run npm run dev.

Production checks: npm run typecheck, npm test, and npm run build.

## MVP features

- **Today:** opt-in real weather from Open-Meteo and browser location, energy and focus check-ins, morning/evening routine checklists, quick idea capture, today’s tasks and one-click add from My Library.
- **Planner:** a horizontally scrollable seven-day view with planned/available time, per-day quick add, movable task cards, optional clock times, visible duration estimates and deadline awareness. Tasks support fixed/deadline/flexible/optional types, durations from 5 minutes to 8 hours, notes, project/tag filters and daily/weekly repeats. Fast input understands text such as `Call the doctor #health @10:30 t45m`.
- **12-week view:** an optional outcome cycle with a personal reason, one controllable leading action, weekly focus notes and lightweight weekly reviews.
- **My Library:** editable reusable lists for shopping by store, feel-good options, places/restaurants/trips, meals, workouts and bag checklists.
- **Inbox:** fast manual capture and promotion to today’s plan.
- **Goals:** progress sliders, remaining-progress visibility, pause/resume, next steps, save my place, and weekly check-ins.
- Versioned browser persistence, v1 data migration, dark/light themes, JSON export, explicit reset and clear empty states.
- Responsive sidebar/mobile navigation, keyboard focus, labels, minimum touch targets and reduced-motion support.

## Privacy and data

Planner content stays in the browser under unbound.v1. No account, analytics, database or cloud sync is used. Weather is requested only after the user presses Show real weather and allows browser location; coordinates are sent directly to Open-Meteo for the current forecast and are not stored by UNBOUND.

## Honest integration boundaries

- Gmail/email scanning and reply suggestions are not connected.
- Live store price comparison is not connected.
- Live Samobor event discovery is not connected.
- Calendar sync, push reminders, notifications and cross-device sync are not connected.

The UI names these limits instead of showing invented data. All corresponding manual lists and planning flows work locally.

## Verification

TypeScript validation, 17 automated tests and the production build pass. Browser-based visual QA was unavailable in the build environment; see design-qa.md for the remaining visual/manual checks.
