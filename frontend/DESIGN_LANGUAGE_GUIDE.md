# xPad Frontend Design Language Guide

This guide documents the core design language, styling conventions, and patterns used across the xPad EFB frontend. Keep these conventions in mind when adding new modules or modifying existing ones to maintain a premium, cohesive look.

## Core Aesthetics
The app uses a modern **Glassmorphism** dark mode aesthetic.
- **Backgrounds**: Transparent, semi-translucent layers over a dark global background.
- **Borders**: Thin, subtle white borders to define edges without clutter.
- **Depth**: Subtle shadows (`drop-shadow-md`, `shadow-2xl`) and blur effects to create layering.

## Tailored Utility Classes
We rely heavily on Tailwind CSS. Use these specific utilities to match the design system:

### 1. Panels & Cards (Glassmorphism)
To create standard modules, cards, or floating elements:
- **Background**: `bg-white/[0.03]`
- **Border**: `border border-white/[0.05]`
- **Hover States**: `hover:bg-white/[0.08]` (for interactive cards)
- **Border Radius**: Use rounded corners like `rounded-xl`, `rounded-[1.5rem]`, or `rounded-[1.75rem]` for larger panels.

### 2. Typography
- **Primary Text**: `text-text-primary`
- **Secondary Text (descriptions/subtitles)**: `text-text-secondary`
- **Labels / Headers**: Small, bold, spaced-out uppercase letters. 
  - Pattern: `text-[10px] font-bold tracking-widest uppercase text-text-secondary`
- **Weight**: Lean heavily into `font-bold` for readability in a dark flight simulator environment.

### 3. Interactive Elements (Buttons)
Buttons should feel tactile and responsive.
- **Animations**: `transition-all duration-200`
- **Click effect**: `active:scale-95` (makes the button slightly shrink when clicked)
- **Base Class**: Use `glass-button` (if defined in your global CSS) or recreate it using the Glassmorphism classes above.

### 4. Accent Colors & Icons
We map distinct accent colors to specific modules/actions using Tailwind custom colors.
- **Available Colors**: `accent-blue`, `accent-green`, `accent-purple`, `accent-orange`, `accent-red`, `accent-teal`.
- **Icons**: Use the `lucide-react` library. Ensure icons are consistently sized (e.g., `w-7 h-7` inside large buttons, `w-4 h-4` for inline text).

### 5. Loading States
For new modules that take time to load (like webviews or fetching data), use this standard pulsing icon pattern:
```tsx
<div className="relative">
    {/* Inner static icon container */}
    <div className="w-16 h-16 rounded-xl bg-accent-[COLOR]/10 border border-accent-[COLOR]/20 flex items-center justify-center">
        <LucideIcon className="w-7 h-7 text-accent-[COLOR]" />
    </div>
    {/* Outer pinging border */}
    <div className="absolute inset-0 rounded-xl border-2 border-accent-[COLOR]/30 animate-ping" />
</div>
```
*(Replace `[COLOR]` with the module's designated accent color, e.g., `blue`, `green`, `purple`).*

## Module Structure
When creating a new module component (e.g., `MyNewModule.tsx`):
1. **Container**: Make it consume all available space using `w-full h-full flex flex-col overflow-hidden relative`.
2. **Transparent Base**: The module container itself should usually have `bg-transparent`.
3. **Animations**: The `ModuleContainer` handles the `animate-page-enter` transition, so you do not need to add it to the inner module itself unless nesting views.
