---
description: How to maintain and implement the Apple Glass Mastery UI style
---

# Apple Glass Mastery UI Design System

This design system is inspired by Apple's glassmorphism and the Bitget Wallet interface. It prioritizes visual depth, frosted transparency, and vibrant accents.

## 1. Core Aesthetics
- **Background**: A deep, moody gradient. 
  - `linear-gradient(180deg, #A41F1F 0%, #000000 40%, #1a1a1a 100%)`
- **Glass Effect**: 
  - Background: `rgba(255, 255, 255, 0.85)`
  - Blur: `backdrop-filter: blur(20px);`
  - Border Radius: `28px` for large panels, `20px` for cards.
  - Shadow: `0 8px 32px 0 rgba(31, 38, 135, 0.07)`

## 2. Color Palette
- **Primary (Blue)**: `#00C2FF` (Bitget Cyan)
- **Secondary (Red)**: `#FF3B30` (Apple Red)
- **Success (Green)**: `#34C759` (Apple Green)
- **Neutral (Black/White)**: `#000000` / `#FFFFFF`
- **Text Secondary**: `#8e8e93` (iOS Gray)

## 3. UI Components
### Header
- High hierarchy balance ($48px Bold).
- Search bar with glass blur.
- Secondary stats in Green.

### Quick Actions
- Circular blurred icons (`44x44px`).
- Centered labels.

### Floating Navigation
- Capsule shape (`height: 75px`).
- Centered "Swap/Add" button with vibrant background and elevation.
- Active state icons use `#00C2FF`.

### Goal Tracking
- Radial progress bars with inner blur.
- Large numerical counters for "Years to Goal".

## 4. Implementation Rules
- NEVER use flat backgrounds for cards; always use the `rgba` + `blur` combination.
- ALWAYS use the `Outfit` font family.
- Icons must be consistent (Lucide icons).
- Maintain an iPhone aspect ratio (`max-width: 390px`) for the core app container.
- Use smooth transitions (`cubic-bezier(0.25, 0.1, 0.25, 1)`) for view switching.
