---
name: Smart Portal RT data keys
description: Canonical localStorage/PostgreSQL keys and field schemas for Smart Portal RT 005
---

**Rule:** Always use these canonical key names. Old keys (db_req_surat, db_kk) are legacy — never write to them.

**Keys and schemas:**

`db_warga` — array of KK objects:
```
{ id, nama, kk(noKK), nik, pekerjaan, pendapatan, telp, bpjs, email, istri, alamat,
  anak(string[]), aktif(boolean), statusSosial('Umum'|'Janda'|'Duda'|'Lansia'|'Difabel'|'Duafa') }
```

`db_iuran` — array:
```
{ id, idWarga, nama, bulan(lowercase), tahun, nominal, posted(boolean), status, tglBayar }
```

`db_req_surat_v2` — canonical surat key (NOT db_req_surat which is legacy):
```
{ id, nama, nik, tglPengajuan, keperluan, jenis, status('Menunggu'|'Disetujui'|'Ditolak'), tglDisetujui }
```

`db_settings` / `db_pengaturan` — RT configuration:
```
{ namaRT, namaKetua, namaBen, namaSekretaris, alamatRT, nomIuran/nominalIuran, noRT, noRW }
```

`db_kas` — kas transactions:
```
{ id, tgl, uraian, jenis('masuk'|'keluar'), nominal, saldo, kategori }
```

`db_aduan`:
```
{ id, tglAsli(YYYY-MM), tglTampil, idPelapor, namaPelapor, kategori, judul, isi, foto(b64|null), status('Menunggu'|'Diproses'|'Selesai') }
```

**localStorage-only keys (never sync):**
`isLoggedIn`, `loggedInAs`, `loggedInWarga`, `gt_theme`, `gt_notif_read`, prefix `gt_local_`
