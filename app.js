const $ = (s) => document.querySelector(s);
const state = { lomba: [], info: [], rekap: null };

async function readJSON(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Tidak dapat membaca ${path}`);
  return response.json();
}
function escapeHTML(value="") {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function renderLomba() {
  const term = ($("#searchLomba")?.value || "").toLowerCase().trim();
  const kategori = $("#filterKategori")?.value || "";
  const filtered = state.lomba.filter(item =>
    (`${item.nama} ${item.deskripsi} ${item.kategori}`).toLowerCase().includes(term) &&
    (!kategori || item.kategori === kategori)
  );
  const grid = $("#lombaGrid");
  if (!grid) return;
  grid.innerHTML = filtered.length ? filtered.map(item => `
    <article class="competition-card">
      <div class="comp-top"><span class="comp-icon">${escapeHTML(item.ikon || "🏅")}</span><span class="pill">${escapeHTML(item.kategori || "Lomba")}</span></div>
      <h3>${escapeHTML(item.nama)}</h3><p>${escapeHTML(item.deskripsi || "Informasi lomba akan diumumkan panitia.")}</p>
      <div class="comp-meta"><span>👤 ${escapeHTML(item.jenis || "Perorangan")}</span><span>⚥ ${escapeHTML(item.kategoriPeserta || "Putra/Putri")}</span></div>
      <a class="comp-register" href="pendaftaran.html?lomba=${encodeURIComponent(item.id)}">Pilih lomba ini →</a>
    </article>`).join("") : `<div class="empty-state">Lomba tidak ditemukan. Coba kata kunci lain.</div>`;
}

/* ====== STATISTIK PENDAFTARAN ====== */
function renderBars(items, labelKey, valueKey, extraKey) {
  if (!items || items.length === 0) return `<div class="empty-state">Belum ada data.</div>`;
  const max = Math.max(...items.map(x => Number(x[valueKey]) || 0)) || 1;
  return items.map(x => {
    const val = Number(x[valueKey]) || 0;
    const pct = Math.max(2, Math.round((val / max) * 100));
    const extra = extraKey && x[extraKey] !== undefined ? ` • ${x[extraKey]} lembaga` : "";
    return `<div class="bar-row">
      <div class="bar-label"><span>${escapeHTML(x[labelKey])}</span><b>${val}${extra}</b></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");
}
function formatTanggal(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString("id-ID", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" });
  } catch { return iso; }
}
function renderStatistik() {
  const wrap = $("#statistikWrap");
  if (!wrap) return;
  const rekap = state.rekap;
  if (!rekap || !rekap.ringkasan) {
    wrap.innerHTML = `<div class="empty-state">Belum ada data pendaftaran yang dipublikasikan. Panitia akan memperbarui data ini secara berkala.</div>`;
    return;
  }
  const r = rekap.ringkasan;
  wrap.innerHTML = `
    <div class="rekap-cards">
      <div class="rekap-card"><strong>${Number(r.jumlah_lembaga) || 0}</strong><span> Madrasah terdaftar</span></div>
      <div class="rekap-card"><strong>${Number(r.jumlah_pendaftaran_lomba) || 0}</strong><span> Pendaftaran lomba</span></div>
      <div class="rekap-card"><strong>${Number(r.jumlah_peserta) || 0}</strong><span> Total peserta</span></div>
      <div class="rekap-card"><strong>${Number(r.jumlah_cabang_lomba) || 0}</strong><span> Cabang lomba diikuti</span></div>
    </div>
    <div class="rekap-grid">
      <div class="rekap-block"><h3>Peserta per kategori lomba</h3>${renderBars(rekap.per_kategori_lomba, "kategori", "jumlah_peserta")}</div>
      <div class="rekap-block"><h3>Peserta per kategori peserta</h3>${renderBars(rekap.per_kategori_peserta, "kategori",  "jumlah_peserta")}</div>
    </div>
    <div class="rekap-block rekap-wide"><h3>Peserta per cabang lomba</h3>${renderBars(rekap.per_cabang_lomba, "nama", "jumlah_peserta", "jumlah_lembaga")}</div>
    <p class="small-note">Terakhir diperbarui: ${escapeHTML(formatTanggal(rekap.tanggal_ekspor))}</p>
  `;
}

async function init() {
  $("#year").textContent = new Date().getFullYear();
  $("#menuToggle")?.addEventListener("click", () => $("#mainNav").classList.toggle("open"));
  $("#mainNav")?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));
  $("#searchLomba")?.addEventListener("input", renderLomba);
  $("#filterKategori")?.addEventListener("change", renderLomba);
  try {
    const [profil, lombaData, infoData, rekapData] = await Promise.all([
      readJSON("data/profil.json"),
      readJSON("data/lomba.json"),
      readJSON("data/informasi.json"),
      readJSON("data/rekap.json").catch(() => null)   // rekap opsional
    ]);
    state.lomba = lombaData.lomba || [];
    state.info = infoData.informasi || [];
    state.rekap = rekapData;
    $("#profilRingkas").textContent = profil.ringkasan || "";
    $("#profilTujuan").textContent = profil.tujuan || "";
    $("#statLomba").textContent = state.lomba.length;
    $("#statKategori").textContent = new Set(state.lomba.map(x => x.kategori)).size;
    const select = $("#filterKategori");
    [...new Set(state.lomba.map(x => x.kategori).filter(Boolean))].sort().forEach(k => {
      const option = document.createElement("option"); option.value = k; option.textContent = k; select.append(option);
    });
    $("#infoList").innerHTML = state.info.length ? state.info.map(item => `
      <article class="info-card"><span class="info-date">${escapeHTML(item.tanggal || "PENGUMUMAN")}</span><h3>${escapeHTML(item.judul)}</h3><p>${escapeHTML(item.isi)}</p></article>`).join("") : `<div class="empty-state">Belum ada informasi.</div>`;
    renderLomba();
    renderStatistik();
  } catch (error) {
    $("#lombaGrid").innerHTML = `<div class="empty-state">Data JSON belum bisa dibaca.<br>Jalankan website melalui server lokal, misalnya XAMPP, lalu buka melalui alamat localhost.</div>`;
    $("#infoList").innerHTML = `<div class="empty-state">Pastikan file JSON tersedia di folder data.</div>`;
    const wrap = $("#statistikWrap");
    if (wrap) wrap.innerHTML = `<div class="empty-state">Statistik pendaftaran belum tersedia.</div>`;
  }
}
init();