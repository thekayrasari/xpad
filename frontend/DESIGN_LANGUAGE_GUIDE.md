# xPad Design Language Guide

This is the **single source of truth** for all UI styling in the xPad frontend.
Every module MUST use the classes documented here. Do NOT invent ad-hoc Tailwind values.

---

## Core Aesthetic

**Solid Dark Mode** — professional, aviation-grade.
- No glassmorphism, no blur effects, no translucent backgrounds.
- Crisp borders, solid fills, tight corners (`rounded-md` / `rounded-lg`).
- Palette inspired by Navigraph — deep navy + slate + blue accent.

---

## Design Token Reference (from `index.css` `@theme`)

| Token | Value | Use |
|---|---|---|
| `dark-bg` | `#1a2435` | Root page background |
| `nav-bg` | `#16202e` | Sidebar, panel headers, input fills |
| `nav-hover` | `#243044` | Hover backgrounds |
| `pane-bg` | `#1e2d40` | Card / panel body background |
| `border-dark` | `#2a3a52` | All borders |
| `accent-blue` | `#287bcc` | Primary CTA, active state, links |
| `accent-teal` | `#2dd4bf` | Launcher, connectors |
| `accent-green` | `#10b981` | Success, VFR status |
| `accent-red` | `#ef4444` | Errors, warnings, IFR |
| `accent-orange` | `#f59e0b` | Delays, cert warnings |
| `accent-purple` | `#a855f7` | PDF module, LIFR |
| `text-primary` | `#f0f4f8` | Body text |
| `text-secondary` | `#8a9ab0` | Labels, placeholders, descriptions |

---

## Component Class Reference

### Panels & Cards

```html
<!-- Standard content card -->
<div class="xp-panel"> ... </div>

<!-- Panel header strip (always sits at top of xp-panel) -->
<div class="xp-panel-header"> ... </div>
```

`xp-panel` = `bg-pane-bg border border-border-dark rounded-lg`  
`xp-panel-header` = `flex items-center px-4 py-3 border-b border-border-dark bg-nav-bg rounded-t-lg`

---

### Inputs

**All** `<input>`, `<select>`, `<textarea>` elements must use:

```html
<input class="xp-input" ... />
<select class="xp-select xp-input" ... />
<textarea class="xp-input resize-none" ... />
```

`xp-input` = solid `bg-nav-bg`, `border-border-dark`, `rounded-md`, `focus:border-accent-blue focus:ring-accent-blue/40`

---

### Buttons

| Class | Use |
|---|---|
| `xp-btn` | Generic neutral action |
| `xp-btn-primary` | Save, Send, Confirm — blue |
| `xp-btn-danger` | Destructive actions — red tint |
| `xp-btn-ghost` | Icon buttons, toolbar tools, secondary |
| `xp-btn-orange` | Delay transmit, warning CTAs |
| `xp-btn-purple` | PDF browse |

All share the same base shape: `rounded-md text-xs font-bold uppercase tracking-wide active:scale-95 transition-all`.

---

### Typography Helpers

```html
<label class="xp-label">Field Label</label>
<span class="xp-overline">STAT HEADER</span>
<h3 class="xp-section-title">Section Name</h3>
```

---

### Tabs

```html
<button class="xp-tab">Tab Name</button>
<button class="xp-tab xp-tab-active">Active Tab</button>
```

---

### Badges / Pills

```html
<span class="xp-badge">VFR</span>
<!-- Override color inline for accent variants -->
<span class="xp-badge text-accent-green border-accent-green/30 bg-accent-green/10">VFR</span>
```

---

### Toolbars

```html
<!-- Bottom action strip -->
<div class="xp-toolbar justify-end rounded-b-lg">
    <button class="xp-btn-primary">...</button>
</div>
```

---

### Empty States

```html
<div class="xp-empty h-full">
    <IconName class="w-16 h-16" />
    <p class="text-lg font-bold">No data yet</p>
    <p class="text-sm">Descriptive hint text.</p>
</div>
```

---

### Stat Cards (VPilot, Weather…)

```html
<div class="xp-stat-card flex-1">
    <span class="xp-overline">COM 1</span>
    <span class="text-2xl font-bold text-accent-blue">118.700</span>
</div>
```

---

## Module Container Rules

1. Root element: `w-full h-full flex flex-col font-sans text-text-primary bg-transparent overflow-hidden`
2. Scrollable area: `flex-1 overflow-y-auto hide-scrollbar px-6 md:px-8 pt-4 pb-6`
3. Inner panels: use `xp-panel` — never raw `bg-white/[0.03]` etc.

---

## Icons

Use `lucide-react` exclusively. Size: `w-4 h-4` (inline), `w-5 h-5` (standalone), `w-16 h-16` (empty state).

---

## What NOT to use

| ❌ Old class | ✅ Replacement |
|---|---|
| `glass-panel` | `xp-panel` |
| `glass-button` | `xp-btn-ghost` |
| `bg-white/[0.03]` | `bg-pane-bg` or `bg-nav-bg` |
| `border-white/[0.05]` | `border-border-dark` |
| `rounded-xl`, `rounded-2xl`, `rounded-[1.5rem]` | `rounded-md` or `rounded-lg` |
| `bg-black/20` | `bg-nav-bg` |
| `text-[10px] font-bold tracking-widest uppercase` | `xp-overline` or `xp-label` |
