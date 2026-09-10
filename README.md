# TürkçeYazım

**Türkçe metinler için açık kaynaklı, TDK uyumlu yazım, dilbilgisi, noktalama ve okunabilirlik denetleyicisi.**

🌐 **[rasne-dev.github.io/turkce-yazim](https://rasne-dev.github.io/turkce-yazim/)**

---

## 🚀 Yeni Özellikler (v2.0)

- **🏛️ TDK 2023 Güncellemeleri:** `ünvan` → `unvan`, `yeşilzeytin` → `yeşil zeytin`, `doğalgaz` → `doğal gaz`, `çevrimiçi` → `çevrim içi`, `kayyum` → `kayyım` vb.
- **📊 Ateşman Türkçe Okunabilirlik İndeksi:** Bilimsel formülle metnin okunabilirlik seviyesini (*Çok Kolay, Kolay, Orta, Zor, Çok Zor*), tahmini okuma süresini ve cümle istatistiklerini hesaplar.
- **🌙 Karanlık Mod (Dark Mode):** Sistem tercihiyle otomatik uyumlu veya tek tıkla geçiş yapılabilir modern karanlık tema.
- **📁 Dosya İçe/Dışa Aktarma:** `.txt` ve `.md` dosyalarını sürükle-bırak veya butonla yükleme; düzeltilmiş metni anında `.txt` olarak indirme.
- **⌨️ Klavye Kısayolları Modalı:** `?` tuşu ile açılan kısayol rehberi, `Ctrl + Enter` ile denetleme, `Ctrl + Shift + F` ile tümünü düzeltme, `Ctrl + Z` ile geri alma.
- **🔍 Canlı Hata Arama:** Hatalar listesinde kelimeye veya kurala göre anında filtreleme.
- **🧪 Otomatik Birim Test Paketi:** `npm test` ile kuralların doğruluğunu güvenceye alan Node.js testleri.

---

## Özellikler

### 🔴 Yazım Hataları
- 200+ yaygın Türkçe yazım hatası (TDK kurallarına göre)
- `orjinal` → `orijinal`, `laboratuar` → `laboratuvar`, `şöför` → `şoför`, `pantalon` → `pantolon`
- `dinazor` → `dinozor`, `muhattap` → `muhatap`, `hastahane` → `hastane`, `birşey` → `bir şey`
- Türkçe karakter eksikliği: `gercekten` → `gerçekten`, `onemli` → `önemli`, `icin` → `için`
- Konuşma dili kısaltmaları: `geliyo` → `geliyor`, `diyo` → `diyor`, `napıyorsun` → `ne yapıyorsun`
- İkilemeler: `başbaşa` → `baş başa`, `yüzyüze` → `yüz yüze`, `peşpeşe` → `peş peşe`
- Bitişik yazılanlar: `git gide` → `gitgide`, `birden bire` → `birdenbire`, `rast gele` → `rastgele`

### 🟣 Dilbilgisi — de/da, ki ve mi Kuralları
- **"de/da" bağlacı ayrı yazılmalıdır:** `hemde` → `hem de`, `yinede` → `yine de`, `birde` → `bir de`
- **"-ki" sıfat eki bitişik yazılmalıdır:** `masada ki` → `masadaki`, `dün ki` → `dünkü`
- **Gereksiz "ki":** `çünkü ki` → `çünkü`, `sanki ki` → `sanki`
- **Bitişik yazılması gereken bağlaçlar:** `madem ki` → `mademki`, `oysa ki` → `oysaki`
- **Soru eki "mı/mi/mu/mü":** `gelecekmi` → `gelecek mi`, `tamammı` → `tamam mı`

### 🟡 Noktalama & Biçim Denetimleri
- Virgül, nokta, soru işareti ve ünlem sonrası boşluk kontrolü
- Noktalama işaretlerinden önce gereksiz boşluk tespiti
- Çift ve fazla boşluk temizleme
- Kapatılmamış parantez `(` ve tırnak denetimi
- Arka arkaya tekrarlanan mükerrer kelime tespiti (`ve ve`, `ile ile` vb.)

### 🔵 Akıllı Öneriler & Tahminler
- Cümle başı büyük harf (`ali'nin` → `Ali'nin`)
- Özel isim/kısaltma/sayı kesme işareti (`Türkiyede` → `Türkiye'de`, `2024de` → `2024'te`)
- Üç nokta → elipsis (`...` → `…`)
- Bağlama göre akıllı tahmin (Zamir + de/da, bir takım vs birtakım, birebir vs bire bir)

---

## ⌨️ Klavye Kısayolları

| Kısayol | İşlem |
|---|---|
| `Ctrl + Enter` | Metni Denetle |
| `Ctrl + Shift + F` | Tüm Otomatik Düzeltmeleri Uygula |
| `Ctrl + Z` | Son İşlemi Geri Al |
| `Ctrl + Alt + C` | Metni Panoya Kopyala |
| `←` / `→` | Popup Açıkken Önceki / Sonraki Hata |
| `Esc` | Popup veya Modalları Kapat |
| `?` | Klavye Kısayolları Menüsü |

---

## Kullanım

Siteyi doğrudan tarayıcıda açın — kurulum gerekmez.

1. Metni yazın, yapıştırın veya **📁 Dosya Aç** ile yükleyin.
2. **✓ Kontrol Et** butonuna tıklayın (`Ctrl + Enter`).
3. Vurgulu kelimelere tıklayarak önerileri inceleyin ve düzeltin.
4. **⚡ Tümünü** butonu ile tüm güvenli düzeltmeleri tek seferde uygulayın.
5. **💾 İndir** ile düzeltilmiş metni kaydedin veya **⎘ Kopyala** ile panoya alın.

---

## Geliştirici & Test

Testleri yerel ortamda çalıştırmak için:

```bash
# Node.js ile birim testleri çalıştırın
npm test
# veya
node test.js
```

---

## Teknik

- **Tek HTML dosyası** — harici CDN veya kütüphane bağımlılığı yoktur.
- **%100 İstemci Taraflı** — metniniz asla sunucuya gönderilmez, tarayıcınızda yerel işlenir.
- **Kural Tabanlı Motor** — TDK yazım kılavuzuna dayalı yüksek doğruluklu regex kuralları.
- **Ateşman Algoritması** — Türkçe hece yapısına uygun bilimsel okunabilirlik hesaplaması.

---

## Lisans

[MIT](LICENSE)
