f = open('artifacts/smart-portal-rt/index.html','r',encoding='utf-8')
html = f.read()
f.close()

import re
idx = html.find('id="surat" class="admin-tab-content"')
idx_end = html.find('<div id="admin-publikasi"', idx)
panel = html[idx:idx_end]
tbodys = re.findall(r'<tbody[^>]*id="([^"]+)"', panel)
print('tbody di panel surat:', tbodys)
print('panel length:', len(panel))
print('preview:', re.sub(r'\s+',' ', panel).strip()[:400])
