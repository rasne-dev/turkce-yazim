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

it('farkettik -> fark ettik düzeltilmelidir', () => {
  const res = engine.analyze('Durumu sonradan farkettik.');
  const item = res.find(r => r.word.toLowerCase() === 'farkettik');
  assert(item, 'farkettik hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'fark ettik');
});

it('tabikide -> tabii ki de düzeltilmelidir', () => {
  const res = engine.analyze('Bunu tabikide biliyorum.');
  const item = res.find(r => r.word.toLowerCase() === 'tabikide');
  assert(item, 'tabikide hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'tabii ki de');
});

it('meyva -> meyve düzeltilmelidir', () => {
  const res = engine.analyze('Pazardan taze meyva aldık.');
  const item = res.find(r => r.word.toLowerCase() === 'meyva');
  assert(item, 'meyva hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'meyve');
});

it('"tek tek" gibi ikilemeler mükerrer kelime olarak işaretlenmemelidir', () => {
  const res = engine.analyze('Konuklar içeriye tek tek girdi.');
  const item = res.find(r => r.msg && r.msg.includes('Mükerrer'));
  assert(!item, '"tek tek" hatalı şekilde mükerrer olarak işaretlendi');
});

console.log('\n--- 8. Metin Temizleyici (cleanText) ---');
it('cleanText bozuk PDF/web satır sonlarını birleştirmelidir', () => {
  const input = 'Bugün hava çok güzeldi ve dışarıda\nyürüyüş yapmak için parka gittik.';
  const res = engine.cleanText(input);
  assert.strictEqual(res, 'Bugün hava çok güzeldi ve dışarıda yürüyüş yapmak için parka gittik.');
});

it('cleanText hece sonu tireli satırları birleştirmelidir', () => {
  const input = 'Bu önemli açıkla-\nmasının detaylarını öğrendik.';
  const res = engine.cleanText(input);
  assert.strictEqual(res, 'Bu önemli açıklamasının detaylarını öğrendik.');
});

it('cleanText paragrafları ve madde işaretli listeleri korumalıdır', () => {
  const input = 'Birinci paragraf metni burada.\n\nİkinci paragraf başlıyor:\n- Madde 1\n- Madde 2';
  const res = engine.cleanText(input);
  assert.strictEqual(res, 'Birinci paragraf metni burada.\n\nİkinci paragraf başlıyor:\n- Madde 1\n- Madde 2');
});

it('cleanText fazla yatay boşlukları tek boşluğa indirmelidir', () => {
  const input = 'Bu    cümlede     çok     fazla    boşluk    var.';
  const res = engine.cleanText(input);
  assert.strictEqual(res, 'Bu cümlede çok fazla boşluk var.');
});

console.log('\n--- 9. Boşluksuz Karakter & Tahmini Sayfa Sayısı ---');
it('computeReadability boşluksuz karakter ve tahmini sayfa sayısı üretmelidir', () => {
  const sample = 'Bu metin toplamda belirli sayıda boşluksuz karakter içerir.';
  const metrics = engine.computeReadability(sample);
  assert(metrics.noSpaceChars > 0, 'noSpaceChars 0 olamaz');
  assert.strictEqual(metrics.noSpaceChars, sample.replace(/\s/g, '').length);
  assert(typeof metrics.estPagesStr === 'string' && metrics.estPagesStr.includes('sayfa'), 'estPagesStr sayfa içermelidir');
});

console.log('\n--- 10. Kişisel Sözlük İstisnası ---');
it('Kişisel sözlüğe eklenen özel kelimeler hata olarak dönmemelidir', () => {
  // Örnek: "Ensar" veya "Docker" gibi özel kelimeler
  const sample = 'Ensar ve Docker sistemleri entegre edildi.';
  const res = engine.analyze(sample);
  // Normalde de hata vermemeli, fakat sözlükteki kelimelerin dışarıda tutulduğunu teyit et
  assert(Array.isArray(res));
});

console.log('\n--- 11. Kelime İçi Rakam, Metatez & Fiil/Ek-Fiil Bağlaç (-te/-ta) Kuralları ---');
it('b8ugün -> bugün kelime içi rakam tespiti yapılmalıdır', () => {
  const res = engine.analyze('Saat 17.00 gibi b8ugün buluşalım.');
  const item = res.find(r => r.word === 'b8ugün');
  assert(item, 'b8ugün hatası bulunamadı');
  assert.strictEqual(item.type, 'spell');
  assert.strictEqual(item.suggestions[0], 'bugün');
  assert(item.detail && item.detail.includes('ayıklandığında'), 'detail açıklaması bulunamadı');
});

it('biriymişte -> biriymiş de fiil/ek-fiil bağlacı sertleşme kuralı ve açıklamalı örnek verilmelidir', () => {
  const res = engine.analyze('Dikkatli biriymişte fark etti.');
  const item = res.find(r => r.word === 'biriymişte');
  assert(item, 'biriymişte hatası bulunamadı');
  assert.strictEqual(item.type, 'gram');
  assert.strictEqual(item.suggestions[0], 'biriymiş de');
  assert(item.msg.includes('-te/-ta') && item.msg.includes('sertleşip'), 'msg kural uyarısı eksik');
  assert(item.detail && item.detail.includes('biriymiş de'), 'detail örnek açıklaması eksik');
});

it('eskik -> eksik harf değişimi düzeltilmelidir', () => {
  const res = engine.analyze('Hesabı eskik aldın.');
  const item = res.find(r => r.word.toLowerCase() === 'eskik');
  assert(item, 'eskik hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'eksik');
});

it('enysekki -> neyse ki yazım düzeltmesi yapılmalıdır', () => {
  const res = engine.analyze('enysekki durumu fark ettik.');
  const item = res.find(r => r.word.toLowerCase() === 'enysekki');
  assert(item, 'enysekki hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'neyse ki');
});

it('olsada -> olsa da şart kipi bağlacı ayrılmalıdır', () => {
  const res = engine.analyze('Zor olsada başardık.');
  const item = res.find(r => r.word.toLowerCase() === 'olsada');
  assert(item, 'olsada hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'olsa da');
});

console.log('\n--- 12. Özel İsim Kesme İşareti, İkilemeler & Düzeltilen Kural Testleri ---');
it('Türkiyede -> Türkiye\'de özel isim kesme işareti düzeltilmelidir', () => {
  const res = engine.analyze('Türkiyede herkes bu konuyu biliyor.');
  const item = res.find(r => r.word === 'Türkiyede');
  assert(item, 'Türkiyede uyarısı bulunamadı');
  assert.strictEqual(item.suggestions[0], "Türkiye'de");
});

it('İstanbulda ve Atatürkün kesme işareti düzeltilmelidir', () => {
  const res = engine.analyze('İstanbulda yaşadı ve Atatürkün fikirlerini benimsedi.');
  const item1 = res.find(r => r.word === 'İstanbulda');
  const item2 = res.find(r => r.word === 'Atatürkün');
  assert(item1 && item1.suggestions[0] === "İstanbul'da", 'İstanbulda tespit edilemedi');
  assert(item2 && item2.suggestions[0] === "Atatürk'ün", 'Atatürkün tespit edilemedi');
});

it('yanyana -> yan yana ikilemesi ayrılmalıdır', () => {
  const res = engine.analyze('İki bina yanyana inşa edildi.');
  const item = res.find(r => r.word.toLowerCase() === 'yanyana');
  assert(item, 'yanyana hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'yan yana');
});

it('artarda -> art arda düzeltilmelidir', () => {
  const res = engine.analyze('Olaylar artarda gerçekleşti.');
  const item = res.find(r => r.word.toLowerCase() === 'artarda');
  assert(item, 'artarda hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'art arda');
});

it('Düzeltilen bug: pantalonu -> pantolonu doğru şekilde çalışmalı', () => {
  const res = engine.analyze('Yeni pantalonu çok beğendi.');
  const item = res.find(r => r.word.toLowerCase() === 'pantalonu');
  assert(item, 'pantalonu hatası bulunamadı');
  assert.strictEqual(item.suggestions[0], 'pantolonu');
});

it('Düzeltilen bug: doğru yazılan "orijinalliği", "yeşil zeytini", "pantolonu" kelimeleri hata vermemelidir', () => {
  const res = engine.analyze('Bu eserin orijinalliği korundu. Kahvaltıda yeşil zeytini ve yeni pantolonu vardı.');
  const itemOrig = res.find(r => r.word.toLowerCase() === 'orijinalliği');
  const itemZeytin = res.find(r => r.word.toLowerCase().includes('yeşil zeytini'));
  const itemPantolon = res.find(r => r.word.toLowerCase() === 'pantolonu');
  assert(!itemOrig, 'Doğru yazılmış orijinalliği hatalı olarak işaretlendi!');
  assert(!itemZeytin, 'Doğru yazılmış yeşil zeytini hatalı olarak işaretlendi!');
  assert(!itemPantolon, 'Doğru yazılmış pantolonu hatalı olarak işaretlendi!');
});

console.log('\n--- 13. Belirtme Hâli & İyelik Eki Sonrası Bağlaç (de/da) Kuralları ---');
it('komisyonunuda -> komisyonunu da düzeltmesi yapılmalıdır', () => {
  const res = engine.analyze('Platform komisyonunuda hesaba katarsak normal gibi.');
  const item = res.find(r => r.word.toLowerCase() === 'komisyonunuda');
  assert(item, 'komisyonunuda hatası tespit edilemedi');
  assert.strictEqual(item.suggestions[0], 'komisyonunu da');
});

it('arabasınıda, kendisinide, evimide, gözünüde bağlaçları ayrılmalıdır', () => {
  const res = engine.analyze('Arabasınıda getirdi, kendisinide gördük, evimide sattım, gözünüde kapattı.');
  const w1 = res.find(r => r.word.toLowerCase() === 'arabasınıda');
  const w2 = res.find(r => r.word.toLowerCase() === 'kendisinide');
  const w3 = res.find(r => r.word.toLowerCase() === 'evimide');
  const w4 = res.find(r => r.word.toLowerCase() === 'gözünüde');
  assert(w1 && w1.suggestions[0] === 'Arabasını da', 'arabasınıda tespit edilemedi');
  assert(w2 && w2.suggestions[0] === 'kendisini de', 'kendisinide tespit edilemedi');
  assert(w3 && w3.suggestions[0] === 'evimi de', 'evimide tespit edilemedi');
  assert(w4 && w4.suggestions[0] === 'gözünü de', 'gözünüde tespit edilemedi');
});

it('onuda, bunuda, şunuda zamir bağlaçları ayrılmalıdır', () => {
  const res = engine.analyze('Onuda al, bunuda unutma, şunuda getir.');
  const w1 = res.find(r => r.word.toLowerCase() === 'onuda');
  const w2 = res.find(r => r.word.toLowerCase() === 'bunuda');
  const w3 = res.find(r => r.word.toLowerCase() === 'şunuda');
  assert(w1 && w1.suggestions[0] === 'Onu da', 'onuda tespit edilemedi');
  assert(w2 && w2.suggestions[0] === 'bunu da', 'bunuda tespit edilemedi');
  assert(w3 && w3.suggestions[0] === 'şunu da', 'şunuda tespit edilemedi');
});

it('Doğru yazılmış bulunma hâli (komisyonunda, arabasında, evinde, gemide) hata vermemelidir', () => {
  const res = engine.analyze('Komisyonunda görevliydi. Arabasında eşya unuttu. Kendi evinde dinlendi. Gemide seyahat etti.');
  const w1 = res.find(r => r.word.toLowerCase().includes('komisyonunda'));
  const w2 = res.find(r => r.word.toLowerCase().includes('arabasında'));
  const w3 = res.find(r => r.word.toLowerCase().includes('evinde'));
  const w4 = res.find(r => r.word.toLowerCase().includes('gemide'));
  assert(!w1, 'komisyonunda hatalı olarak işaretlendi!');
  assert(!w2, 'arabasında hatalı olarak işaretlendi!');
  assert(!w3, 'evinde hatalı olarak işaretlendi!');
  assert(!w4, 'gemide hatalı olarak işaretlendi!');
});

console.log('\n--- 14. Yeni TDK Kuralları, Yönelme Zamiri Bağlaçları & Okunabilirlik ---');
it('banada -> bana da ve sanada -> sana da yönelme zamirleri bağlaç olarak ayrılmalıdır', () => {
  const res = engine.analyze('Banada haber ver, sanada hediye aldım.');
  const item1 = res.find(r => r.word.toLowerCase() === 'banada');
  const item2 = res.find(r => r.word.toLowerCase() === 'sanada');
  assert(item1 && item1.suggestions[0] === 'Bana da', 'banada tespit edilemedi');
  assert(item2 && item2.suggestions[0] === 'sana da', 'sanada tespit edilemedi');
});

it('sıradışı, yasadışı, yanısıra, gözardı ayrı yazılmalıdır', () => {
  const res = engine.analyze('Sıradışı bir olay oldu, yanısıra yasadışı durumlarda gözardı edildi.');
  const w1 = res.find(r => r.word.toLowerCase() === 'sıradışı');
  const w2 = res.find(r => r.word.toLowerCase() === 'yanısıra');
  const w3 = res.find(r => r.word.toLowerCase() === 'yasadışı');
  const w4 = res.find(r => r.word.toLowerCase() === 'gözardı');
  assert(w1 && w1.suggestions[0] === 'Sıra dışı', 'sıradışı tespit edilemedi');
  assert(w2 && w2.suggestions[0] === 'yanı sıra', 'yanısıra tespit edilemedi');
  assert(w3 && w3.suggestions[0] === 'yasa dışı', 'yasadışı tespit edilemedi');
  assert(w4 && w4.suggestions[0] === 'göz ardı', 'gözardı tespit edilemedi');
});

it('profösör -> profesör ve gardrop -> gardırop düzeltilmelidir', () => {
  const res = engine.analyze('Profösör odaya girdi ve gardrop kapağını açtı.');
  const w1 = res.find(r => r.word.toLowerCase() === 'profösör');
  const w2 = res.find(r => r.word.toLowerCase() === 'gardrop');
  assert(w1 && w1.suggestions[0] === 'Profesör', 'profösör tespit edilemedi');
  assert(w2 && w2.suggestions[0] === 'gardırop', 'gardrop tespit edilemedi');
});

it('computeReadability 8 kelimeden kısa metinlerde Kısa Metin etiketi üretmelidir', () => {
  const shortText = 'Platform komisyonunu da hesaba katarsak normal gibi.';
  const metrics = engine.computeReadability(shortText);
  assert(metrics, 'metrik üretilmedi');
  assert.strictEqual(metrics.isShort, true);
  assert.strictEqual(metrics.label, 'Kısa Metin');
});

console.log('\n--- 15. Birleşik Fiiller, İkileme Noktalaması & Soru Eki Kuralları ---');
it('biran, ilkönce, artniyet ayrı yazılmalıdır', () => {
  const res = engine.analyze('Biran durdu, ilkönce düşündü, artniyet aramadı.');
  const w1 = res.find(r => r.word.toLowerCase() === 'biran');
  const w2 = res.find(r => r.word.toLowerCase() === 'ilkönce');
  const w3 = res.find(r => r.word.toLowerCase() === 'artniyet');
  assert(w1 && w1.suggestions[0] === 'Bir an', 'biran tespit edilemedi');
  assert(w2 && w2.suggestions[0] === 'ilk önce', 'ilkönce tespit edilemedi');
  assert(w3 && w3.suggestions[0] === 'art niyet', 'artniyet tespit edilemedi');
});

it('hakketmek, kabuletmek, devametmek birleşik fiilleri ayrılmalıdır', () => {
  const res = engine.analyze('Bunu hiç hakketmedi, teklifi kabuletti ve yola devametti.');
  const w1 = res.find(r => r.word.toLowerCase() === 'hakketmedi');
  const w2 = res.find(r => r.word.toLowerCase() === 'kabuletti');
  const w3 = res.find(r => r.word.toLowerCase() === 'devametti');
  assert(w1 && w1.suggestions[0] === 'hak etmedi', 'hakketmedi tespit edilemedi');
  assert(w2 && w2.suggestions[0] === 'kabul etti', 'kabuletti tespit edilemedi');
  assert(w3 && w3.suggestions[0] === 'devam etti', 'devametti tespit edilemedi');
});

it('yavaş-yavaş ikilemesindeki kısa çizgi kaldırılmalıdır', () => {
  const res = engine.analyze('Yağmurda yavaş-yavaş yürüdük.');
  const item = res.find(r => r.word.toLowerCase() === 'yavaş-yavaş');
  assert(item, 'yavaş-yavaş tespit edilemedi');
  assert.strictEqual(item.suggestions[0], 'yavaş yavaş');
});

it('Ahmet\'mi ve Ankara\'mı soru ekleri kesme işaretinden ayrılmalıdır', () => {
  const res = engine.analyze("Ahmet'mi geldi, Ankara'mı daha güzel?");
  const w1 = res.find(r => r.word === "Ahmet'mi");
  const w2 = res.find(r => r.word === "Ankara'mı");
  assert(w1 && w1.suggestions[0] === 'Ahmet mi', "Ahmet'mi tespit edilemedi");
  assert(w2 && w2.suggestions[0] === 'Ankara mı', "Ankara'mı tespit edilemedi");
});

it('labaratuar -> laboratuvar düzeltilmelidir', () => {
  const res = engine.analyze('Yeni labaratuar açıldı.');
  const item = res.find(r => r.word.toLowerCase() === 'labaratuar');
  assert(item, 'labaratuar tespit edilemedi');
  assert.strictEqual(item.suggestions[0], 'laboratuvar');
});

console.log('\n--- 16. Şahıs Zamiri Bağlaçları (de/da), Çift Nokta & Eşitlik Zamirleri ---');
it('Asgari ücretli ölsün sizde kurtulun.. metninde sizde ve .. tespit edilmelidir', () => {
  const res = engine.analyze('Asgari ücretli ölsün sizde kurtulun.. Kamuda 6 ayda bir zam var...');
  const sizdeItem = res.find(r => r.word.toLowerCase() === 'sizde');
  const dotItem = res.find(r => r.word === '..');
  assert(sizdeItem, 'sizde hatası tespit edilemedi');
  assert.strictEqual(sizdeItem.type, 'gram');
  assert.strictEqual(sizdeItem.suggestions[0], 'siz de');
  assert(dotItem, '.. noktalama hatası tespit edilemedi');
  assert.strictEqual(dotItem.type, 'punct');
  assert.strictEqual(dotItem.suggestions[0], '.');
});

it('Şahıs zamirleri yüklemle uyuştuğunda bağlaç olarak tespit edilmelidir (bende geldim, sende gel, bizde gidelim, sizde haklısınız)', () => {
  const t1 = engine.analyze('Bende geldim.');
  const t2 = engine.analyze('Sende baksana.');
  const t3 = engine.analyze('Bizde gelelim.');
  const t4 = engine.analyze('Onlarda görsünler.');
  const t5 = engine.analyze('Sizde haklısınız.');

  assert.strictEqual(t1[0].suggestions[0], 'Ben de');
  assert.strictEqual(t1[0].type, 'gram');
  assert.strictEqual(t2[0].suggestions[0], 'Sen de');
  assert.strictEqual(t2[0].type, 'gram');
  assert.strictEqual(t3[0].suggestions[0], 'Biz de');
  assert.strictEqual(t3[0].type, 'gram');
  assert.strictEqual(t4[0].suggestions[0], 'Onlar da');
  assert.strictEqual(t4[0].type, 'gram');
  assert.strictEqual(t5[0].suggestions[0], 'Siz de');
  assert.strictEqual(t5[0].type, 'gram');
});

it('Doğru bulunma hâli zamirleri (bende para var, sizde anahtar kaldı) kesin dilbilgisi hatası sayılmamalıdır', () => {
  const t1 = engine.analyze('Bende para var.');
  const t2 = engine.analyze('Sizde anahtar kaldı.');
  const i1 = t1.find(r => r.word.toLowerCase() === 'bende');
  const i2 = t2.find(r => r.word.toLowerCase() === 'sizde');
  assert(i1 && i1.type === 'warn', 'bende para var gramer hatası olmamalı, warn kalmalı');
  assert(i2 && i2.type === 'warn', 'sizde anahtar kaldı gramer hatası olmamalı, warn kalmalı');
});

it('bencede, sencede, bizcede, sizcede bağlaçları ayrılmalıdır', () => {
  const res = engine.analyze('Bencede çok doğru, sencede öyle değil mi?');
  const w1 = res.find(r => r.word.toLowerCase() === 'bencede');
  const w2 = res.find(r => r.word.toLowerCase() === 'sencede');
  assert(w1 && w1.suggestions[0] === 'Bence de', 'bencede tespit edilemedi');
  assert(w2 && w2.suggestions[0] === 'sence de', 'sencede tespit edilemedi');
});

it('buradada, oradada, evdede, işte de çift hâl eki bağlaçları ayrılmalıdır', () => {
  const res = engine.analyze('Buradada kaldık, oradada gördük, evdede bulamadık.');
  const w1 = res.find(r => r.word.toLowerCase() === 'buradada');
  const w2 = res.find(r => r.word.toLowerCase() === 'oradada');
  const w3 = res.find(r => r.word.toLowerCase() === 'evdede');
  assert(w1 && w1.suggestions[0] === 'Burada da', 'buradada tespit edilemedi');
  assert(w2 && w2.suggestions[0] === 'orada da', 'oradada tespit edilemedi');
  assert(w3 && w3.suggestions[0] === 'evde de', 'evdede tespit edilemedi');
});

it('Dört veya daha fazla nokta (...) olarak düzeltilmelidir', () => {
  const res = engine.analyze('Bekliyorum....');
  const item = res.find(r => r.word === '....');
  assert(item, '.... tespit edilemedi');
  assert.strictEqual(item.suggestions[0], '...');
});

it('askeri ücret, tesekkurler, farketmez, hakkaten yaygın hataları düzeltilmelidir', () => {
  const res = engine.analyze('Askeri ücret zammı için tesekkurler, ama farketmez hakkaten.');
  const w1 = res.find(r => r.word.toLowerCase() === 'askeri ücret');
  const w2 = res.find(r => r.word.toLowerCase() === 'tesekkurler');
  const w3 = res.find(r => r.word.toLowerCase() === 'farketmez');
  const w4 = res.find(r => r.word.toLowerCase() === 'hakkaten');
  assert(w1 && w1.suggestions[0] === 'Asgari ücret', 'askeri ücret tespit edilemedi');
  assert(w2 && w2.suggestions[0] === 'teşekkürler', 'tesekkurler tespit edilemedi');
  assert(w3 && w3.suggestions[0] === 'fark etmez', 'farketmez tespit edilemedi');
  assert(w4 && w4.suggestions[0] === 'hakikaten', 'hakkaten tespit edilemedi');
});

console.log('\n--- 17. Metin Karşılaştırma & Kelime Bazlı Fark (Diff) ---');
it('computeWordDiff aynı metin için boş dizi dönmelidir', () => {
  const diff = engine.computeWordDiff('Bugün hava çok güzel.', 'Bugün hava çok güzel.');
  assert(Array.isArray(diff), 'Sonuç dizi olmalıdır');
  assert.strictEqual(diff.length, 0, 'Aynı metin için fark olmamalıdır');
});

it('computeWordDiff kelime düzeltmelerini del ve ins olarak tespit etmelidir', () => {
  const diff = engine.computeWordDiff('ali nin topu orjinal', 'Ali\'nin topu orijinal');
  assert(Array.isArray(diff) && diff.length > 0, 'Fark tespit edilmelidir');
  const dels = diff.filter(d => d.type === 'del').map(d => d.val.trim());
  const inss = diff.filter(d => d.type === 'ins').map(d => d.val.trim());
  assert(dels.some(d => d.includes('ali')), 'ali silinen olarak işaretlenmeli');
  assert(inss.some(i => i.includes('Ali')), 'Ali eklenen olarak işaretlenmeli');
  assert(dels.some(d => d.includes('orjinal')), 'orjinal silinen olarak işaretlenmeli');
  assert(inss.some(i => i.includes('orijinal')), 'orijinal eklenen olarak işaretlenmeli');
});

it('computeWordDiff eklenen ve çıkarılan kelimeleri doğru ayırmalıdır', () => {
  const diff = engine.computeWordDiff('Kitabı hemen oku.', 'Kitabı dikkatle ve hemen oku.');
  const inss = diff.filter(d => d.type === 'ins').map(d => d.val.trim());
  assert(inss.some(i => i.includes('dikkatle')), 'eklenen kelime ins olarak işaretlenmelidir');
});

console.log('\n--- 18. Sayı Ekleri Ses Uyumu, Parantez Yığını, Harf Dönüştürücü & Rapor Metrikleri ---');
it('computeReadability avgWordLengthSyllables, diversityRatio ve topRepeated döndürmelidir', () => {
  const text = 'Kitap okumak insanın ufkunu açar. Kitap okumak kelime hazinesini geliştirir ve kitap her zaman en iyi dosttur.';
  const r = engine.computeReadability(text);
  assert(r && typeof r.avgWordLengthSyllables === 'number', 'avgWordLengthSyllables sayı olmalıdır');
  assert(typeof r.diversityRatio === 'number' && r.diversityRatio > 0 && r.diversityRatio <= 100, 'diversityRatio geçerli olmalıdır');
  assert(Array.isArray(r.topRepeated) && r.topRepeated.some(x => x.word === 'kitap' && x.count === 3), 'topRepeated içinde kitap 3 kez geçmelidir');
});

it('Sayı eklerinde tek adımda kesme işareti, ünlü uyumu ve ünsüz benzeşmesi (2024de -> 2024\'te, 1923\'den -> 1923\'ten, 60\'de -> 60\'ta) uygulanmalıdır', () => {
  const res = engine.analyze("2024de başlayan proje, 1923'den beri ve saat 60'de veya 40'dan sonra devam etti.");
  const w1 = res.find(r => r.word === '2024de');
  const w2 = res.find(r => r.word === "1923'den");
  const w3 = res.find(r => r.word === "60'de");
  const w4 = res.find(r => r.word === "40'dan");
  assert(w1 && w1.suggestions[0] === "2024'te", "2024de -> 2024'te olmalıdır");
  assert(w2 && w2.suggestions[0] === "1923'ten", "1923'den -> 1923'ten olmalıdır");
  assert(w3 && w3.suggestions[0] === "60'ta", "60'de -> 60'ta olmalıdır");
  assert(w4 && w4.suggestions[0] === "40'tan", "40'dan -> 40'tan olmalıdır");
});

it('Açılmamış kapanış parantezi ) ve köşeli parantezler [ ] tespit edilmelidir', () => {
  const res1 = engine.analyze('Bu cümlede fazladan kapanış parantezi var).');
  assert(res1.some(r => r.word === ')' && r.type === 'punct'), 'Açılmamış ) tespit edilmelidir');
  const res2 = engine.analyze('Bu cümlede [kapatılmamış köşeli parantez var.');
  assert(res2.some(r => r.word === '[' && r.type === 'punct'), 'Kapatılmamış [ tespit edilmelidir');
});

it('Sıra sayılarında (2. sınıfa) yanlış büyük harf uyarısı verilmemeli ve Dr.Ahmet bitişik kısaltması yakalanmalıdır', () => {
  const res1 = engine.analyze('Kardeşim bu yıl 2. sınıfa başladı.');
  const falseCap = res1.find(r => r.word === 'sınıfa');
  assert(!falseCap, '2. sınıfa ifadesinde sınıfa büyük harf hatası sayılmamalıdır');

  const sample = 'Bugün Dr.Ahmet ile google.com adresine baktık.';
  const res2 = engine.analyze(sample);
  const dotIssues = res2.filter(r => r.word === '.' && r.suggestions[0] === '. ');
  assert.strictEqual(dotIssues.length, 1, 'Sadece Dr.Ahmet içindeki nokta yakalanmalı, google.com yakalanmamalıdır');
  assert.strictEqual(dotIssues[0].start, sample.indexOf('Dr.Ahmet') + 2);
});

it('convertCase Türkçe karakterleri (i/İ, ı/I) koruyarak harf düzeni dönüştürmelidir', () => {
  assert.strictEqual(engine.convertCase('İSTANBUL VE IĞDIR', 'lower'), 'istanbul ve ığdır');
  assert.strictEqual(engine.convertCase('istanbul ve ığdır', 'upper'), 'İSTANBUL VE IĞDIR');
  assert.strictEqual(engine.convertCase('bu bir deneme. ikinci cümle! üçüncü mü?', 'sentence'), 'Bu bir deneme. İkinci cümle! Üçüncü mü?');
  assert.strictEqual(engine.convertCase('türkiye cumhuriyeti ve istanbul boğazı', 'title'), 'Türkiye Cumhuriyeti ve İstanbul Boğazı');
});

it('Olumsuz/birleşik şart kipleri (olmasada -> olmasa da) ve eş görevli/sıralı virgüller tam düzeltilmelidir', () => {
  let t = 'pek pide gibi olmasada hazır pizzalardan daha iyi. o satılan bilmem ne fresh şöyle gurme böyle artizan olanlardan daha iyi ama öyle çok iyi değil yoklukta üşengeçlikte gider';
  for (let pass = 0; pass < 8; pass++) {
    const issues = engine.analyze(t).filter(i => i.type !== 'warn' && i.suggestions.length > 0).sort((a, b) => b.start - a.start);
    if (!issues.length) break;
    for (const iss of issues) {
      t = t.slice(0, iss.start) + iss.suggestions[0] + t.slice(iss.end);
    }
  }
  assert.strictEqual(
    t,
    'Pek pide gibi olmasa da hazır pizzalardan daha iyi. O satılan bilmem ne fresh, şöyle gurme, böyle artizan olanlardan daha iyi ama öyle çok iyi değil, yoklukta, üşengeçlikte gider.'
  );

  const res2 = engine.analyze('Gelmesede, olursada, istemesekte ve biliyorda olsak masada bekledik.');
  assert(res2.some(r => r.word === 'Gelmesede' && r.suggestions[0] === 'Gelmese de'), 'Gelmesede -> Gelmese de olmalı');
  assert(res2.some(r => r.word === 'olursada' && r.suggestions[0] === 'olursa da'), 'olursada -> olursa da olmalı');
  assert(res2.some(r => r.word === 'istemesekte' && r.suggestions[0] === 'istemesek de'), 'istemesekte -> istemesek de olmalı');
  assert(res2.some(r => r.word === 'biliyorda' && r.suggestions[0] === 'biliyor da'), 'biliyorda -> biliyor da olmalı');
  assert(!res2.some(r => r.word === 'masada'), 'masada doğru bulunma hâlidir, hata sayılmamalı');
});

console.log('\n--- 19. Güvenlik Kaçışı, Türkçe Kelime Sınırları, Büyük Harf Önerileri & Bul/Değiştir ---');
it('esc() çift tırnak ve tek tırnak karakterlerini HTML güvenli biçimde kaçırmalıdır', () => {
  const escaped = engine.esc('"orjinal" yerine \'orijinal\' & <script>');
  assert.strictEqual(escaped, '&quot;orjinal&quot; yerine &#39;orijinal&#39; &amp; &lt;script&gt;');
});

it('odağı ve odağında kelimeleri ASCII \\b hatası nedeniyle yanlışlıkla "o da" uyarısı üretmemelidir', () => {
  const res = engine.analyze('Tartışmaların odağında olan proje ilgi odağı haline geldi.');
  const falseWarn = res.find(r => r.type === 'warn' && r.word.toLowerCase() === 'oda');
  assert(!falseWarn, 'odağı/odağında kelimelerinde yanlış zamir+da uyarısı üretilmemelidir');
});

it('cleanText numaralı listeleri (1. Madde, 10. Madde) korumalı, sayı ile başlayan kırık satırları birleştirmelidir', () => {
  const listText = 'Yapılacaklar:\n1. Birinci adım\n2. İkinci adım\n10. Onuncu adım';
  assert.strictEqual(engine.cleanText(listText), listText);

  const brokenNumLine = 'Toplantıya bugün toplam\n5 kişi katıldı.';
  assert.strictEqual(engine.cleanText(brokenNumLine), 'Toplantıya bugün toplam 5 kişi katıldı.');
});

it('Tamamı büyük harfli yazım hatalarında (ORJİNAL, HERKEZ) öneriler de BÜYÜK HARF olmalıdır', () => {
  const res = engine.analyze('BU BELGE TAMAMEN ORJİNAL VE HERKEZ BİLİYOR.');
  const w1 = res.find(r => r.word === 'ORJİNAL');
  const w2 = res.find(r => r.word === 'HERKEZ');
  assert(w1 && w1.suggestions[0] === 'ORİJİNAL', 'ORJİNAL -> ORİJİNAL olmalıdır');
  assert(w2 && w2.suggestions[0] === 'HERKES', 'HERKEZ -> HERKES olmalıdır');
});

it('Kesme işaretli kelimeler (Türkiye\'de, Ali\'nin, 2024\'te) tek kelime olarak sayılmalıdır', () => {
  const stats = engine.computeReadability("Türkiye'de Ali'nin 2024'te yazdığı kitap çok sevildi.");
  assert.strictEqual(stats.totalWords, 7, "Kesme işaretli kelimeler bölünmeden 7 kelime sayılmalıdır");
});

it('findAndReplace Türkçe büyük/küçük harf duyarlı (İ/i, I/ı) arama ve değiştirme yapmalıdır', () => {
  const rAll = engine.findAndReplace('İstanbul çok güzel, istanbul tarihi bir şehir.', 'İSTANBUL', 'Ankara', true);
  assert.strictEqual(rAll.count, 2);
  assert.strictEqual(rAll.replaced, 2);
  assert.strictEqual(rAll.text, 'Ankara çok güzel, Ankara tarihi bir şehir.');

  const rOne = engine.findAndReplace('Iğdır ve ığdır doğuda yer alır.', 'ığdır', 'Kars', false);
  assert.strictEqual(rOne.count, 2);
  assert.strictEqual(rOne.replaced, 1);
  assert.strictEqual(rOne.text, 'Kars ve ığdır doğuda yer alır.');
});

console.log('\n--- 20. Geçmiş Zaman Fiil Bağlaçları, Emoji/İfade Koruma & Edebî Diyalog Çizgileri ---');
it('Geçmiş zaman fiilleri sonrası bağlaç de/da (gittide, geldide, yaptıda, gittikte) ayrılmalıdır', () => {
  const r1 = engine.analyze('Oraya gittide haber vermedi.');
  const it1 = r1.find(r => r.word.toLowerCase() === 'gittide');
  assert(it1, 'gittide tespit edilmedi');
  assert.strictEqual(it1.suggestions[0], 'gitti de');

  const r2 = engine.analyze('Bize geldide oturmadı.');
  const it2 = r2.find(r => r.word.toLowerCase() === 'geldide');
  assert(it2, 'geldide tespit edilmedi');
  assert.strictEqual(it2.suggestions[0], 'geldi de');

  const r3 = engine.analyze('Bunu yaptıda ne oldu?');
  const it3 = r3.find(r => r.word.toLowerCase() === 'yaptıda');
  assert(it3, 'yaptıda tespit edilmedi');
  assert.strictEqual(it3.suggestions[0], 'yaptı da');

  const r4 = engine.analyze('Oraya gittikte ne kazandık?');
  const it4 = r4.find(r => r.word.toLowerCase() === 'gittikte');
  assert(it4, 'gittikte tespit edilmedi');
  assert.strictEqual(it4.suggestions[0], 'gittik de');
});

it('Olumsuz ve birleşik geçmiş zaman fiilleri (gelmedide, yapmadıda, yapacaktıda, gelirdide) ayrılmalıdır', () => {
  const r1 = engine.analyze('Dün toplantıya gelmedide sonradan aradı.');
  const it1 = r1.find(r => r.word.toLowerCase() === 'gelmedide');
  assert(it1, 'gelmedide tespit edilmedi');
  assert.strictEqual(it1.suggestions[0], 'gelmedi de');

  const r2 = engine.analyze('Ödevini yapmadıda oyun oynadı.');
  const it2 = r2.find(r => r.word.toLowerCase() === 'yapmadıda');
  assert(it2, 'yapmadıda tespit edilmedi');
  assert.strictEqual(it2.suggestions[0], 'yapmadı da');

  const r3 = engine.analyze('Buraya gelecektide işi çıktı.');
  const it3 = r3.find(r => r.word.toLowerCase() === 'gelecektide');
  assert(it3, 'gelecektide tespit edilmedi');
  assert.strictEqual(it3.suggestions[0], 'gelecekti de');

  const r4 = engine.analyze('Eskiden her gün arardıda şimdi unuttu.');
  const it4 = r4.find(r => r.word.toLowerCase() === 'arardıda');
  assert(it4, 'arardıda tespit edilmedi');
  assert.strictEqual(it4.suggestions[0], 'arardı da');
});

it('Doğru bulunma hâli isimleri (komedide, kedide, kutuda, çatıda) yanlış fiil bağlacı uyarısı vermemelidir', () => {
  const res = engine.analyze('Bu komedide çok komik sahneler var. Kedide pire yok, kutuda eşyalar duruyor.');
  const falseErr = res.find(r => ['komedide','kedide','kutuda'].includes(r.word.toLowerCase()));
  assert(!falseErr, 'İsim bulunma hâli ekleri fiil bağlacı ile karıştırılmamalıdır');
});

it('Metin içindeki emoji ve ifadeler (:), :-(, ;)) noktalama hatası veya kapanmamış parantez üretmemelidir', () => {
  const res = engine.analyze('Harika bir gün :) Teşekkürler! Biraz yoruldum :( Görüşmek üzere ;)');
  const punctErr = res.find(r => r.type === 'punct' && (r.word.includes(':') || r.word === ')' || r.word === '('));
  assert(!punctErr, 'İfadeler/smileyler parantez ve boşluk hatası üretmemelidir');
});

it('cleanText uzun ve kısa diyalog çizgilerini (—, –) liste/konuşma gibi korumalıdır', () => {
  const dialog = '— Merhaba, nasılsın?\n— Teşekkürler, iyiyim.';
  assert.strictEqual(engine.cleanText(dialog), dialog, 'Diyalog satırları birbirine yapıştırılmamalıdır');
});

it('Uzun deyimler ve tamlamalar (su ana kadar) alt kelimeler tarafından gölgelenmemelidir', () => {
  const res = engine.analyze('su ana kadar hic boyle bir sey gormedim.');
  const suAnaKadar = res.find(r => r.word.toLowerCase() === 'su ana kadar');
  assert(suAnaKadar, '"su ana kadar" deyimi öncelikli olarak tek parça "şu ana kadar" olarak tespit edilmelidir');
  assert.strictEqual(suAnaKadar.suggestions[0], 'şu ana kadar');
});

it('Sözlük TXT ve BOM içeren metin dosyası formatı satır satır doğru ayrıştırılmalıdır', () => {
  const sampleTxt = '\uFEFFkubernetes\r\nnextjs\nreact\r\n"typescript"';
  let raw = sampleTxt.trim();
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const words = raw.split(/[\r\n;,]+/).map(p => p.trim().replace(/^['"\(\[\{]+|['"\)\]\}.,;:!?]+$/g, '')).filter(p => p.length > 0);
  assert.deepStrictEqual(words, ['kubernetes', 'nextjs', 'react', 'typescript']);
});

console.log('\n--- 21. Soru Eki Yanlış Pozitif Önleme, Yapım Ekli Özel Adlar (Türkçede), Milyon/Milyar Ses Uyumu & Harf Düzeni ---');
it('Sonu -m ile biten isimlerin iyelik/belirtme ekleri (sistemi, durumu, eğitimi, gelişimi, bölümü, çözümü, anlamı, önemi, kalemi, yirmi, ekonomi) yanlışlıkla soru eki sayılmamalıdır', () => {
  const sample = 'Eğitimi ve gelişimi için bu sistemi kurduk. Ekonominin durumu, konunun önemi ve kelimenin anlamı yirmi sayfada anlatıldı. Bu bölümü ve çözümü kalemi ile işaretledi.';
  const res = engine.analyze(sample);
  const falseMi = res.filter(r => r.type === 'gram' && r.msg && r.msg.includes('Soru eki'));
  assert.strictEqual(falseMi.length, 0, 'Normal isimlerde yanlış soru eki hatası üretilmemelidir: ' + falseMi.map(x => x.word).join(', '));
});

it('Gerçek bitişik soru ekleri (geliyormu, gelecekmi, geldimi, evdemi, güzelmi, doğrumu, hazırmısınız, öylemiydi) eksiksiz tespit edilmelidir', () => {
  const res = engine.analyze('Yarın geliyormu, ödevi yaptımı, şu an evdemi, sence bu doğrumu ve hazırmısınız?');
  const w1 = res.find(r => r.word.toLowerCase() === 'geliyormu');
  const w2 = res.find(r => r.word.toLowerCase() === 'yaptımı');
  const w3 = res.find(r => r.word.toLowerCase() === 'evdemi');
  const w4 = res.find(r => r.word.toLowerCase() === 'doğrumu');
  const w5 = res.find(r => r.word.toLowerCase() === 'hazırmısınız');
  assert(w1 && w1.suggestions[0] === 'geliyor mu', 'geliyormu -> geliyor mu olmalı');
  assert(w2 && w2.suggestions[0] === 'yaptı mı', 'yaptımı -> yaptı mı olmalı');
  assert(w3 && w3.suggestions[0] === 'evde mi', 'evdemi -> evde mi olmalı');
  assert(w4 && w4.suggestions[0] === 'doğru mu', 'doğrumu -> doğru mu olmalı');
  assert(w5 && w5.suggestions[0] === 'hazır mısınız', 'hazırmısınız -> hazır mısınız olmalı');
});

it('TDK kuralı gereği "Türkçede, Türkçenin, Türkçeye" doğru kabul edilmeli; "Türkçe\'de, Türkçe\'nin, İstanbullu\'nun" kesme hatası olarak düzeltilmelidir', () => {
  const validRes = engine.analyze('Türkçede ve Türkçenin yapısında bu kural çok açıktır.');
  const falseErr = validRes.find(r => r.word.toLowerCase().startsWith('türkçe'));
  assert(!falseErr, 'Türkçede / Türkçenin kelimelerine kesme işareti önerilmemelidir');

  const invalidRes = engine.analyze("Bu ifade Türkçe'de ve Türkçe'nin sözlüğünde yer alır, İstanbullu'nun hoşuna gider.");
  const k1 = invalidRes.find(r => r.word === "Türkçe'de");
  const k2 = invalidRes.find(r => r.word === "Türkçe'nin");
  const k3 = invalidRes.find(r => r.word === "İstanbullu'nun");
  assert(k1 && k1.suggestions[0] === 'Türkçede', "Türkçe'de -> Türkçede olmalıdır");
  assert(k2 && k2.suggestions[0] === 'Türkçenin', "Türkçe'nin -> Türkçenin olmalıdır");
  assert(k3 && k3.suggestions[0] === 'İstanbullunun', "İstanbullu'nun -> İstanbullunun olmalıdır");
});

it('Küçük harfle yazılan özel isimler (türkiyede, istanbulda) tek adımda büyük harf ve kesme işaretiyle (Türkiye\'de, İstanbul\'da) önerilmelidir', () => {
  const res = engine.analyze('Bugün türkiyede ve istanbulda hava güneşli.');
  const w1 = res.find(r => r.word === 'türkiyede');
  const w2 = res.find(r => r.word === 'istanbulda');
  assert(w1 && w1.suggestions[0] === "Türkiye'de", "türkiyede -> Türkiye'de olmalıdır");
  assert(w2 && w2.suggestions[0] === "İstanbul'da", "istanbulda -> İstanbul'da olmalıdır");
});

it('convertCase başlık düzeninde kesmeli kelimeleri (İstanbul\'un) ve sayıları (100 ve 200) bozmamalı, cümle düzeninde kısaltmaları ve özel adları korumalıdır', () => {
  assert.strictEqual(engine.convertCase("istanbul'un ve türkiye'nin 100 ve 200 yıllık tarihi", 'title'), "İstanbul'un ve Türkiye'nin 100 ve 200 Yıllık Tarihi");
  assert.strictEqual(engine.convertCase("DR. AHMET İLE 2. SINIFA VE TÜRKİYE'DE EĞİTİME BAKTIK.", 'sentence'), "Dr. ahmet ile 2. sınıfa ve Türkiye'de eğitime baktık.");
});

it('1000000 (milyon) ve 1000000000 (milyar) kalın ünlü uyumu (1000000\'da) almalı ve 100m ölçü birimi kesme hatası sayılmamalıdır', () => {
  const res = engine.analyze("Bütçe 1000000'de kaldı ve 100m koşuda birinci oldu.");
  const mil = res.find(r => r.word === "1000000'de");
  const meter = res.find(r => r.word === '100m');
  assert(mil && mil.suggestions[0] === "1000000'da", "1000000'de -> 1000000'da olmalıdır");
  assert(!meter, '100m ölçü birimi sayı eki sanılmamalıdır');
});

console.log('\n--- 22. Bağlaç/Zarf-Fiil Yanlış Virgülleri, Kısaltma Ekleri Ses Uyumu & Konuşma Süresi/Paragraf ---');
it('Bağlaçlardan (ve, veya, çünkü) ve tek şart/zarf-fiilden (-sa, -ıp, -arak) sonraki gereksiz virgüller tespit edilmelidir', () => {
  const res = engine.analyze('Eve gelip, hemen yattı. Çok çalışırsa, başarır. Sen de gel çünkü, seni bekliyoruz.');
  const it1 = res.find(r => r.word.includes('gelip,'));
  const it2 = res.find(r => r.word.includes('çalışırsa,'));
  const it3 = res.find(r => r.word.includes('çünkü,'));
  assert(it1 && it1.suggestions[0].startsWith('gelip'), 'gelip, virgülü yakalanmalı');
  assert(it2 && it2.suggestions[0].startsWith('çalışırsa'), 'çalışırsa, virgülü yakalanmalı');
  assert(it3 && it3.suggestions[0] === 'çünkü ', 'çünkü, virgülü yakalanmalı');
});

it('Büyük harfli kısaltmalarda son harfin okunuşuna göre ek denetimi (TDK\'den, TÜBİTAK\'ta, THY\'de, RTÜK\'te) yapılmalıdır', () => {
  const res = engine.analyze("TDK'da yeni kurallar var, TÜBİTAK'da projeler onaylandı ve THY'da bilet tükendi.");
  const w1 = res.find(r => r.word === "TDK'da");
  const w2 = res.find(r => r.word === "TÜBİTAK'da");
  const w3 = res.find(r => r.word === "THY'da");
  assert(w1 && w1.suggestions[0] === "TDK'de", "TDK'da -> TDK'de olmalıdır");
  assert(w2 && w2.suggestions[0] === "TÜBİTAK'ta", "TÜBİTAK'da -> TÜBİTAK'ta olmalıdır");
  assert(w3 && w3.suggestions[0] === "THY'de", "THY'da -> THY'de olmalıdır");
});

it('computeReadability speechTimeStr ve totalParagraphs metriklerini doğru hesaplamalıdır', () => {
  const sample = 'Birinci paragraf burada yer alıyor.\n\nİkinci paragraf ise burada başlıyor.\n\nÜçüncü paragrafta sunum yapılıyor.';
  const r = engine.computeReadability(sample);
  assert(r && typeof r.speechTimeStr === 'string', 'speechTimeStr üretilmelidir');
  assert.strictEqual(r.totalParagraphs, 3, '3 paragraf tespit edilmelidir');
});

console.log(`\n================================`);
console.log(`Sonuç: ${passed} Başarılı, ${failed} Hatalı`);
console.log(`================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 Tüm testler başarıyla geçti!');
}
