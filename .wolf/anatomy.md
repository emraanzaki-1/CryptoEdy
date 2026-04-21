# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-04-21T09:29:36.657Z
> Files: 301 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.DS_Store` (~2732 tok)
- `.gitignore` — Git ignore rules (~181 tok)
- `.prettierrc` — Prettier configuration (~41 tok)
- `AGENTS.md` — This is NOT the Next.js you know (~82 tok)
- `CLAUDE.md` — OpenWolf (~60 tok)
- `commitlint.config.ts` — Declares config (~90 tok)
- `components.json` (~148 tok)
- `drizzle.config.ts` — Drizzle ORM configuration (~79 tok)
- `eslint.config.mjs` — ESLint flat configuration (~131 tok)
- `next-env.d.ts` — / <reference types="next" /> (~72 tok)
- `next.config.ts` — Next.js configuration (~89 tok)
- `package-lock.json` — npm lock file (~168205 tok)
- `package.json` — Node.js package manifest (~692 tok)
- `payload.config.ts` — Declares filename (~1276 tok)
- `postcss.config.mjs` — Declares config (~26 tok)
- `proxy.ts` — Routes that require an active Pro (or higher) subscription (~1022 tok)
- `README.md` — Project documentation (~363 tok)
- `tsconfig.json` — TypeScript configuration (~247 tok)
- `tsconfig.tsbuildinfo` (~216474 tok)

## .claude/

- `settings.json` (~442 tok)
- `settings.local.json` — Declares p (~1234 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## .code-review-graph/

- `.gitignore` — Git ignore rules (~38 tok)
- `graph.db-shm` (~8738 tok)
- `graph.db-wal` (~0 tok)

## .github/workflows/

- `build.yml` — CI: Build (~219 tok)
- `ci.yml` — CI: CI (~156 tok)

## .husky/

- `commit-msg` (~9 tok)
- `pre-commit` (~5 tok)

## .husky/\_/

- `.gitignore` — Git ignore rules (~1 tok)
- `applypatch-msg` (~11 tok)
- `commit-msg` (~11 tok)
- `h` (~147 tok)
- `husky.sh` (~46 tok)
- `post-applypatch` (~11 tok)
- `post-checkout` (~11 tok)
- `post-commit` (~11 tok)
- `post-merge` (~11 tok)
- `post-rewrite` (~11 tok)
- `pre-applypatch` (~11 tok)
- `pre-auto-gc` (~11 tok)
- `pre-commit` (~11 tok)
- `pre-merge-commit` (~11 tok)
- `pre-push` (~11 tok)
- `pre-rebase` (~11 tok)
- `prepare-commit-msg` (~11 tok)

## app/

- `globals.css` — Styles: 6 rules, 269 vars (~4300 tok)

## app/(app)/

- `error.tsx` — AppError (~177 tok)
- `global-error.tsx` — inter (~228 tok)
- `layout.tsx` — inter (~350 tok)
- `not-found.tsx` — NotFound (~131 tok)
- `page.tsx` — Home (~341 tok)

## app/(app)/(auth)/

- `layout.tsx` — AuthLayout (~61 tok)

## app/(app)/(auth)/forgot-password/

- `page.tsx` — ForgotPasswordPage — renders form — uses useState (~923 tok)

## app/(app)/(auth)/login/

- `page.tsx` — LoginForm — renders form — uses useRouter, useSearchParams, useState (~1316 tok)

## app/(app)/(auth)/register/

- `page.tsx` — RegisterPage — renders form — uses useRouter, useState (~1006 tok)

## app/(app)/(auth)/reset-password/

- `page.tsx` — ResetPasswordForm — renders form — uses useSearchParams, useRouter, useState, useEffect (~1581 tok)

## app/(app)/(auth)/verify-email/

- `page.tsx` — VerifyEmailContent — uses useSearchParams, useRouter, useRef, useEffect (~1669 tok)

## app/(app)/(dashboard)/

- `error.tsx` — DashboardError (~148 tok)
- `layout.tsx` — DashboardLayout (~370 tok)
- `not-found.tsx` — DashboardNotFound (~104 tok)

## app/(app)/(dashboard)/articles/[slug]/

- `loading.tsx` — ArticleLoading (~42 tok)
- `page.tsx` — ROLE_HIERARCHY (~2662 tok)

## app/(app)/(dashboard)/community/

- `page.tsx` — FEATURES (~1880 tok)

## app/(app)/(dashboard)/feed/[[...slug]]/

- `loading.tsx` — FeedLoading (~282 tok)
- `page.tsx` — FeedPage (~1243 tok)

## app/(app)/(dashboard)/learn/

- `page.tsx` — LearnPage (~581 tok)

## app/(app)/(dashboard)/learn/[slug]/

- `page.tsx` — CryptoSchoolCategoryPage (~576 tok)

## app/(app)/(dashboard)/learn/courses/

- `loading.tsx` — CoursesLoading (~256 tok)
- `page.tsx` — CoursesListingPage (~1027 tok)

## app/(app)/(dashboard)/learn/courses/[courseSlug]/

- `page.tsx` — CourseDetailPage (~1577 tok)

## app/(app)/(dashboard)/learn/courses/[courseSlug]/[lessonSlug]/

- `page.tsx` — LessonPage (~2307 tok)

## app/(app)/(dashboard)/saved/

- `page.tsx` — SavedPage (~672 tok)

## app/(app)/(dashboard)/settings/

- `layout.tsx` — SettingsLayout (~100 tok)
- `loading.tsx` — SettingsLoading (~327 tok)
- `page.tsx` — SettingsPage (~34 tok)

## app/(app)/(dashboard)/settings/appearance/

- `page.tsx` — THEMES (~1782 tok)

## app/(app)/(dashboard)/settings/billing/

- `page.tsx` — billingHistory (~898 tok)

## app/(app)/(dashboard)/settings/notifications/

- `page.tsx` — NotificationItem — uses useState, useEffect, useCallback (~1675 tok)

## app/(app)/(dashboard)/settings/plans/

- `page.tsx` — benefits (~1208 tok)

## app/(app)/(dashboard)/settings/profile/

- `page.tsx` — ProfileSettingsPage — renders form — uses useState, useCallback, useEffect (~2355 tok)

## app/(app)/(dashboard)/tag/[slug]/

- `page.tsx` — TagPage (~620 tok)

## app/(app)/(dashboard)/tools/

- `page.tsx` — TOOLS — renders chart (~1022 tok)

## app/(app)/(dashboard)/tools/airdrops/

- `page.tsx` — HIGHLIGHTS (~303 tok)

## app/(app)/(dashboard)/tools/market-direction/

- `page.tsx` — HIGHLIGHTS — renders chart (~421 tok)

## app/(app)/(dashboard)/tools/picks/

- `page.tsx` — HIGHLIGHTS (~441 tok)

## app/(app)/(dashboard)/tools/tracker/

- `page.tsx` — HIGHLIGHTS — renders chart (~406 tok)

## app/(app)/(dashboard)/upgrade/

- `page.tsx` — UpgradePage (~279 tok)

## app/(app)/[...catchAll]/

- `page.tsx` — CatchAllPage (~29 tok)

## app/(app)/api/auth/[...nextauth]/

- `route.ts` — Next.js API route (~22 tok)

## app/(app)/api/auth/forgot-password/

- `route.ts` — Next.js API route: POST (~437 tok)

## app/(app)/api/auth/register/

- `route.ts` — Next.js API route: POST (~723 tok)

## app/(app)/api/auth/reset-password/

- `route.ts` — GET: Pre-validate reset token (does not consume the token) (~774 tok)

## app/(app)/api/auth/verify-email/

- `route.ts` — GET: Token-based verification (email link flow) (~1028 tok)

## app/(app)/api/contact/

- `route.ts` — Next.js API route: POST (~297 tok)

## app/(app)/api/courses/enroll/

- `route.ts` — Next.js API route: GET, POST (~788 tok)

## app/(app)/api/courses/progress/

- `route.ts` — Next.js API route: GET, POST (~768 tok)

## app/(app)/api/posts/

- `route.ts` — Next.js API route: GET (~1253 tok)

## app/(app)/api/search/

- `route.ts` — Course slug — present on lessons for routing to /learn/courses/[courseSlug]/[lessonSlug] (~2258 tok)

## app/(app)/api/subscribe/

- `route.ts` — Next.js API route: POST (~517 tok)

## app/(app)/api/user/notification-preferences/

- `route.ts` — Next.js API route: GET, PATCH (~415 tok)

## app/(app)/contact/

- `page.tsx` — SUBJECTS — renders form — uses useState (~2194 tok)

## app/(app)/privacy/

- `page.tsx` — metadata — renders table (~2895 tok)

## app/(app)/terms/

- `page.tsx` — metadata — renders chart (~3256 tok)

## app/(payload)/

- `actions.ts` — Exports serverFunction (~111 tok)
- `importMap.ts` — This file is auto-generated by Payload CMS when collections are added. (~37 tok)
- `layout.tsx` — Payload Makeup — icons, transitions, toast recoloring, popover animations (~217 tok)

## app/(payload)/admin/

- `importMap.js` — Exports importMap (~2528 tok)

## app/(payload)/admin/[[...segments]]/

- `page.tsx` — generateMetadata (~209 tok)

## app/(payload)/api/[...slug]/

- `route.ts` — Payload REST API — mounted at /api (via (payload) route group) (~116 tok)

## collections/

- `Authors.ts` — Payload's CMS editor accounts — separate from NextAuth app users. (~584 tok)
- `Categories.ts` — Exports Categories (~618 tok)
- `Courses.ts` — Exports Courses (~988 tok)
- `FAQs.ts` — Exports FAQs (~379 tok)
- `Lessons.ts` — Exports Lessons (~901 tok)
- `Media.ts` — Exports Media (~292 tok)
- `Modules.ts` — Exports Modules (~674 tok)
- `Posts.ts` — Exports Posts (~2769 tok)
- `Tags.ts` — Exports Tags (~270 tok)

## collections/blocks/

- `CalloutBlock.ts` — Highlighted editorial note embedded in article body. (~298 tok)
- `ChartEmbedBlock.ts` — Embeds a TradingView chart widget inline in the article body. (~584 tok)
- `PerformanceTableBlock.ts` — Track record table showing historical pick performance. (~606 tok)
- `PriceTargetBlock.ts` — Structured token pick summary card embedded in a research article. (~578 tok)

## components/

- `.DS_Store` (~1640 tok)

## components/admin/

- `AdminDashboard.tsx` — ─── Types ──────────────────────────────────────────────────────────────────── (~3527 tok)
- `AdminNavLinks.tsx` — AdminNavLinks (~179 tok)
- `DashboardBanner.tsx` — CryptoEdy dashboard welcome banner. (~566 tok)
- `Icon.tsx` — CryptoEdy admin icon — shown in collapsed sidebar and browser tab favicon area. (~199 tok)
- `Logo.tsx` — CryptoEdy admin sidebar logo. (~405 tok)

## components/admin/fields/

- `GroupedCategorySelect.tsx` — Custom field component for the `category` relationship field. (~1560 tok)
- `GroupedParentSelect.tsx` — Custom field component for the `parent` relationship on the Categories collection. (~1380 tok)

## components/admin/views/

- `CategoriesListClient.tsx` — styles — renders table — uses useState, useCallback (~5744 tok)
- `CategoriesListView.tsx` — CategoriesListView (~604 tok)
- `SubscriberManagement.tsx` — SubscriberManagement (~244 tok)
- `SubscriberManagementClient.tsx` — StatusBadge — uses useState, useCallback, useEffect (~2789 tok)
- `UserManagement.tsx` — UserManagement (~236 tok)
- `UserManagementClient.tsx` — ROLES — uses useState, useCallback, useEffect (~3796 tok)
- `UserManagementEdit.tsx` — UserManagementEdit (~334 tok)
- `UserManagementEditClient.tsx` — ROLES — uses useState, useCallback, useEffect (~4682 tok)

## components/article/

- `article-faq.tsx` — ArticleFAQ (~414 tok)
- `article-skeleton.tsx` — ArticleSkeleton (~550 tok)
- `paywall-gate.tsx` — SUMMARY_POINTS — renders chart (~1600 tok)
- `recommended-articles.tsx` — AUTO_SCROLL_INTERVAL — uses useState, useCallback, useEffect (~1165 tok)
- `share-button.tsx` — ShareButton — uses useState (~350 tok)

## components/article/blocks/

- `callout-block.tsx` — VARIANTS — renders chart (~431 tok)
- `chart-embed-block.tsx` — ChartEmbedBlockComponent — renders chart — uses useEffect (~550 tok)
- `performance-table-block.tsx` — STATUS_STYLES — renders table (~1149 tok)
- `price-target-block.tsx` — RISK_STYLES (~1067 tok)

## components/auth/

- `otp-input.tsx` — OTPInput — uses useState, useCallback (~744 tok)

## components/common/

- `back-to-top.tsx` — Supports both window-level scroll (guest pages) and overflow container (~720 tok)
- `empty-state.tsx` — Primary CTA label (~684 tok)
- `error-content.tsx` — Label for the primary CTA (~1106 tok)
- `logo.tsx` — sizes (~299 tok)
- `search-bar.tsx` — SearchBar (~210 tok)
- `search-modal.tsx` — RESULT_TYPE_CONFIG — renders form — uses useRouter, useState, useEffect, useCallback (~5488 tok)
- `section-heading.tsx` — headingStyles (~832 tok)
- `sidebar-nav.tsx` — SidebarNav — uses useState, useEffect (~592 tok)

## components/feed/

- `article-card-list.tsx` — ArticleCardList (~746 tok)
- `article-card-skeleton.tsx` — ArticleCardSkeleton (~900 tok)
- `article-card.tsx` — ArticleCard (~1067 tok)
- `bookmark-button.tsx` — BookmarkButton — uses useState, useRouter (~686 tok)
- `category-pill.tsx` — CategoryPill (~77 tok)
- `feed-cards-skeleton.tsx` — FeedCardsSkeleton (~276 tok)
- `feed-client.tsx` — FeedClient (~1118 tok)
- `tag-client.tsx` — TagClient (~826 tok)
- `view-toggle.tsx` — ViewToggle (~433 tok)

## components/landing/

- `faq-section.tsx` — FALLBACK_FAQS (~780 tok)
- `hero-section.tsx` — HeroSection (~591 tok)
- `onboarding-popup.tsx` — DISMISSED_KEY — renders form — uses useState, useCallback, useEffect (~2461 tok)
- `pricing-section.tsx` — FEATURES — renders chart (~939 tok)
- `research-preview-section.tsx` — ARTICLES (~1500 tok)
- `track-record-section.tsx` — TRADES (~927 tok)
- `value-props-section.tsx` — VALUE_PROPS — renders chart (~676 tok)

## components/layouts/

- `auth-split-layout.tsx` — AuthSplitLayout (~579 tok)
- `dashboard-shell.tsx` — DashboardShell — uses useState (~668 tok)
- `footer.tsx` — Footer (~999 tok)
- `guest-nav.tsx` — NAV_LINKS — uses useState (~947 tok)
- `guest-shell.tsx` — Additional className on the <main> element (~484 tok)
- `settings-nav.tsx` — settingsGroups (~570 tok)
- `sidebar.tsx` — TOOLS_ITEMS — renders chart — uses useState (~2200 tok)
- `top-app-bar.tsx` — Locked props interface — changes here affect DashboardShell and all consumers. (~3461 tok)

## components/learn/

- `active-course-card.tsx` — ActiveCourseCard (~1025 tok)
- `course-card.tsx` — CourseCard (~1247 tok)
- `courses-client.tsx` — DIFFICULTY_TABS (~1210 tok)
- `crypto-school-client.tsx` — CryptoSchoolClient (~704 tok)
- `enroll-button.tsx` — EnrollButton — uses useState, useRouter (~816 tok)
- `lesson-nav.tsx` — LessonNav (~586 tok)
- `mark-complete-button.tsx` — MarkCompleteButton — uses useState, useRouter (~625 tok)
- `module-accordion.tsx` — LessonItem — uses useState (~1973 tok)
- `progress-bar.tsx` — ProgressBar (~294 tok)
- `video-player.tsx` — Generic video embed that auto-detects Vimeo vs Bunny from URL pattern. (~845 tok)

## components/providers/

- `avatar-provider.tsx` — AvatarContext — uses useState, useCallback, useContext (~218 tok)
- `session-provider.tsx` — SessionProvider (~70 tok)
- `theme-provider.tsx` — ThemeProvider (~103 tok)

## components/settings/

- `avatar-upload.tsx` — getCroppedBlob — uses useState, useCallback (~2461 tok)
- `billing-history-table.tsx` — BillingHistoryTable — renders table (~616 tok)
- `danger-zone.tsx` — DangerZone — renders form — uses useState (~932 tok)
- `theme-card.tsx` — ThemeCard (~1087 tok)

## components/tools/

- `tool-preview-layout.tsx` — Extra decorative elements rendered inside the visual panel (~1508 tok)

## components/ui/

- `alert.tsx` — alertVariants (~582 tok)
- `badge.tsx` — badgeVariants (~632 tok)
- `breadcrumb.tsx` — Breadcrumb (~273 tok)
- `button-link.tsx` — ButtonLink (~155 tok)
- `button.tsx` — buttonVariants (~1140 tok)
- `card.tsx` — cardVariants (~1041 tok)
- `checkbox.tsx` — Checkbox (~385 tok)
- `filter-chip.tsx` — FilterChip (~168 tok)
- `form-field.tsx` — Slot between label and children — e.g. a "Forgot password?" link (~1005 tok)
- `label.tsx` — Label (~148 tok)
- `separator.tsx` — Separator (~154 tok)
- `skeleton.tsx` — Skeleton (~79 tok)
- `toggle-switch.tsx` — ToggleSwitch (~298 tok)
- `typography.tsx` — Display (~738 tok)

## docs/

- `.DS_Store` (~1640 tok)

## docs/planning/

- `.DS_Store` (~1640 tok)
- `IMPLEMENTATION_PLAN.md` — CryptoEdy Platform — Implementation Plan (~1702 tok)

## docs/planning/sprints/

- `sprint-01.md` — Sprint 1 — Project Scaffolding (~2884 tok)
- `sprint-02.md` — Sprint 2 — Data Layer & Auth Foundation (~3523 tok)
- `sprint-03.md` — Sprint 3 — CMS Collections & Content Model (~2888 tok)
- `sprint-04.md` — Sprint 4 — Home Feed & Article Page (~4151 tok)
- `sprint-05.md` — Sprint 5 — Wallet Connection & Payment Flow (~3519 tok)
- `sprint-06.md` — Sprint 6 — On-Chain Verification & Subscription Management (~3553 tok)
- `sprint-07.md` — Sprint 7 — Market Direction Dashboard (~2528 tok)
- `sprint-08.md` — Sprint 8 — Assets & Picks + Portfolio Tracker (~3008 tok)
- `sprint-09.md` — Sprint 9 — Airdrop Hub (~2795 tok)
- `sprint-10.md` — Sprint 10 — Notification Engine (~3723 tok)
- `sprint-11.md` — Sprint 11 — Community Features (~3377 tok)
- `sprint-12.md` — Sprint 12 — Settings & Admin Dashboard (~3705 tok)
- `sprint-13.md` — Sprint 13 — Performance, SEO & Mobile Polish (~3831 tok)
- `sprint-14.md` — Sprint 14 — Hardening & Go-Live (~3654 tok)

## docs/specs/

- `PROJECT_REQUIREMENTS.md` — Project Requirements Document: CryptoEdy Research Platform (~3443 tok)
- `UI_SPECIFICATION.md` — UI/UX Specification Document: CryptoEdy Research Platform (~1113 tok)
- `USER_JOURNEY.md` — User Journey Documentation: CryptoEdy Research Platform (~1171 tok)

## drizzle/

- `0000_cuddly_anita_blake.sql` — SQL: tables: users, accounts, sessions, verification_tokens, 3 alter(s) (~686 tok)
- `0001_perfect_post.sql` — SQL: 1 alter(s) (~21 tok)
- `0002_majestic_ironclad.sql` — SQL: tables: notification_preferences, 2 alter(s) (~227 tok)
- `0003_bookmarks_to_public.sql` — SQL: tables: bookmarks, 1 alter(s) (~144 tok)
- `0004_dazzling_black_tarantula.sql` — SQL: tables: course_enrollments, lesson_progress, 2 alter(s) (~337 tok)
- `0005_abandoned_dreaming_celestial.sql` — SQL: tables: marketing_subscribers (~110 tok)

## drizzle/meta/

- `_journal.json` (~273 tok)
- `0000_snapshot.json` (~2660 tok)
- `0001_snapshot.json` (~2710 tok)
- `0002_snapshot.json` (~3424 tok)
- `0003_snapshot.json` (~3947 tok)
- `0004_snapshot.json` (~5120 tok)
- `0005_snapshot.json` (~5575 tok)

## lib/

- `utils.ts` — Exports cn (~48 tok)

## lib/api/

- `admin-subscribers.ts` — API routes: GET (5 endpoints) (~1192 tok)
- `admin-users.ts` — API routes: GET (4 endpoints) (~3685 tok)
- `category-reorder.ts` — Exports categoryReorderEndpoint (~421 tok)

## lib/auth/

- `config.ts` — Exports authConfig (~1367 tok)
- `index.ts` (~42 tok)
- `rate-limit.ts` — Maximum requests allowed within the window (~534 tok)
- `referral.ts` — Generates a unique 12-character alphanumeric referral code (~116 tok)
- `schemas.ts` — Zod schemas: loginSchema, registerSchema, forgotPasswordSchema (~374 tok)
- `withRole.ts` — Checks if a user's effective role meets the required minimum role. (~624 tok)

## lib/bookmarks/

- `actions.ts` — Exports toggleBookmark (~247 tok)
- `getBookmarkedPostIds.ts` — Exports getBookmarkedPostIds (~114 tok)

## lib/categories/

- `getCategories.ts` — Exports NavCategory, getNavCategories (~621 tok)

## lib/config/

- `env.ts` — Startup environment validator. (~266 tok)
- `layout.ts` — Shared layout constants to reduce churn across edits. (~223 tok)

## lib/constants/

- `taxonomy.ts` — Exports TAXONOMY, CRYPTO_SCHOOL_CATEGORIES, ALL_CATEGORIES, CategoryType + 3 more (~716 tok)

## lib/courses/

- `getCourses.ts` — Exports getCourses, getCourseBySlug (~216 tok)
- `getLesson.ts` — Fetch a lesson by slug, scoped to a specific course ID. (~413 tok)
- `getModules.ts` — Get all published modules for a course, each with their published lessons. (~642 tok)
- `lessonAccess.ts` — Determine if a lesson is unlocked (accessible) based on sequential completion rules. (~701 tok)
- `progress.ts` — Get enrollment record for a user in a specific course. (~787 tok)

## lib/db/

- `index.ts` — Use this in all server-side code (API routes, Server Components, middleware) (~231 tok)

## lib/db/schema/

- `bookmarks.ts` — Exports bookmarks, Bookmark, NewBookmark (~181 tok)
- `course-enrollments.ts` — Exports courseEnrollments, CourseEnrollment, NewCourseEnrollment (~232 tok)
- `index.ts` (~67 tok)
- `lesson-progress.ts` — Exports lessonProgress, LessonProgress, NewLessonProgress (~230 tok)
- `marketing-subscribers.ts` — Exports marketingSubscribers, MarketingSubscriber, NewMarketingSubscriber (~197 tok)
- `notification-preferences.ts` — Exports notificationPreferences, NotificationPreferences, NewNotificationPreferences (~270 tok)
- `sessions.ts` — NextAuth v5 Drizzle adapter schema — required by DrizzleAdapter. (~490 tok)
- `users.ts` — Exports roleEnum, users, User, NewUser (~478 tok)

## lib/email/

- `index.ts` — In development, use Resend's shared sender — no domain verification required. (~205 tok)
- `send.ts` — In development, redirect all outbound email to Resend's safe test addresses. (~452 tok)

## lib/email/templates/

- `layout.ts` — Brand tokens — single source of truth for all email templates (~950 tok)
- `reset-password.ts` — Exports resetPasswordTemplate (~241 tok)
- `verify-email.ts` — Exports verifyEmailTemplate (~243 tok)

## lib/hooks/

- `useDebounce.ts` — Exports useDebounce (~102 tok)
- `useInfiniteScroll.ts` — Exports useInfiniteScroll (~776 tok)
- `useSearch.ts` — Exports useSearch (~604 tok)
- `useSearchModal.ts` — Exports useSearchModal (~212 tok)
- `useViewPreference.ts` — Exports useViewPreference (~252 tok)

## lib/lexical/

- `jsxConverters.tsx` — jsxConverters — renders chart (~683 tok)
- `richEditor.ts` — Full-featured Lexical editor for CryptoEdy content authors. (~914 tok)

## lib/notifications/

- `events.ts` — Sprint 3 stub — full notification engine built in Sprint 10. (~358 tok)
- `preferences.ts` — Get notification preferences for a user. (~587 tok)

## lib/posts/

- `mapToCardProps.ts` — Exports mapPostToCardProps (~506 tok)

## lib/profile/

- `actions.ts` — Exports ProfileData, getProfile, updateProfile, deleteAccount (~1021 tok)
- `avatar.ts` — API routes: GET (1 endpoints) (~756 tok)

## lib/utils/

- `timeAgo.ts` — Exports timeAgo (~154 tok)

## scripts/

- `add-course-search-vectors.sql` — Search vector migration for full-text search on courses and lessons (~730 tok)
- `add-search-vector.sql` — Search vector migration for full-text search on posts (~348 tok)
- `patch-next-env.cjs` — Preload environment variables BEFORE any ESM imports (~241 tok)
- `seed.ts` — CryptoEdy seed script — Sprint 3 (~39656 tok)

## styles/

- `admin-makeup.css` — Styles: 85 rules, 17 vars, 1 layers (~7774 tok)
- `admin.css` — CryptoEdy Admin Skin (~1596 tok)

## types/

- `next-auth.d.ts` — Declares Session (~148 tok)
