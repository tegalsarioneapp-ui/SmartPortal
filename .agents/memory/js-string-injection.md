---
name: JS-string injection pitfall
description: How Python html.replace() can accidentally modify strings inside JS template literals in index.html
---

**Rule:** Never use `html.replace('</head>', css_block)` or `html.replace('</style></head><body>', ...)` when the file contains those exact strings inside JavaScript string concatenations (e.g. `+'</style></head><body>'`).

**Why:** The cetakLaporanBulanan function (and similar PDF generators) builds an HTML document as a JS string with `+'</style></head><body>'`. A naive `html.replace()` will match BOTH the real `</head>` in the HTML document AND the one inside the JS string, injecting CSS into the middle of a JS string literal — causing a SyntaxError at runtime.

**How to apply:**
- Always inject CSS/HTML by replacing a UNIQUE nearby marker that only appears once, e.g. `<script id="gt-toggle-sidebar-restore">` or a specific comment.
- After injection, verify the injected block doesn't appear in a JS-string context by checking `"+'<style" not in html`.
- The file also has `+'</head><body>'` (without `</style>`) — same risk applies.
