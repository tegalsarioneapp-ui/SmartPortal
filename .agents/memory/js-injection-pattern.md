---
name: JS Injection Pattern for index.html
description: How to safely inject JavaScript into the CRLF-encoded index.html
---

## The Problem
index.html uses \r\n (Windows CRLF) line endings.
When Python splits by '\r\n', injected blocks that use '\n' appear as ONE large array element.
If you later do `lines[i] = "new single line"` to patch something inside that block,
you REPLACE the ENTIRE multi-line block with just one line — truncating the rest.

## Safe Injection Pattern
Always inject code as individual lines in the \r\n-split array:
```python
new_lines = [
    'line 1 of code',
    'line 2 of code',
    ...
]
lines = lines[:insert_idx] + new_lines + lines[insert_idx:]
```
NEVER inject as a single multiline string with \n separators.

## String Replacement Pattern  
For inline onclick handlers that call functions with dynamic arguments, always use data attributes
to avoid nested quote escaping nightmares:
```html
<button data-id="${item.id}" onclick="myFunc(this.dataset.id)">
```
NOT:
```html
<button onclick="myFunc('${item.id}')">  <!-- safe if id is simple -->
<button onclick="myFunc(\'${item.id}\')">  <!-- NEVER in JS string templates -->
```

**Why:** The quote escaping in JS string concatenation for HTML attributes is fragile and creates
syntax errors that Node --check doesn't catch (because it reads the block as text, not as a
runtime string template).
