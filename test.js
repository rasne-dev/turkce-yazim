const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('🧪 TürkçeYazım Test Paketi Başlatılıyor...\n');

// 1. index.html dosyasını oku ve script içeriğini çıkar
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('❌ index.html içinde <script> bloğu bulunamadı!');
  process.exit(1);
}

const scriptCode = scriptMatch[1];

// 2. Mock ortamı
const mockEl = () => ({
  style: {},
  classList: { add: () => {}, remove: () => {}, toggle: () => false },
  addEventListener: () => {},
  appendChild: () => {},
  setAttribute: () => {},
  focus: () => {},
  click: () => {},
  value: '',
  textContent: '',
  innerHTML: '',
  scrollHeight: 100,
  files: []
});

const defaultEl = mockEl();

const sandbox = {
  window: {},
  document: {
    getElementById: () => mockEl(),
    querySelectorAll: () => [],
    createElement: () => mockEl(),
    addEventListener: () => {},
    activeElement: null,
    body: mockEl()
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  navigator: {},
  setTimeout: () => {},
  clearTimeout: () => {},
  URL: { createObjectURL: () => '', revokeObjectURL: () => {} },
  FileReader: function() { this.readAsText = () => {}; },
  module: { exports: {} },
  console
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

try {
  vm.runInNewContext(scriptCode, sandbox);
} catch (e) {
  console.error('Script yüklenirken hata:', e);
  process.exit(1);
}

const engine = sandbox.module.exports;
assert(engine && engine.analyze, 'analyze fonksiyonu module.exports içinde bulunmalıdır');

console.log('✅ index.html motoru başarıyla yüklendi.');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ ${desc}`);
    console.error(`    Hata: ${err.message}`);
    failed++;
  }
}

// ==========================================
// TESTLER
// ==========================================

console.log('\n--- 1. TDK 2023 & Güncel Kurallar ---');
it('ünvan -> unvan düzeltmesi yapılmalıdır', () => {
  const res = engine.analyze('Müdürün ünvanı değişti.');
  const item = res.find(r => r.word.toLowerCase().includes('ünvan'));
  assert(item, 'ünvan hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'unvanı');
});

it('yeşilzeytin -> yeşil zeytin yapılmalıdır', () => {
  const res = engine.analyze('Kahvaltıda yeşilzeytin yedik.');
  const item = res.find(r => r.word.toLowerCase().includes('yeşilzeytin'));
  assert(item, 'yeşilzeytin hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'yeşil zeytin');
});

it('çevrimiçi -> çevrim içi yapılmalıdır', () => {
  const res = engine.analyze('Şu an çevrimiçi görünüyor.');
  const item = res.find(r => r.word.toLowerCase().includes('çevrimiçi'));
  assert(item, 'çevrimiçi hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'çevrim içi');
});

it('doğalgaz -> doğal gaz yapılmalıdır', () => {
  const res = engine.analyze('Evde doğalgaz faturası geldi.');
  const item = res.find(r => r.word.toLowerCase().includes('doğalgaz'));
  assert(item, 'doğalgaz hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'doğal gaz');
});

it('kayyum -> kayyım yapılmalıdır', () => {
  const res = engine.analyze('Şirkete kayyum atandı.');
  const item = res.find(r => r.word.toLowerCase().includes('kayyum'));
  assert(item, 'kayyum hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'kayyım');
});

console.log('\n--- 2. Yaygın Yazım Hataları ---');
it('orjinal -> orijinal düzeltmesi', () => {
  const res = engine.analyze('Bu orjinal bir parça.');
  const item = res.find(r => r.word.toLowerCase() === 'orjinal');
  assert(item, 'orjinal hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'orijinal');
});

it('laboratuar -> laboratuvar düzeltmesi', () => {
  const res = engine.analyze('Sonuçlar laboratuar ortamında incelendi.');
  const item = res.find(r => r.word.toLowerCase() === 'laboratuar');
  assert(item, 'laboratuar hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'laboratuvar');
});

it('şöför -> şoför düzeltmesi', () => {
  const res = engine.analyze('Otobüsün şöförü durdu.');
  const item = res.find(r => r.word.toLowerCase().includes('şöför'));
  assert(item, 'şöför hatası bulunamadı');
});

it('pantalon -> pantolon düzeltmesi', () => {
  const res = engine.analyze('Yeni bir pantalon aldım.');
  const item = res.find(r => r.word.toLowerCase() === 'pantalon');
  assert(item, 'pantalon hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'pantolon');
});

it('dinazor -> dinozor düzeltmesi', () => {
  const res = engine.analyze('Müzede dinazor iskeleti var.');
  const item = res.find(r => r.word.toLowerCase() === 'dinazor');
  assert(item, 'dinazor hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'dinozor');
});

it('muhattap -> muhatap düzeltmesi', () => {
  const res = engine.analyze('Kendime muhattap arıyorum.');
  const item = res.find(r => r.word.toLowerCase() === 'muhattap');
  assert(item, 'muhattap hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'muhatap');
});

it('hastahane -> hastane düzeltmesi', () => {
  const res = engine.analyze('Acil olarak hastahaneye gitti.');
  const item = res.find(r => r.word.toLowerCase().includes('hastahane'));
  assert(item, 'hastahane hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'hastaneye');
});

console.log('\n--- 3. İkilemeler & Bitişik/Ayrı Kelimeler ---');
it('başbaşa -> baş başa ayrılmalıdır', () => {
  const res = engine.analyze('Saatlerce başbaşa konuştular.');
  const item = res.find(r => r.word.toLowerCase() === 'başbaşa');
  assert(item, 'başbaşa hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'baş başa');
});

it('yüzyüze -> yüz yüze ayrılmalıdır', () => {
  const res = engine.analyze('Toplantıyı yüzyüze yapalım.');
  const item = res.find(r => r.word.toLowerCase() === 'yüzyüze');
  assert(item, 'yüzyüze hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'yüz yüze');
});

it('git gide -> gitgide bitişik olmalıdır', () => {
  const res = engine.analyze('Hava git gide soğuyor.');
  const item = res.find(r => r.word.toLowerCase() === 'git gide');
  assert(item, 'git gide hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'gitgide');
});

it('birden bire -> birdenbire bitişik olmalıdır', () => {
  const res = engine.analyze('Olay birden bire oldu.');
  const item = res.find(r => r.word.toLowerCase() === 'birden bire');
  assert(item, 'birden bire hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'birdenbire');
});

console.log('\n--- 4. Mükerrer Kelime & Parantez Denetimleri ---');
it('Arka arkaya tekrarlanan mükerrer kelime tespit edilmelidir', () => {
  const res = engine.analyze('Bu konuyu ve ve diğer detayları konuştuk.');
  const item = res.find(r => r.msg && r.msg.includes('Mükerrer'));
  assert(item, 'Mükerrer kelime tespit edilemedi');
  assert.strictEqual(item.suggestions[0], 've');
});

it('Kapatılmamış parantez uyarısı verilmelidir', () => {
  const res = engine.analyze('Bu durum (özellikle dün ortaya çıktı.');
  const item = res.find(r => r.msg && r.msg.includes('Kapatılmamış açılış parantezi'));
  assert(item, 'Açık parantez tespit edilemedi');
});

console.log('\n--- 5. de/da, ki ve mi Kuralları ---');
it('birde -> bir de bağlacı', () => {
  const res = engine.analyze('Birde sen anlat bakalım.');
  const item = res.find(r => r.word.toLowerCase() === 'birde');
  assert(item, 'birde hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'Bir de');
});

it('masada ki -> masadaki sıfat eki', () => {
  const res = engine.analyze('Masada ki bardağı uzatır mısın?');
  const item = res.find(r => r.word.toLowerCase() === 'masada ki');
  assert(item, 'masada ki uyarısı bulunamadı');
});

it('gelicekmi -> gelecek mi soru eki', () => {
  const res = engine.analyze('Yarın gelecekmi?');
  const item = res.find(r => r.word.toLowerCase().includes('gelecekmi'));
  assert(item, 'soru eki hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'gelecek mi');
});

console.log('\n--- 6. Ateşman Okunabilirlik Formülü ---');
it('computeReadability Türkçe metin için doğru metrik üretmelidir', () => {
  const sample = 'Türkçe çok zengin ve köklü bir dildir. Kurallarına özen göstermek gerekir.';
  const metrics = engine.computeReadability(sample);
  assert(metrics, 'Okunabilirlik sonucu null olamaz');
  assert(metrics.score >= 0 && metrics.score <= 100, 'Skor 0-100 arasında olmalıdır');
  assert(metrics.totalWords > 0, 'Kelime sayısı pozitif olmalıdır');
  assert(metrics.totalSentences >= 2, 'En az 2 cümle tespit edilmelidir');
  assert(metrics.label.length > 0, 'Okunabilirlik etiketi atanmalıdır');
});

console.log('\n--- 7. TDK İmla & Anlam Kuralları ---');
it('yapdı -> yaptı ünsüz sertleşmesi düzeltilmelidir', () => {
  const res = engine.analyze('Ödevini erkenden yapdı.');
  const item = res.find(r => r.word.toLowerCase() === 'yapdı');
  assert(item, 'yapdı hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'yaptı');
});

it("3'de -> 3'te sayı sonrası sertleşme düzeltilmelidir", () => {
  const res = engine.analyze("Saat 3'de buluşalım.");
  const item = res.find(r => r.word.toLowerCase().includes("3'de"));
  assert(item, "3'de hatası bulunamadı");
  assert.strictEqual(item.suggestions[0], "3'te");
});

it('hergün -> her gün ayrı yazılmalıdır', () => {
  const res = engine.analyze('Hergün düzenli çalışır.');
  const item = res.find(r => r.word.toLowerCase() === 'hergün');
  assert(item, 'hergün hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'Her gün');
});

it('kuş burnu -> kuşburnu anlam değişimi nedeniyle bitişik yazılmalıdır', () => {
  const res = engine.analyze('Sıcak bir kuş burnu çayı içtik.');
  const item = res.find(r => r.word.toLowerCase() === 'kuş burnu');
  assert(item, 'kuş burnu hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'kuşburnu');
});

it('yıldönümü -> yıl dönümü ayrı yazılmalıdır (TDK)', () => {
  const res = engine.analyze('Evlilik yıldönümü kutlaması yapıldı.');
  const item = res.find(r => r.word.toLowerCase() === 'yıldönümü');
  assert(item, 'yıldönümü hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'yıl dönümü');
});

it('İkilemeler arasına virgül konmamalıdır (yavaş, yavaş -> yavaş yavaş)', () => {
  const res = engine.analyze('Yağmur yavaş, yavaş yağıyordu.');
  const item = res.find(r => r.msg && r.msg.includes('İkilemeler arasına'));
  assert(item, 'İkileme virgül hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'yavaş yavaş');
});

it('29 ekim -> 29 Ekim belirli tarih ay kuralı', () => {
  const res = engine.analyze('Tören 29 ekim günü yapılacak.');
  const item = res.find(r => r.word.toLowerCase().includes('29 ekim'));
  assert(item, '29 ekim uyarısı bulunamadı');
  assert.strictEqual(item.suggestions[0], '29 Ekim');
});

console.log(`\n================================`);
console.log(`Sonuç: ${passed} Başarılı, ${failed} Hatalı`);
console.log(`================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 Tüm testler başarıyla geçti!');
}
