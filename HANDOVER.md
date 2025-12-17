# Handover Document: まくぶーらいふ (Okinawa Housing Search)

## Status: v2.8 (Stable & Deployed)
**Last Updated:** 2025-12-17
**Deployment:** GitHub Pages (Check visible version: v2.8)

## 🚨 Critical Architectural Change (v2.6+)
To resolve persistent browser caching and script loading issues on the user's device, **the JavaScript logic has been moved INLINE into `index.html`**.
*   **Do not edit `script.js` directly.** It is currently unused.
*   **Edit `<script>` tags at the bottom of `index.html`** for logic changes.

## Project Overview
Unified real estate search portal for Okinawa. Generates search URLs for GooHome, Uchina Life, Suumo, etc.

## Technical Stack
*   **Core:** Single HTML file (`index.html`) + External CSS (`style.css`).
*   **Hosting:** GitHub Pages.
*   **No Build Process:** Edit and push.

## Recent Changes
*   **v2.8 (UI):** Back button moved to **Top-Left** (absolute positioning).
*   **v2.7 (UI):** Back button redesigned with **Glassmorphism** (blur, rounded).
*   **v2.6 (System):** **Inlined `script.js`** to `index.html` to fix "Unresponsive Buttons" bug caused by caching/loading race conditions. Added "System Ready" visual indicator.
*   **v2.5 (Fix):** Fixed `initApp` scope error that caused app crash.

## Key Files
*   [index.html](file:///Users/the1/.gemini/antigravity/scratch/okinawa-housing-search/index.html): **MAIN FILE.** Contains HTML structure AND JavaScript logic (bottom).
*   [style.css](file:///Users/the1/.gemini/antigravity/scratch/okinawa-housing-search/style.css): Styling.
    *   *Note:* Back button uses `.icon-button` class with `backdrop-filter`.

## Watchlist for Next Agent
1.  **Layout**: User requires **"Natural Scrolling"** (Legacy behavior). Do not implement `overscroll-behavior: none` or fixed viewports.
2.  **Logic Maintenance**: If the inline script becomes too large, consider moving back to external `script.js` BUT you must ensure robust cache-busting (e.g., `script.js?v=2.9`) and verify it works on the user's specific environment which seems prone to strong caching.
3.  **URL Generation**: Logic for 5 sites is complex. Verify `generateUrls()` function in `index.html` before changing.

## User Preferences
*   **Back Button**: Must be on the **Left**.
*   **Design**: Likes "Glassmorphism" / Premium feel.
*   **Communication**: Prefers direct confirmation that the site works (vX.X check).
