js = open("js_baru.txt", "w", encoding="utf-8")
js.write("""window.loadMatriksIuran = function() {
        var dbIuran    = JSON.parse(localStorage.getItem('db_iuran')  || '[]');
        var dbWarga    = JSON.parse(localStorage.getItem('db_warga')  || '[]');
        var dbJI       = JSON.parse(localStorage.getItem('db_jenis_iuran') || '[]');
        if(!dbJI.length) dbJI = [{nama:'Kas RT',nominal:10000},{nama:'Sampah',nominal:5000},{nama:'Sosial',nominal:5000}];
        var nominalStd = dbJI.reduce(function(s,x){ return s+(x.nominal||0); }, 0) || 25000;
        var validWarga = dbWarga.filter(function(w){ return w && w.nama && w.nama.trim() !== ''; });
        var bulanArr   = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        var bulanShort = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        var now        = new Date();
        var bulanIni   = bulanArr[now.getMonth()];
        var el         = function(id){ return document.getElementById(id); };
        var totalWarga=validWarga.length, lunasIni=0, belumIni=0, pendingCount=0, kurangCount=0;
        var uangTertahan=dbIuran.filter(function(x){return !x.posted;}).reduce(function(s,i){return s+(Number(i.nominal)||0);},0);
        var uangMasuk=dbIuran.filter(function(x){return x.posted;}).reduce(function(s,i){return s+(Number(i.nominal)||0);},0);
        validWarga.forEach(function(w){
            var b=dbIuran.find(function(i){return String(i.idWarga)===String(w.id)&&i.bulan===bulanIni;});
            if(b){ if(b.posted){ if(Number(b.nominal)<nominalStd)kurangCount++; else lunasIni++; } else pendingCount++; }
            else belumIni++;
        });
        if(el('mtrx-stat-total'))   el('mtrx-stat-total').textContent=totalWarga;
        if(el('mtrx-stat-lunas'))   el('mtrx-stat-lunas').textContent=lunasIni;
        if(el('mtrx-stat-belum'))   el('mtrx-stat-belum').textContent=belumIni;
        if(el('mtrx-stat-pending')) el('mtrx-stat-pending').textContent=pendingCount;
        if(el('iuran-stat-kurang')) el('iuran-stat-kurang').textContent=kurangCount;
        if(el('ben-total-iuran-terkumpul')) el('ben-total-iuran-terkumpul').textContent=fmt(uangMasuk);
        if(el('ben-iuran-hold'))    el('ben-iuran-hold').textContent=fmt(uangTertahan);
        var pct=totalWarga>0?Math.round((lunasIni/totalWarga)*100):0;
        if(el('mtrx-progress-bar'))         el('mtrx-progress-bar').style.width=pct+'%';
        if(el('mtrx-progress-pct'))         el('mtrx-progress-pct').textContent=pct+'%';
        if(el('mtrx-progress-label-kiri'))  el('mtrx-progress-label-kiri').textContent=lunasIni+' lunas';
        if(el('mtrx-progress-label-kanan')) el('mtrx-progress-label-kanan').textContent=belumIni+' belum bayar';
        var wrap=el('mtrx-accordion-wrap');
        if(!wrap) return;
        wrap.innerHTML='';
        if(!validWarga.length){
            wrap.innerHTML='<div style="text-align:center;padding:40px;color:#94a3b8;">Belum ada data warga.</div>';
            return;
        }
        var sorted=validWarga.slice().sort(function(a,b){return String(a.nama).localeCompare(String(b.nama));});
        sorted.forEach(function(w){
            var totalRow=0,lunasCount=0,pendingRow=0,kurangRow=0,bulanData=[];
            bulanArr.forEach(function(bln,idx){
                var sudahTiba=idx<=now.getMonth();
                var bayar=dbIuran.find(function(i){return String(i.idWarga)===String(w.id)&&i.bulan===bln;});
                var status='future',nominal=0;
                if(bayar){
                    nominal=Number(bayar.nominal)||0; totalRow+=nominal;
                    if(bayar.posted){if(nominal<nominalStd){status='kurang';kurangRow++;}else{status='lunas';lunasCount++;}}
                    else{status='pending';pendingRow++;}
                } else if(sudahTiba) status='belum';
                bulanData.push({bln:bln,short:bulanShort[idx],status:status,nominal:nominal,sudahTiba:sudahTiba});
            });
            var stIni=bulanData[now.getMonth()]?bulanData[now.getMonth()].status:'belum';
            var bColor={'lunas':'#dcfce7','pending':'#fef9c3','kurang':'#ffedd5','belum':'#fee2e2','future':'#f1f5f9'};
            var bText={'lunas':'#166534','pending':'#854d0e','kurang':'#9a3412','belum':'#991b1b','future':'#94a3b8'};
            var bLabel={'lunas':'LUNAS','pending':'PENDING','kurang':'KURANG','belum':'BELUM','future':'-'};
            var fgMap={'lunas':'#16a34a','pending':'#d97706','kurang':'#ea580c','belum':'#dc2626','future':'#cbd5e1'};
            var iconMap={'lunas':'fa-check-double','pending':'fa-clock','kurang':'fa-triangle-exclamation','belum':'fa-xmark','future':'fa-minus'};
            var totalBulanTiba=bulanData.filter(function(b){return b.sudahTiba;}).length||1;
            var pctRow=Math.round((lunasCount/totalBulanTiba)*100);
            var pbarColor=pctRow>=100?'#10b981':pctRow>=60?'#f59e0b':'#ef4444';
            var avatarLetter=String(w.nama).charAt(0).toUpperCase();
            var avatarBg=['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#0ea5e9'][w.id%6]||'#6366f1';
            var cellHTML=bulanData.map(function(b){
                var oc=(b.sudahTiba||b.status!=='future')?'onclick="inputIuranCepat('+w.id+',\\''+b.bln+'\\')\"':'';
                return '<div class="mtrx-bulan-cell '+b.status+'" '+oc+' title="'+b.bln+(b.nominal?' - '+fmt(b.nominal):'')+'">'+
                    '<i class="fa-solid '+iconMap[b.status]+'" style="color:'+fgMap[b.status]+';font-size:1rem;"></i>'+
                    '<span>'+b.short+'</span>'+
                    '<span style="font-size:0.65rem;">'+(b.nominal?fmt(b.nominal):'-')+'</span>'+
                '</div>';
            }).join('');
            var detailBar='<div class="mtrx-detail-bar">'+
                '<span style="font-size:0.8rem;color:#64748b;font-weight:600;"><i class="fa-solid fa-coins" style="color:#f59e0b;"></i> Total: <b>'+fmt(totalRow)+'</b></span>'+
                '<span style="font-size:0.8rem;color:#64748b;font-weight:600;"><i class="fa-solid fa-check" style="color:#10b981;"></i> Lunas: <b>'+lunasCount+'/'+totalBulanTiba+'</b></span>'+
                (kurangRow?'<span style="font-size:0.8rem;color:#ea580c;font-weight:600;"><i class="fa-solid fa-triangle-exclamation"></i> Kurang: '+kurangRow+'</span>':'')+
                (pendingRow?'<span style="font-size:0.8rem;color:#d97706;font-weight:600;"><i class="fa-solid fa-clock"></i> Pending: '+pendingRow+'</span>':'')+
                '<div style="margin-left:auto;display:flex;gap:6px;">'+
                    '<button class="btn-action" style="background:#6366f1;color:#fff;padding:5px 10px;font-size:0.75rem;border-radius:8px;" onclick="inputIuranCepat('+w.id+',\\''+bulanIni+'\\')"><i class="fa-solid fa-plus"></i> Input</button>'+
                    '<button class="btn-action" style="background:#0ea5e9;color:#fff;padding:5px 10px;font-size:0.75rem;border-radius:8px;" onclick="lihatKartuWarga('+w.id+')"><i class="fa-solid fa-id-card"></i></button>'+
                '</div>'+
            '</div>';
            var rowHTML='<div class="mtrx-accordion-item" style="border-radius:12px;overflow:hidden;margin-bottom:6px;">'+
                '<div class="mtrx-row-header" onclick="toggleMtrxRow('+w.id+')" id="mtrx-hdr-'+w.id+'">'+
                    '<div style="width:36px;height:36px;border-radius:50%;background:'+avatarBg+';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.9rem;flex-shrink:0;">'+avatarLetter+'</div>'+
                    '<div class="mtrx-nama-col">'+
                        '<div class="mtrx-nama-text">'+w.nama+'</div>'+
                        '<div class="mtrx-prog-inline">'+
                            '<div class="mtrx-prog-inline-bar"><div class="mtrx-prog-inline-fill" style="width:'+pctRow+'%;background:'+pbarColor+';"></div></div>'+
                            '<span style="font-size:0.7rem;color:#64748b;font-weight:600;">'+pctRow+'%</span>'+
                        '</div>'+
                    '</div>'+
                    '<span style="font-size:0.75rem;background:'+bColor[stIni]+';color:'+bText[stIni]+';border-radius:999px;padding:3px 10px;font-weight:800;flex-shrink:0;">'+bLabel[stIni]+'</span>'+
                    '<span style="font-size:0.8rem;color:#64748b;font-weight:600;flex-shrink:0;">'+fmt(totalRow)+'</span>'+
                    '<i class="fa-solid fa-chevron-down mtrx-chevron"></i>'+
                '</div>'+
                '<div class="mtrx-row-body" id="mtrx-body-'+w.id+'">'+
                    '<div class="mtrx-bulan-grid">'+cellHTML+'</div>'+
                    detailBar+
                '</div>'+
            '</div>';
            wrap.innerHTML+=rowHTML;
        });
        window._matriksAllItems=Array.from(wrap.querySelectorAll('.mtrx-accordion-item'));
    };
    window.toggleMtrxRow = function(wid) {
        var hdr=document.getElementById('mtrx-hdr-'+wid);
        var body=document.getElementById('mtrx-body-'+wid);
        if(!hdr||!body) return;
        var isOpen=hdr.classList.contains('open');
        document.querySelectorAll('.mtrx-row-header.open').forEach(function(h){h.classList.remove('open');});
        document.querySelectorAll('.mtrx-row-body.open').forEach(function(b){b.classList.remove('open');});
        if(!isOpen){hdr.classList.add('open');body.classList.add('open');}
    };
    window.filterMatriksIuran = function(q,status) {
        var items=window._matriksAllItems||[];
        var sq=(q||'').toLowerCase().trim();
        var sf=status||(document.getElementById('mtrx-filter-status')?document.getElementById('mtrx-filter-status').value:'');
        items.forEach(function(item){
            var nama=(item.querySelector('.mtrx-nama-text')||{}).textContent||'';
            var badge=(item.querySelector('.mtrx-row-header span')||{}).textContent||'';
            var matchQ=!sq||nama.toLowerCase().includes(sq);
            var matchS=!sf||badge.trim()===sf;
            item.style.display=(matchQ&&matchS)?'':'none';
        });
    };

""")
js.close()
print("OK: js_baru.txt tersimpan!")
