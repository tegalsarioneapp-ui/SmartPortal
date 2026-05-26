file = 'artifacts/smart-portal-rt/index.html'
with open(file, 'r', encoding='utf-8') as f:
    html = f.read()

def patch(label, old, new):
    global html
    if old not in html:
        print(f'GAGAL: {label}')
        exit(1)
    html = html.replace(old, new, 1)
    print(f'OK: {label}')

patch('ACC Info + Push',
'''            <!-- Info Aplikasi Card -->
            <div class="card" style="margin-top:16px;border-top:4px solid #6366f1;">
                <div class="card-title-header" style="margin-bottom:16px;">
                    <h3><i class="fa-solid fa-circle-info" style="color:#6366f1;"></i> Info Aplikasi</h3>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center;">
                        <div style="font-size:1.6rem;font-weight:800;color:#6366f1;" id="info-total-data">â€"</div>
                        <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Total Data di Server</div>
                    </div>
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center;">
                        <div style="font-size:1.1rem;font-weight:700;color:#10b981;" id="info-last-sync">â€"</div>
                        <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Sync Terakhir</div>
                    </div>
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center;">
                        <div style="font-size:1rem;font-weight:700;color:#3b82f6;">v6.0 (Phase 6)</div>
                        <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Versi Aplikasi</div>
                    </div>
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center;">
                        <div style="font-size:1rem;font-weight:700;color:#f59e0b;" id="info-sse-status">â€"</div>
                        <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Status Realtime Sync</div>
                    </div>
                </div>
                <div style="font-size:0.8rem;color:#94a3b8;text-align:center;">
                    <i class="fa-solid fa-code"></i> Smart Portal RT 005 Tegalsari &bull; IndoDutaTech &bull; 2026<br>
                    <i class="fa-solid fa-server"></i> PostgreSQL (Replit DB) &bull; <i class="fa-solid fa-bolt"></i> SSE Realtime &bull; <i class="fa-brands fa-pwa"></i> PWA Ready
                </div>
                <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                    <button class="btn-action" style="background:#6366f1;margin:0;" onclick="refreshInfoAplikasi()"><i class="fa-solid fa-rotate"></i> Refresh Info</button>
                    <button class="btn-action" style="background:#10b981;margin:0;" onclick="window.__GT_SYNC_REFRESH__()"><i class="fa-solid fa-cloud-arrow-down"></i> Paksa Sync Sekarang</button>
                    <button class="btn-action" style="background:#3b82f6;margin:0;" onclick="showAuditDetail()"><i class="fa-solid fa-stethoscope"></i> Audit Server</button>
                </div>
            </div>

            
            <!-- Push Notification Card -->
            <div class="card" style="margin-top:16px;border-top:4px solid #7c3aed;">
                <div class="card-title-header" style="margin-bottom:16px;">
                    <h3><i class="fa-solid fa-bell" style="color:#7c3aed;"></i> Notifikasi Push ke Warga</h3>
                    <span id="push-sub-count" style="font-size:0.82rem;color:#64748b;background:#f3e8ff;padding:4px 10px;border-radius:20px;"></span>
                </div>''',

'''
            <!-- ACC 3: INFO APLIKASI -->
            <div class="acc-card">
                <div class="acc-header" onclick="toggleAcc('acc-info',this)">
                    <span><i class="fa-solid fa-circle-info" style="color:#6366f1;margin-right:8px;"></i> Info Aplikasi &amp; Status Server</span>
                    <i class="fa-solid fa-chevron-down acc-chevron"></i>
                </div>
                <div class="acc-body" id="acc-info">
                    <div class="acc-body-inner">
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center;">
                                <div style="font-size:1.6rem;font-weight:800;color:#6366f1;" id="info-total-data">-</div>
                                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Total Data di Server</div>
                            </div>
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center;">
                                <div style="font-size:1.1rem;font-weight:700;color:#10b981;" id="info-last-sync">-</div>
                                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Sync Terakhir</div>
                            </div>
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center;">
                                <div style="font-size:1rem;font-weight:700;color:#3b82f6;">v6.0 (Phase 6)</div>
                                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Versi Aplikasi</div>
                            </div>
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center;">
                                <div style="font-size:1rem;font-weight:700;color:#f59e0b;" id="info-sse-status">-</div>
                                <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">Status Realtime Sync</div>
                            </div>
                        </div>
                        <div style="font-size:0.8rem;color:#94a3b8;text-align:center;">
                            <i class="fa-solid fa-code"></i> Smart Portal RT 005 Tegalsari &bull; IndoDutaTech &bull; 2026<br>
                            <i class="fa-solid fa-server"></i> PostgreSQL (Replit DB) &bull; <i class="fa-solid fa-bolt"></i> SSE Realtime &bull; <i class="fa-brands fa-pwa"></i> PWA Ready
                        </div>
                        <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                            <button class="btn-action" style="background:#6366f1;margin:0;" onclick="refreshInfoAplikasi()"><i class="fa-solid fa-rotate"></i> Refresh Info</button>
                            <button class="btn-action" style="background:#10b981;margin:0;" onclick="window.__GT_SYNC_REFRESH__()"><i class="fa-solid fa-cloud-arrow-down"></i> Paksa Sync Sekarang</button>
                            <button class="btn-action" style="background:#3b82f6;margin:0;" onclick="showAuditDetail()"><i class="fa-solid fa-stethoscope"></i> Audit Server</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ACC 4: PUSH NOTIFIKASI -->
            <div class="acc-card">
                <div class="acc-header" onclick="toggleAcc('acc-push',this)">
                    <span><i class="fa-solid fa-bell" style="color:#7c3aed;margin-right:8px;"></i> Notifikasi Push ke Warga</span>
                    <i class="fa-solid fa-chevron-down acc-chevron"></i>
                </div>
                <div class="acc-body" id="acc-push">
                    <div class="acc-body-inner">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                            <span id="push-sub-count" style="font-size:0.82rem;color:#64748b;background:#f3e8ff;padding:4px 10px;border-radius:20px;"></span>
                        </div>''')

with open(file, 'w', encoding='utf-8') as f:
    f.write(html)
print('Part 3 selesai!')