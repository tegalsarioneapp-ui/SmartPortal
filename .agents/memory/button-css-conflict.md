---
name: Button CSS conflict root cause
description: Why buttons with bg-blue/green/red/gold classes become invisible in admin portal
---

**Rule:** All `<button>` elements with `bg-*` color classes MUST have complete inline `style="background:...;color:#fff;border:none;"` directly on the tag. CSS-class-only buttons are unreliable.

**Why:** `.gt-admin-admin-card-scope .card { color:#e5eefb !important }` has specificity 0,2,0 and overrides `.bg-blue { color:#fff !important }` (0,1,0). Result: white text on nearly-white background = invisible. The `gt-admin-admin-card-scope` class is dynamically added to `#admin-datakk` by JS at runtime.

**How to apply:**
- When adding any new button anywhere in the file, always include full inline style with background gradient and `color:#fff`.
- A nuclear CSS block `id="gt-nuclear-button-override-v2"` is placed at EOF as catch-all, but inline styles are the primary fix.
- Use Python regex `re.sub(r'<button([^>]*)>', fix_btn_tag, html)` to batch-fix, but be careful not to accidentally modify buttons inside JS template strings.
- The dynamically-generated buttons (in JS template literals) in loadAduanWarga, loadAduanAdmin, etc. were fixed by adding inline styles directly in the JS string.
