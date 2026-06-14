# TürkçeYazım

**Türkçe metinler için açık kaynaklı yazım, dilbilgisi ve noktalama denetleyici.**

🌐 **[rasne-dev.github.io/turkce-yazim](https://rasne-dev.github.io/turkce-yazim/)**

---

## Özellikler

### 🔴 Yazım Hataları
- 90+ yaygın Türkçe yazım hatası (TDK kurallarına göre)
- `birşey` → `bir şey`, `herkez` → `herkes`, `icin` → `için` vb.
- Türkçe karakter eksikliği: `gercekten` → `gerçekten`, `onemli` → `önemli`
- Konuşma dili kısaltmaları: `geliyo` → `geliyor`, `diyo` → `diyor`

### 🟣 Dilbilgisi — de/da ve ki Kuralları
- **"de/da" bağlacı ayrı yazılmalıdır:** `hemde` → `hem de`, `yinede` → `yine de`, `birde` → `bir de`
- **"-ki" sıfat eki bitişik yazılmalıdır:** `masada ki` → `masadaki`, `dün ki` → `dünkü`
- **Fazladan "ki":** `çünkü ki` → `çünkü`, `sanki ki` → `sanki`
- **Bitişik yazılması gereken bağlaçlar:** `madem ki` → `mademki`

### 🟡 Noktalama
- Virgül, nokta, soru işareti ve ünlem sonrası boşluk kontrolü
- Noktalama işaretlerinden önce boşluk olmaması kuralı
- Çift boşluk tespiti

### 🔵 Öneriler
- Cümle başı büyük harf (`ali'nin` → `Ali'nin`)
- Özel isim + ek kesme işareti (`Türkiyede` → `Türkiye'de`)
- Üç nokta → elipsis (`...` → `…`)

---

## Kullanım

Siteyi doğrudan tarayıcıda açın — kurulum gerekmez.

- Metni yazın veya yapıştırın
- **Kontrol Et** butonuna tıklayın ya da **Ctrl + Enter** kullanın
- Altı çizili kelimelere tıklayarak öneri görün ve düzeltin
- **⚡ Tümünü Düzelt** ile tüm güvenli düzeltmeleri tek seferde uygulayın

---

## Teknik

- Tek HTML dosyası — harici bağımlılık yok
- Tamamen istemci tarafında çalışır, metin sunucuya gönderilmez
- Kural tabanlı motor: TDK yazım kılavuzuna dayalı regex kuralları

---

## Katkı

Eksik kural, yanlış tespit veya öneri için [issue açın](https://github.com/rasne-dev/turkce-yazim/issues).

Kural eklemek için `index.html` içindeki şu dizileri düzenleyin:
- `SPELL_RULES` — yazım hataları
- `DEDA_AYRI` — de/da bağlaç kuralları
- `KI_*` — ki kuralları

---

## Lisans

[MIT](LICENSE)
