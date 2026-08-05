# InvoiceFine Mobile UI System

_Last updated: 2026-08-04_

## Direction

Android-first, Material 3-inspired, compact and trustworthy. Identity: **Pocket ERP for Indian Small Business**. Favor action clarity, rounded cards, strong hierarchy, accessible contrast, and restrained motion.

## Theme

Automatic light/dark mode is active.

Light reference: background `#F7F7F8`, surface `#FFFFFF`, surface variant `#F1F1F3`, accessible coral primary `#D93632`, text `#19191B`, muted `#74747C`, border `#E5E5E8`.

Dark reference: background `#0B0B0D`, surface `#1B1B1E`, surface variant `#27272B`, text `#F8F8F9`, muted `#A8A8AF`, border `#303034`, accessible coral primary `#D93632`.

Positive, warning, and danger must include text/icon meaning; color alone is insufficient. Do not hardcode white input surfaces or dark text on theme-aware screens.

## Layout and type

- responsive from 360dp
- screen padding 16
- spacing scale: 4, 8, 12, 16, 24, 32, 48
- minimum touch target 44×44
- input/button height 48–52
- title 24–28, section 18, body 16, secondary 14, caption 12
- tabular numerals for currency
- cards normally radius 12–20 with a subtle border

## Navigation and safe areas

Five tabs: Dashboard, Invoices, Customers, Catalog, More. Respect top/bottom insets and Android gesture navigation. Tab bar and status icons follow theme. Do not use fixed fake status-bar padding.

## Components and states

Reuse shared Input, Button, Card, MoneyText, ScreenContainer, EmptyState, LoadingState, Skeleton, PressableScale, and SwipeActionRow patterns. Every data screen needs loading/skeleton, empty, populated, recoverable error, disabled/submitting, and success feedback.

## Motion and haptics

- use native-driver opacity/transform animations where possible
- respect reduced-motion accessibility setting
- keep transitions short and functional
- haptics are optional feedback, never the only confirmation
- use selection/light feedback for navigation/actions, warning before destructive confirmation, success/error after outcomes

## Swipe actions

Horizontal intent must be clearly distinguished from vertical scrolling. Swipe actions require tap, long-press, overflow, or accessibility alternatives. Archive/delete requires confirmation. A closed swipe row must not make its action the only discoverable path.

## Reports

Reusable SVG charts must work at 360dp, in light/dark themes, with empty/single-point/large-value datasets. Provide accessible labels. Chart taps may filter related aggregates. Never load full business tables into JavaScript for visualization.

## Invoice UX

Fast searchable customer/item selection, recent items, duplicate selection increment, one-tap quantities, visible totals, draft save, and explicit finalization confirmation. Prevent duplicate submissions.

## Required review

360dp, 390–412dp, large font, long names, large currency values, keyboard open, TalkBack, light/dark switch, Android button and gesture navigation.
