---
description: How to maintain the Daiwanmaru Brand Design in new components/pages
---
To maintain the **Daiwanmaru Editorial Minimalist** style, follow these architectural and visual rules:

### 1. Typography Setup
- Use `serif` class (Playfair Display) for ALL headings (H1, H2, H3).
- Use `font-sans` or the default (Inter) for body text and UI labels.
- For small labels, use the `tracking-editorial` utility:
  ```tsx
  <span className="tracking-editorial text-slate-500 font-bold">Label Text</span>
  ```

### 2. Layout Structure
- **Grid Separation**: Use thin borders instead of shadows.
  - Border color: `border-slate-100` or `border-slate-50`.
  - Border width: `border` (1px).
- **Whitespace**: Use generous padding. Default section padding should be `py-20` or `py-24`.
- **Centering**: Main branding elements should be centered.

### 3. Imagery Style
- Always apply a subtle grayscale to images by default: `grayscale-[20%]`.
- On hover, transition to full color: `hover:grayscale-0 transition-all duration-700`.
- Use `aspect-ratio` containers to keep images structured in the grid.

### 4. Color Constraints
- Background: Always `bg-white`.
- Text: Primary text `text-slate-900`, secondary `text-slate-500`.
- Accents: Use `text-blue-600` or `bg-blue-600` sparingly for focus points.

### 5. Tool Naming Conventions
- Always follow the **[Target Noun] + [Actioner]** rule (e.g., *Image Resizer*).
- Never include "Daiwanmaru" in the tool name itself.
- See `docs/agent/tool-naming.md` for full details.

### 6. Navbar & Footer Consistency
- Do NOT add external elements like social icons to the Navbar (keep it in the Footer).
- The Navbar must retain the centered logo and the slogan-on-top structure.
- The Footer should be clean with uppercase labels and the "Everything is Creative" signature.

---
// turbo-all
// Add this workflow to your context whenever creating new web features for Daiwanmaru.
