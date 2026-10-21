# UNBOUND reference redesign QA

Source visual truth: supplied Orchard reference boards, primarily `/workspace/scratch/53ff47a80a99/upload/original-a0d5ba7f711cffa07ebf744679e026ec.webp` (1824 × 1368 px). This is a visual-language adaptation to the existing UNBOUND product, not a clone of Orchard's habit-tracking feature set.

Implementation evidence (local QA files, intentionally excluded from source repository):
- Mobile browser screenshot: `/workspace/scratch/unbound-mobile-redesign.jpg`, 393 × 852 px.
- Desktop browser screenshot: `/workspace/scratch/unbound-desktop-redesign.jpg`, 1348 × 926 px.
- Combined comparison: `/workspace/scratch/unbound-design-comparison.jpg`, 820 × 890 px.

Viewport: mobile app rendered in a genuine 393 × 852 CSS-pixel iframe. Content crop taken from browser screenshot at x=485, y=20. Browser pixels equal CSS pixels at the captured scale. Reference app-content crop at x=145,y=260 to x=580,y=1155 was normalized to 393 × 852 for a design-language comparison, not a claim of pixel-perfect geometry. No device bezel or simulated status bar was added to UNBOUND.

State: dark Today; one of three tasks completed; All filter; local demo data. The ring represents completed task counts rather than fictional timer minutes. UNBOUND names, four screens, optional check-ins and existing persisted data are retained.

## Findings and comparison history

1. P2: First mobile rendering placed optional anchor/energy cards before tasks and left no task visible in the first viewport. Fixed by moving these cards below the flexible plan, reducing the mobile overview, removing duplicated supporting copy on mobile and shortening the task section heading. Final combined comparison shows the first task and the start of the second above persistent navigation.
2. P1: Browser interaction revealed `crypto.randomUUID` unavailable on the HTTP preview origin. Fixed by a shared non-security entity-ID helper with getRandomValues and legacy fallback. Post-fix browser evidence: captured thought appeared inside an article; task completion updated the ring; 16 automated tests pass.
3. P2: Navigation could preserve an inconvenient scroll position. Fixed tab navigation to reset scroll to top. Post-fix mobile capture includes the header and entire overview.
4. An immediate capture during theme transition showed the previous light paint. Discarded it, verified the dark data-theme attribute and captured the settled state again. The combined evidence uses the settled dark screenshot.

## Required fidelity surfaces

- Typography: clean system sans-serif replaces the prior editorial serif. Readable 16px controls, 22–28px mobile headings, restrained weights and no thin decorative display type. Source and implementation use comparable sans-serif proportions. Copy differs intentionally to support UNBOUND.
- Layout: charcoal rounded cards, pill controls, circular day markers, centered progress visualization and persistent four-item bottom navigation match the reference language. Desktop uses the existing sidebar and a responsive wider composition. Mobile uses 20px side padding and 44px interactive controls; day circles are passive information, not undersized buttons.
- Color: near-black canvas, #202121 cards, turquoise #43c1b5 controls, cyan/yellow/purple semantic accents. Muted text has readable contrast. The light counterpart preserves the same hierarchy.
- Assets: thin Phosphor library icons and react-circular-progressbar render actual UI icons and data visualization. No reference photography, account avatars, brand wordmark, device frames, fake timer, fake streak or rasterized app screen is used. Those are intentional product differences, not placeholder assets.
- Copy/content: existing four-screen product and user data preserved. Filters are real. The ring is a completed/total count; empty states remain available. No additional habit categories, notifications or accounts were introduced.

Full-view comparison is in the combined evidence. Focused review used readable mobile card typography, segmented filter and bottom navigation; no additional enlargement was needed at 393px density.

## Interaction and console checks

- Mobile task completion changes the displayed count to 1/3 and accessible progress to 33%.
- Done filter exposes the completed task; All restores the plan.
- Mindspace text capture succeeds after the HTTP ID fix and remains a thought.
- Project Save My Place field and Reflect weekly check-in render through mobile navigation.
- Light/dark toggles update the rendered theme; dark restored for final capture.
- Desktop page renders and preserves local data.
- Fresh final desktop console has no application errors; the sole observed error comes from the browser's own extension metadata channel. The earlier application ID error was fixed and retested.
- Build, typecheck and 16 unit/component tests pass.

## Follow-up polish / limits

P3: The source's multicolor time-allocation ring is intentionally represented by a single turquoise completion arc because UNBOUND has no time allocations. Cyan/yellow/purple accents remain on task cards and icons. Native iOS/Android browser, microphone permissions and screen-reader testing remain manual follow-ups. These are not claimed as completed.

final result: passed
