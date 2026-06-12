---
name: Phase 7 Bug Fixes
description: Which onclick functions were missing in Smart Portal RT and how they were fixed
---

## Missing onclick functions (all now defined)
All 11 were added in a Phase 7 injection block before the last </script>:
- closeModalBaca, simpanPasswordSistem, exportData, prosesImportData
- exportExcelWarga, exportExcelIuran, hapusDarurat
- refreshInfoAplikasi, refreshPushCount, kirimPushNotifikasi
- togglePushSubscription, bukaMenuResetData

## Critical API mismatches fixed
- VAPID key field: API returns `publicKey` not `vapidPublicKey`
- Subscribe payload: API expects raw PushSubscription object, not `{subscription, wargaNama}`

## New features added
- Agenda RT (admin CRUD + warga view) via db_agenda key
- quickFilterWarga + search input above Data KK table
- copyTelDarurat (data-tel attribute approach to avoid nested quote issues)
- scroll-to-top button JS wiring
- Ctrl+K global search popup
- Dashboard stats auto-refresh every 60s

**Why:** onclick handlers calling undefined functions silently fail in browser — no error, button does nothing.
**How to apply:** Before adding any onclick="fn()" in HTML, verify fn is defined in window scope.
