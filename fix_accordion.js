const fs = require('fs');
const file = 'artifacts/smart-portal-rt/index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Tambah CSS accordion sebelum </style>
const cssAcc = 
/* === ACCORDION PENGATURAN === */
.acc-card { background:#fff; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:12px; overflow:hidden; }
.acc-header { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; cursor:pointer; user-select:none; font-weight:700; font-size:0.95rem; color:#1e293b; }
.acc-header:hover { background:#f8fafc; }
.acc-chevron { transition:transform 0.3s; font-size:0.85rem; color:#94a3b8; }
.acc-header.open .acc-chevron { transform:rotate(180deg); }
.acc-body { max-height:2000px; transition:max-height 0.4s ease, opacity 0.3s; opacity:1; overflow:hidden; }
.acc-body.closed { max-height:0; opacity:0; }
.acc-body-inner { padding:16px 18px 18px; border-top:1px solid #f1f5f9; };

// 2. Tambah JS accordion — di <script> TERPISAH setelah </style>
const jsAcc = 
<script>
window.toggleAcc = function(id, header) {
  var body = document.getElementById(id);
  if (!body) return;
  var isOpen = !body.classList.contains('closed');
  body.classList.toggle('closed', isOpen);
  header.classList.toggle('open', !isOpen);
};
</script>;

let changed = false;

if (!html.includes('/* === ACCORDION PENGATURAN === */')) {
  html = html.replace('</style>', cssAcc + '\n</style>');
  console.log('✅ CSS ditambahkan');
  changed = true;
} else {
  console.log('⏭️  CSS sudah ada');
}

if (!html.includes('window.toggleAcc')) {
  html = html.replace('</style>', '</style>' + jsAcc);
  console.log('✅ JS ditambahkan');
  changed = true;
} else {
  console.log('⏭️  JS sudah ada');
}

if (changed) {
  fs.writeFileSync(file, html);
  console.log('✅ File disimpan!');
}
