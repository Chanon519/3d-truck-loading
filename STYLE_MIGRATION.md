# STYLE_MIGRATION.md

> Purpose: Use this file when the project already works, but the UI feels generic, inconsistent, cluttered, or visually weak.
> This is not a color-token file. This is a full UI style migration guide for AI coding agents such as Codex, Claude Code, Cursor, or similar tools.

---

## 1. Primary Goal

Migrate the existing web application UI into a cohesive, polished, production-quality visual style based on the project's `DESIGN.md`.

The goal is to redesign the interface system-wide without breaking existing functionality.

This migration must improve:

- Visual hierarchy
- Layout composition
- Spacing rhythm
- Typography scale
- Component consistency
- Responsive behavior
- Interaction states
- Empty/loading/error states
- Overall product feel

Do not only change colors.

---

## 2. Required Files to Read First

Before making any UI change, read these files in this order:

1. `AGENTS.md` or `CLAUDE.md`
2. `DESIGN.md`
3. `FRONTEND_RULES.md` if it exists
4. Existing page/component files related to the current task

If any of these files conflict, follow this priority:

1. Existing working business logic
2. User request in the current task
3. `STYLE_MIGRATION.md`
4. `DESIGN.md`
5. Existing visual implementation

---

## 3. Hard Rules

### Must Preserve

- Existing routes
- Existing business logic
- Existing database schema
- Existing API contracts
- Existing authentication behavior
- Existing forms and validation logic
- Existing data fetching behavior
- Existing permissions and role behavior
- Existing user-facing Thai text, unless the user explicitly asks to rewrite copy

### Must Not Do

- Do not rewrite the entire app from scratch unless explicitly asked.
- Do not remove features.
- Do not rename routes without permission.
- Do not change database structure.
- Do not replace working logic with mock data.
- Do not introduce a new UI library unless explicitly requested.
- Do not create a visually impressive but unusable layout.
- Do not only apply new colors and call it a redesign.

---

## 4. Migration Mindset

Treat this as a product redesign, not a theme swap.

The new UI should feel like it was designed as one coherent product, not patched page-by-page.

Every screen should answer:

- What is the primary user action?
- What information matters first?
- What can be visually reduced?
- What can be grouped?
- What should be reused as a component?
- What should feel calm, fast, and obvious?

The UI should reduce cognitive load, especially on operational screens.

---

## 5. Visual Translation Rules

Use `DESIGN.md` as the visual source of truth, but adapt it to the existing product context.

Translate the design direction into:

- Page layout
- Navigation structure
- Card composition
- Table density
- Form grouping
- Modal behavior
- Button hierarchy
- Input states
- Typography rhythm
- Icon usage
- Empty states
- Loading states
- Error states
- Responsive layout

Do not copy only surface-level tokens.

A correct migration changes how the interface feels and reads, not just what color it uses.

---

## 6. UI Audit Before Editing

Before editing code, inspect the target page/component and identify:

1. Current layout structure
2. Repeated UI patterns
3. Visual clutter
4. Inconsistent spacing
5. Weak hierarchy
6. Poor responsive behavior
7. Components that should be extracted
8. States that are missing:
   - loading
   - empty
   - error
   - disabled
   - hover
   - active
   - selected

Then create a short implementation plan before applying changes.

---

## 7. Component System Migration

When refactoring UI, prefer reusable components over one-off styling.

Extract or improve components such as:

- `AppShell`
- `PageHeader`
- `SectionHeader`
- `MetricCard`
- `DataCard`
- `Toolbar`
- `SearchInput`
- `FilterBar`
- `StatusBadge`
- `ActionButtonGroup`
- `EmptyState`
- `LoadingSkeleton`
- `ResponsiveTable`
- `FormSection`
- `ConfirmDialog`
- `DetailPanel`
- `MobileBottomActionBar`

Each reusable component should:

- Match the style direction in `DESIGN.md`
- Support responsive layouts
- Support disabled/loading states when relevant
- Avoid hardcoded business-specific text unless necessary
- Be simple enough to reuse across pages

---

## 8. Layout Rules

### Desktop

Desktop layouts should feel structured, spacious, and intentional.

Use:

- Clear page headers
- Strong content grouping
- Consistent max-widths
- Predictable section spacing
- Sticky action areas only when useful
- Tables only when data comparison is the main task
- Cards only when they improve scanning

Avoid:

- Too many equal-weight cards
- Large empty gaps
- Random shadow usage
- Mixed border radius styles
- Multiple competing primary buttons
- Dense forms with no grouping

### Tablet

Tablet layouts should preserve operational speed.

Use:

- Larger touch targets
- Clear grouping
- Two-column layouts only when readable
- Sticky bottom actions for high-frequency workflows
- Avoid cramped tables

### Mobile

Mobile layouts should not be a squeezed desktop.

Use:

- Single-column hierarchy
- Collapsible filters
- Bottom action bars for important actions
- Cards instead of wide tables when needed
- Large enough tap targets
- Short labels where appropriate

---

## 9. Spacing Rules

Spacing should create rhythm.

Use consistent spacing steps from the existing design system or Tailwind scale.

Recommended rhythm:

- Tight internal spacing: `gap-2`, `gap-3`
- Normal component spacing: `gap-4`
- Section spacing: `gap-6`, `gap-8`
- Page spacing: `p-4`, `p-6`, `p-8` depending on viewport

Avoid random spacing values unless the project already uses custom tokens.

---

## 10. Typography Rules

Typography should clarify hierarchy.

Every page should have:

- One clear page title
- Optional short description
- Clear section labels
- Body text that does not overpower data
- Muted helper text
- Strong numeric/data emphasis where needed

Avoid:

- Too many font sizes
- All-bold interfaces
- Weak contrast between headings and body
- Long labels in buttons
- Centered text in data-heavy interfaces unless intentional

---

## 11. Button and Action Rules

Every screen should have a clear action hierarchy.

Use:

- One primary action per main context
- Secondary actions for alternatives
- Ghost/text buttons for low-priority actions
- Destructive styling only for dangerous actions
- Icons only when they improve recognition

Avoid:

- Multiple primary buttons in the same area
- Icon-only buttons without accessible labels
- Destructive actions placed beside safe primary actions without confirmation
- Large buttons everywhere

---

## 12. Form Migration Rules

Forms should feel calm and guided.

Improve forms by:

- Grouping related fields into sections
- Adding clear labels
- Keeping helper text subtle
- Aligning validation messages close to fields
- Making required fields obvious
- Keeping submit actions visible
- Using sensible input widths
- Avoiding unnecessary modal nesting

For long forms:

- Use sections
- Use progressive disclosure
- Use sticky save/cancel action area when useful
- Keep destructive actions separated

---

## 13. Table and Data Display Rules

Tables should be used when comparison matters.

Improve tables by:

- Adding clear toolbar/search/filter area
- Using readable row height
- Aligning numbers consistently
- Keeping status badges visually distinct
- Moving row actions into a predictable area
- Supporting empty states
- Supporting loading skeletons
- Making mobile behavior intentional

For mobile:

- Convert complex tables into cards when needed
- Keep key fields visible first
- Put secondary metadata below
- Put actions at the bottom of each card

---

## 14. Dashboard Rules

Dashboards should show insight, not decoration.

A good dashboard should include:

- Key metrics with clear labels
- Trend/context where useful
- Short summaries
- Prioritized alerts or next actions
- Charts only when they answer a real question

Avoid:

- Too many charts
- Decorative cards with no decision value
- Equal visual weight for everything
- Metrics without context
- Generic AI-looking dashboard layouts

---

## 15. Thai UI Rules

If the product UI is Thai-first:

- Preserve Thai copy unless the user asks to rewrite it.
- Keep labels short and natural.
- Avoid overly formal enterprise Thai unless the product requires it.
- Prefer clear action wording over literal translation.
- Make buttons sound like product UI, not documentation.
- Ensure Thai text does not break layout at mobile widths.

Examples:

- Use `บันทึก` instead of long save wording.
- Use `เพิ่มรายการ` when adding an item.
- Use `ยกเลิก` for cancel.
- Use `ลบ` only for destructive delete actions.
- Use `ดูรายละเอียด` for view details.

---

## 16. Interaction and Motion Rules

Interactions should feel smooth but not distracting.

Add or improve:

- Hover states
- Focus-visible states
- Active/selected states
- Disabled states
- Loading states
- Skeletons
- Subtle transitions
- Clear feedback after actions

Motion should be:

- Fast
- Functional
- Subtle
- Consistent

Avoid:

- Slow animations
- Large bouncing effects
- Random animation styles
- Motion that delays operational workflows

---

## 17. Accessibility Rules

Do not sacrifice accessibility for visual style.

Ensure:

- Sufficient color contrast
- Keyboard navigability
- Focus states
- Proper labels for inputs
- Accessible icon buttons
- Semantic headings
- Proper dialog behavior
- Error messages connected to fields
- Touch targets are large enough

---

## 18. Implementation Workflow

For each migration task:

1. Read the required files.
2. Inspect the current implementation.
3. Identify reusable UI patterns.
4. Create or update shared components first.
5. Refactor one page/area at a time.
6. Preserve existing logic.
7. Test desktop/tablet/mobile.
8. Check empty/loading/error states.
9. Remove duplicated styling.
10. Summarize changed files and remaining risks.

---

## 19. Page-by-Page Refactor Pattern

For each page:

### Step 1: Understand
- What is the page for?
- Who uses it?
- What is the main action?
- What data matters most?

### Step 2: Restructure
- Improve layout hierarchy.
- Group related controls.
- Reduce clutter.
- Make main actions obvious.

### Step 3: Restyle
- Apply visual direction from `DESIGN.md`.
- Use consistent spacing, radius, borders, shadows, and typography.
- Improve component states.

### Step 4: Responsiveness
- Check desktop.
- Check tablet.
- Check mobile.
- Replace tables with cards if needed.

### Step 5: Verify
- No route changed.
- No logic changed.
- No broken imports.
- No mock data introduced.
- No TypeScript errors.
- No accessibility regressions.

---

## 20. Recommended File Organization

When adding reusable UI, prefer a structure like:

```txt
src/
  components/
    layout/
      app-shell.tsx
      page-header.tsx
      section-header.tsx
    ui/
      metric-card.tsx
      status-badge.tsx
      empty-state.tsx
      loading-skeleton.tsx
      responsive-table.tsx
      form-section.tsx
    shared/
      toolbar.tsx
      filter-bar.tsx
```

Adapt this to the existing project structure.

Do not force this structure if the project already has a strong convention.

---

## 21. Quality Checklist

A migration is complete only when:

- The page looks visually aligned with `DESIGN.md`.
- Layout hierarchy is clearer than before.
- Main action is obvious.
- Existing functionality still works.
- Responsive behavior is intentionally designed.
- Shared patterns are extracted where useful.
- Empty/loading/error states exist where relevant.
- There are no obvious accessibility regressions.
- Code is cleaner or at least not worse than before.
- The UI does not look like a generic AI-generated dashboard.

---

## 22. Final Response Format for AI Agent

After completing a migration task, respond with:

1. Summary of what changed
2. Files changed
3. Components created/updated
4. Logic preserved
5. Responsive behavior checked
6. Known limitations or follow-up suggestions

Do not claim the migration is complete if only colors were changed.

---

## 23. Prompt Template

Use this prompt when asking an AI coding agent to migrate a page:

```txt
Read AGENTS.md, DESIGN.md, and STYLE_MIGRATION.md first.

Refactor the UI of [PAGE_OR_FEATURE_NAME] to match the design direction in DESIGN.md.

This is a style migration, not a logic rewrite.

Rules:
- Preserve all existing business logic, routes, API calls, database behavior, and Thai copy.
- Do not only change colors.
- Improve layout, spacing, hierarchy, typography, components, responsive behavior, and interaction states.
- Extract reusable components only when it clearly reduces duplication.
- Add or improve loading, empty, disabled, hover, focus, and error states where relevant.
- Make desktop, tablet, and mobile layouts intentional.
- Do not introduce mock data.
- Do not install a new UI library unless absolutely necessary and approved.

Before editing, audit the current implementation and make a short plan.
After editing, summarize changed files and anything I should review.
```

---

## 24. Definition of Done

The migration is done when the product feels like a coherent designed application, not a default template.

The UI should feel:

- Clear
- Calm
- Fast
- Consistent
- Useful
- Production-ready
- Aligned with `DESIGN.md`

If the page only has new colors, the migration is not done.
