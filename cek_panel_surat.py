import re

f = open('artifacts/smart-portal-rt/index.html','r',encoding='utf-8')
html = f.read()
f.close()

print('File size:', len(html))

# Cek panel surat
idx = html.find('id="surat" class="admin-tab-content"')
idx_end = html.find('id="admin-publikasi"', idx)
panel = html[idx:idx_end]
print('Panel surat length:', len(panel))
print()

# Semua tbody
print('=== TBODY DI PANEL SURAT ===')
tbodys = re.findall(r'tbody[^"\']*id[^"\']*["\']([^"\']+)["\']', panel)
print('tbody ids:', tbodys)

# Tampilkan HTML panel
print()
print('=== HTML PANEL (2000 chars) ===')
clean = re.sub(r'\s+',' ', panel).strip()
print(clean[:2000])

# Cek callback tab surat
print()
print('=== CALLBACK TAB SURAT ===')
for kw in ["'surat': function", '"surat": function', 'loadSuratAdmin']:
    idx3 = html.find(kw)
    if idx3 != -1:
        print(kw, ':', re.sub(r'\s+',' ', html[idx3:idx3+150]).strip())
