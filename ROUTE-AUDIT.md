# Pledgebook Route Audit Report

**Date:** February 19, 2026  
**Auditor:** Picasso (UI/UX Design Agent)  
**Project:** Pledgebook — Nuxt 3/Vue Application

---

## Executive Summary

This audit covers all routes in the Pledgebook application, verifying navigation consistency, checking for dead links, and identifying any route-related issues.

**Status: PASS** (after fixes applied)

---

## 1. Route Inventory

### Static Routes

| Route           | Page File                   | Status    |
| --------------- | --------------------------- | --------- |
| `/`             | `pages/index.vue`           | ✅ Active |
| `/about`        | `pages/about.vue`           | ✅ Active |
| `/blog`         | `pages/blog.vue`            | ✅ Active |
| `/careers`      | `pages/careers.vue`         | ✅ Active |
| `/categories`   | `pages/categories.vue`      | ✅ Active |
| `/community`    | `pages/community.vue`       | ✅ Active |
| `/contact`      | `pages/contact.vue`         | ✅ Active |
| `/cookies`      | `pages/cookies.vue`         | ✅ Active |
| `/dashboard`    | `pages/dashboard/index.vue` | ✅ Active |
| `/help`         | `pages/help.vue`            | ✅ Active |
| `/how-it-works` | `pages/how-it-works.vue`    | ✅ Active |
| `/my-disputes`  | `pages/my-disputes.vue`     | ✅ Active |
| `/my-pledges`   | `pages/my-pledges.vue`      | ✅ Active |
| `/my-vouches`   | `pages/my-vouches.vue`      | ✅ Active |
| `/partners`     | `pages/partners.vue`        | ✅ Active |
| `/press`        | `pages/press.vue`           | ✅ Active |
| `/pricing`      | `pages/pricing.vue`         | ✅ Active |
| `/privacy`      | `pages/privacy.vue`         | ✅ Active |
| `/roadmap`      | `pages/roadmap.vue`         | ✅ Active |
| `/settings`     | `pages/settings/index.vue`  | ✅ Active |
| `/terms`        | `pages/terms.vue`           | ✅ Active |

### Campaign Routes

| Route                      | Page File                           | Status    |
| -------------------------- | ----------------------------------- | --------- |
| `/campaigns`               | `pages/campaigns/index.vue`         | ✅ Active |
| `/campaigns/create`        | `pages/campaigns/create.vue`        | ✅ Active |
| `/campaigns/[id]`          | `pages/campaigns/[id].vue`          | ✅ Active |
| `/campaigns/[id]/evidence` | `pages/campaigns/[id]/evidence.vue` | ✅ Active |

### User Profile Routes (@ prefix)

| Route                         | Page File                              | Status    |
| ----------------------------- | -------------------------------------- | --------- |
| `/@[slug]`                    | `pages/@[slug]/index.vue`              | ✅ Active |
| `/@[slug]/pledges`            | `pages/@[slug]/pledges/index.vue`      | ✅ Active |
| `/@[slug]/pledges/[pledgeId]` | `pages/@[slug]/pledges/[pledgeId].vue` | ✅ Active |

### Category Routes

| Route                | Page File                     | Status    |
| -------------------- | ----------------------------- | --------- |
| `/categories/[slug]` | `pages/categories/[slug].vue` | ✅ Active |

### Documentation Routes

| Route             | Page File                  | Status    |
| ----------------- | -------------------------- | --------- |
| `/docs`           | `pages/docs/index.vue`     | ✅ Active |
| `/docs/admin`     | `pages/docs/admin.vue`     | ✅ Active |
| `/docs/api`       | `pages/docs/api.vue`       | ✅ Active |
| `/docs/campaigns` | `pages/docs/campaigns.vue` | ✅ Active |

### Admin Routes

| Route               | Page File                    | Status    |
| ------------------- | ---------------------------- | --------- |
| `/admin`            | `pages/admin/index.vue`      | ✅ Active |
| `/admin/ai-testing` | `pages/admin/ai-testing.vue` | ✅ Active |
| `/admin/review`     | `pages/admin/review.vue`     | ✅ Active |

### Dispute & Voucher Routes

| Route            | Page File                 | Status    |
| ---------------- | ------------------------- | --------- |
| `/disputes/[id]` | `pages/disputes/[id].vue` | ✅ Active |
| `/vouchers/[id]` | `pages/vouchers/[id].vue` | ✅ Active |

---

## 2. Issues Found & Fixed

### Fixed: Dead Links

| Issue                                                        | Location                   | Fix Applied                |
| ------------------------------------------------------------ | -------------------------- | -------------------------- |
| `/my-campaigns` linked but page doesn't exist                | `AppHeader.vue` mobile nav | Changed to `/dashboard`    |
| `/docs/guides/AI-GUIDE` doesn't exist                        | `admin/ai-testing.vue`     | Changed to `/docs`         |
| `/docs/guides/CRE-GUIDE` doesn't exist                       | `admin/ai-testing.vue`     | Changed to `/docs/api`     |
| "How It Works" linked to `/about` instead of `/how-it-works` | `AppHeader.vue` mobile nav | Changed to `/how-it-works` |

### Note: Sitemap Configuration

The `robots.txt` references a sitemap at `https://pledgebook.com/sitemap.xml`, but no sitemap module is configured in `nuxt.config.ts`.

**Recommendation:** Install `@nuxtjs/sitemap` module and configure it to auto-generate sitemap.xml from routes:

```bash
pnpm add @nuxtjs/sitemap
```

```ts
// nuxt.config.ts
modules: [
  // ... existing modules
  '@nuxtjs/sitemap',
],
sitemap: {
  hostname: 'https://pledgebook.com',
  gzip: true,
  exclude: ['/admin/**', '/settings/**'],
},
```

---

## 3. Navigation Consistency Check

### AppHeader.vue - Mobile Navigation

| Link Text       | Target Route        | Correct?   |
| --------------- | ------------------- | ---------- |
| Home            | `/`                 | ✅         |
| How It Works    | `/how-it-works`     | ✅ (fixed) |
| Create Campaign | `/campaigns/create` | ✅         |
| My Campaigns    | `/dashboard`        | ✅ (fixed) |
| My Pledges      | `/my-pledges`       | ✅         |

### AppHeader.vue - Category Navigation

| Link Text  | Target Route                 | Correct? |
| ---------- | ---------------------------- | -------- |
| Trending   | `/?filter=trending`          | ✅       |
| New        | `/?filter=new`               | ✅       |
| Categories | `/campaigns?category={slug}` | ✅       |

### AppFooter.vue - Footer Navigation

All footer links verified as pointing to valid routes.

---

## 4. Dynamic Route Pattern Consistency

### Campaign ID Pattern: `[id]`

- `/campaigns/[id]` ✅
- `/campaigns/[id]/evidence` ✅

### User Slug Pattern: `@[slug]`

- `/@[slug]` ✅
- `/@[slug]/pledges` ✅
- `/@[slug]/pledges/[pledgeId]` ✅

### Category Slug Pattern: `[slug]`

- `/categories/[slug]` ✅

### Voucher/Dispute ID Pattern: `[id]`

- `/vouchers/[id]` ✅
- `/disputes/[id]` ✅

**Verdict:** Dynamic route patterns are consistent across the application.

---

## 5. Query Parameter Routes

| Route with Query             | Purpose                   | Status |
| ---------------------------- | ------------------------- | ------ |
| `/?filter=trending`          | Home page trending filter | ✅     |
| `/?filter=new`               | Home page new filter      | ✅     |
| `/campaigns?category={slug}` | Category filter           | ✅     |

---

## Summary

- **Total Routes Audited:** 38
- **Dead Links Found:** 4 (all fixed)
- **Missing Sitemap:** Yes (recommendation provided)
- **Route Pattern Consistency:** ✅ Verified

---

_Report generated by Picasso UI/UX Design Agent_  
_"Every route tells a story."_
