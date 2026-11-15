(function(){
'use strict';
function tl(s){return s.replace(/İ/g,'i').replace(/I/g,'ı').toLowerCase()}
function tu(s){if(!s)return s;const c=s[0];return(c==='i'?'İ':c==='ı'?'I':c.toUpperCase())+s.slice(1)}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}

const WB='(?<![\\wığüşöçİĞÜŞÖÇ\'\u2019\u02bc])';
const WE='(?![\\wığüşöçİĞÜŞÖÇ\'\u2019\u02bc])';
function wb(p){return WB+p+WE}

const ABBRS=new Set(['prof','dr','cad','sok','no','yard','doç','av','mah','alb','gen','müh','mim','ist','ank','m','sn','dk','sa','hz','bn','kd','uzm','arş','öğr','mr','mrs','st','vb','vs','bkz','krş','çev','haz','ed','yay','ünv','fak','tbmm','meb','tc','tl']);

// ============================================================
// SPELL — Yazım hataları (TDK standartları)
// ============================================================
const SPELL=[
  // === TDK 2023 GÜNCELLEMELERİ ===
  ['ünvan','unvan'],['ünvanı','unvanı'],['ünvanlar','unvanlar'],['ünvanlı','unvanlı'],
  ['yeşilzeytin','yeşil zeytin'],['yeşilzeytini','yeşil zeytini'],
  ['yeşilbiber','yeşil biber'],
  ['doğalgaz','doğal gaz'],['dogalgaz','doğal gaz'],
  ['çevrimiçi','çevrim içi'],['cevrimici','çevrim içi'],
  ['çevrimdışı','çevrim dışı'],['cevrimdisi','çevrim dışı'],
  ['kayyum','kayyım'],['kayyumu','kayyımı'],
  ['hasır altı','hasıraltı'],['hasır altı etmek','hasıraltı etmek'],
  ['akzambak','ak zambak'],
  ['yurtiçi','yurt içi'],['yurtici','yurt içi'],
  ['yurtdışı','yurt dışı'],['yurtdisi','yurt dışı'],
  ['haftaiçi','hafta içi'],['haftaici','hafta içi'],
  ['basınçölçer','basınç ölçer'],

  // === ÜNSÜZ SERTLEŞMESİ (BENZEŞMESİ) KURALLARI ===
  ['yapdı','yaptı'],['yapdım','yaptım'],['yapdık','yaptık'],['yapdırdı','yaptırdı'],
  ['gitdi','gitti'],['gitdik','gittik'],['gitmişdi','gitmişti'],
  ['bitdi','bitti'],['kesdi','kesti'],['bakdı','baktı'],['açdı','açtı'],['atdı','attı'],
  ['tutdu','tuttu'],['seçdi','seçti'],['geçdi','geçti'],['düşdü','düştü'],

  // === TDK AYRI YAZILAN BELİRTEÇ VE SÖZCÜKLER ===
  ['hergün','her gün'],['heran','her an'],['heryer','her yer'],['heryerde','her yerde'],
  ['heryerden','her yerden'],['herzaman','her zaman'],
  ['hiçkimse','hiç kimse'],['hiç bir şey','hiçbir şey'],['pekaz','pek az'],
  ['birara','bir ara'],['birgün','bir gün'],
  ['yıldönümü','yıl dönümü'],['yıldönümünü','yıl dönümünü'],
  ['işbirliği','iş birliği'],['işbölümü','iş bölümü'],
  ['anadili','ana dili'],['anafikir','ana fikir'],['önsöz','ön söz'],
  ['sıradışı','sıra dışı'],['yasadışı','yasa dışı'],['çağdışı','çağ dışı'],
  ['akıldışı','akıl dışı'],['olağandışı','olağan dışı'],
  ['yanısıra','yanı sıra'],['peşisıra','peşi sıra'],['ardısıra','ardı sıra'],
  ['gözardı','göz ardı'],['gözardı etmek','göz ardı etmek'],
  ['baştacı','baş tacı'],['baştacı etmek','baş tacı etmek'],
  ['profösör','profesör'],['profösörü','profesörü'],['profösörler','profesörler'],
  ['gardrop','gardırop'],['gardolap','gardırop'],
  ['biran','bir an'],['ilkönce','ilk önce'],
  ['artniyet','art niyet'],['artniyetli','art niyetli'],
  ['hakketmek','hak etmek'],['hakketti','hak etti'],['hakkediyor','hak ediyor'],['hakketmedi','hak etmedi'],
  ['kabuletmek','kabul etmek'],['kabuletti','kabul etti'],['kabulediyorum','kabul ediyorum'],
  ['devametmek','devam etmek'],['devametti','devam etti'],['devamediyor','devam ediyor'],
  ['iptaletmek','iptal etmek'],['iptaletti','iptal etti'],['iptaledildi','iptal edildi'],
  ['sözetmek','söz etmek'],['sözetti','söz etti'],['sözediyor','söz ediyor'],
  ['yardımetmek','yardım etmek'],['yardımetti','yardım etti'],
  ['teslimetmek','teslim etmek'],['teslimetti','teslim etti'],
  ['notetmek','not etmek'],['notetti','not etti'],
  ['ricaetmek','rica etmek'],['ricaetti','rica etti'],

  // === TDK BİTİŞİK YAZILAN BİRLEŞİK KELİMELER (ANLAM DEĞİŞİMİ) ===
  ['kuş burnu','kuşburnu'],['gök kuşağı','gökkuşağı'],['su çiçeği','suçiçeği'],
  ['it dirseği','itdirseği'],['aslan ağzı','aslanağzı'],['bülbül yuvası','bülbülyuvası'],
  ['baş yapıt','başyapıt'],['baş rol','başrol'],
  ['sağ duyu','sağduyu'],['sağ duyulu','sağduyulu'],
  ['var sayım','varsayım'],['var saymak','varsaymak'],

  // === YAYGIN SÖZCÜK HATALARI ===
  ['orjinal','orijinal'],['orjinali','orijinali'],['orjinalini','orijinalini'],['orjinalliği','orijinalliği'],
  ['şöför','şoför'],['şöförü','şoförü'],['şöföre','şoföre'],['şöförde','şoförde'],['şöförden','şoförden'],['şöförün','şoförün'],['şöförler','şoförler'],
  ['sofor','şoför'],['soför','şoför'],['şofor','şoför'],
  ['pantalon','pantolon'],['pantalonu','pantolonu'],
  ['laboratuar','laboratuvar'],['laboratuarı','laboratuvarı'],
  ['labaratuar','laboratuvar'],['labaratuarı','laboratuvarı'],
  ['karnıbahar','karnabahar'],
  ['dinazor','dinozor'],['dinazorlar','dinozorlar'],
  ['muhattap','muhatap'],['muhattabı','muhatabı'],
  ['komidin','komodin'],
  ['sarmısak','sarımsak'],['sarmısaklı','sarımsaklı'],
  ['tesbih','tespih'],['tesbihi','tespihi'],
  ['ahçı','aşçı'],['ahçılık','aşçılık'],
  ['kiprik','kirpik'],['kiprikleri','kirpikleri'],
  ['kirbit','kibrit'],
  ['idda','iddia'],['iddada','iddiada'],
  ['hastahane','hastane'],['hastahanede','hastanede'],['hastahaneye','hastaneye'],
  ['eskik','eksik'],['eskikler','eksikler'],['eskiklik','eksiklik'],['eskikliği','eksikliği'],['eskiklikler','eksiklikler'],
  ['enysekki','neyse ki'],['enyseki','neyse ki'],['neysekki','neyse ki'],['neyseki','neyse ki'],
  ['yalnış','yanlış'],['yalnışlık','yanlışlık'],['yalnışlıkla','yanlışlıkla'],['yalnışlar','yanlışlar'],
  ['yanlız','yalnız'],['yanlızlık','yalnızlık'],
  ['makina','makine'],['makinası','makinesi'],
  ['postahane','postane'],['postahanede','postanede'],
  ['eczahane','eczane'],['eczahanede','eczanede'],
  ['pastahane','pastane'],['pastahanede','pastanede'],
  ['steteskop','stetoskop'],
  ['kapşon','kapüşon'],['kapson','kapüşon'],
  ['gravat','kravat'],
  ['kavonoz','kavanoz'],
  ['kolleksiyon','koleksiyon'],
  ['kataloğ','katalog'],['katalogu','kataloğu'],
  ['sezeryan','sezaryen'],
  ['şevkat','şefkat'],['şevkatli','şefkatli'],
  ['tesbit','tespit'],['tesbiti','tespiti'],
  ['tayzik','tazyik'],
  ['entellektüel','entelektüel'],
  ['itibariyle','itibarıyla'],
  ['büsküvi','bisküvi'],['bisküüt','bisküvi'],
  ['rast gele','rastgele'],
  ['birden bire','birdenbire'],
  ['git gide','gitgide'],
  ['başbaşa','baş başa'],['basbasa','baş başa'],
  ['yüzyüze','yüz yüze'],['yuzyuze','yüz yüze'],
  ['peşpeşe','peş peşe'],['pespese','peş peşe'],
  ['yanyana','yan yana'],['yanyanalar','yan yanalar'],
  ['elele','el ele'],
  ['artarda','art arda'],['ard arda','art arda'],
  ['içiçe','iç içe'],['icice','iç içe'],
  ['üstüste','üst üste'],['ustuste','üst üste'],
  ['gözgöze','göz göze'],['gozgoze','göz göze'],
  ['dizdize','diz dize'],
  ['canayakın','cana yakın'],
  ['hoş görü','hoşgörü'],
  ['bilinç altı','bilinçaltı'],
  ['akşam üstü','akşamüstü'],['ayak üstü','ayaküstü'],['öğle üstü','öğleüstü'],
  ['suç üstü','suçüstü'],['olağan üstü','olağanüstü'],
  ['ön sezi','önsezi'],['ön görü','öngörü'],
  ['önyargı','ön yargı'],['önyargılı','ön yargılı'],['önyargılar','ön yargılar'],
  ['ön ayak','önayak'],
  ['öz veri','özveri'],
  ['özsaygı','öz saygı'],
  ['özgüven','öz güven'],

  // === BİTİŞİK / AYRI YAZIM ===
  ['birşey','bir şey'],['birşeyi','bir şeyi'],['birşeyler','bir şeyler'],
  ['birşeyde','bir şeyde'],['birşeyden','bir şeyden'],['birşeye','bir şeye'],
  ['herşey','her şey'],['herşeyi','her şeyi'],['herşeyleri','her şeyleri'],
  ['herşeyde','her şeyde'],['herşeyden','her şeyden'],['herşeye','her şeye'],
  ['hiçbirşey','hiçbir şey'],['hiçbirşeyi','hiçbir şeyi'],
  ['hiçbirşeyde','hiçbir şeyde'],['hiçbirşeyden','hiçbir şeyden'],
  ['bişey','bir şey'],['bişeyi','bir şeyi'],['bişeyler','bir şeyler'],
  ['yada','ya da'],
  ['bir çok','birçok'],['bir kaç','birkaç'],
  ['her hangi','herhangi'],
  ['bu gun','bugün'],['bu gün','bugün'],
  ['su an','şu an'],['su anda','şu anda'],['su anki','şu anki'],
  ['su ana','şu ana'],['su ana kadar','şu ana kadar'],
  ['altında ki','altındaki'],['üstünde ki','üstündeki'],
  ['yanında ki','yanındaki'],['içinde ki','içindeki'],
  ['dışında ki','dışındaki'],['başında ki','başındaki'],
  ['sonunda ki','sonundaki'],['arasında ki','arasındaki'],
  ['önünde ki','önündeki'],['arkasında ki','arkasındaki'],
  ['üzerinde ki','üzerindeki'],

  // === TÜRKÇE KARAKTER EKSİKLİĞİ ===
  ['icin','için'],['icine','içine'],['icinde','içinde'],['icinden','içinden'],
  ['icindeki','içindeki'],['iceri','içeri'],['iceride','içeride'],
  ['iceriden','içeriden'],['icerik','içerik'],['icerigi','içeriği'],
  ['hic','hiç'],['hicbir','hiçbir'],['hicbiri','hiçbiri'],['hicbirini','hiçbirini'],
  ['hic bir','hiçbir'],
  ['gercek','gerçek'],['gercekten','gerçekten'],['gercegi','gerçeği'],
  ['gerceklestirilmesi','gerçekleştirilmesi'],['gerceklesen','gerçekleşen'],
  ['gerceklesme','gerçekleşme'],['gerceklestir','gerçekleştir'],
  ['once','önce'],['oncelikle','öncelikle'],['onceki','önceki'],
  ['onceden','önceden'],['oncesinde','öncesinde'],
  ['ozel','özel'],['ozellikle','özellikle'],['ozellikleri','özellikleri'],
  ['ozelligi','özelliği'],['ozelligini','özelliğini'],
  ['onem','önem'],['onemli','önemli'],['onemlidir','önemlidir'],
  ['oneminden','öneminden'],['onemsiz','önemsiz'],['onemli bir','önemli bir'],
  ['ozur','özür'],['ozurlu','özürlü'],['ozur dilerim','özür dilerim'],
  ['boyle','böyle'],['boylece','böylece'],['boylelikle','böylelikle'],['boyle bir','böyle bir'],
  ['soyle','söyle'],['soyleyin','söyleyin'],['soyledi','söyledi'],
  ['soyledim','söyledim'],['soylemek','söylemek'],['soylenir','söylenir'],
  ['oyle','öyle'],['oyleyse','öyleyse'],['oyle bir','öyle bir'],
  ['yuzde','yüzde'],['uzere','üzere'],
  ['bircok','birçok'],['birkac','birkaç'],
  ['kucuk','küçük'],['kucuktur','küçüktür'],
  ['buyuk','büyük'],['buyuktur','büyüktür'],
  ['dusun','düşün'],['dusunce','düşünce'],['dusunur','düşünür'],
  ['dusunmek','düşünmek'],['dusunuyorum','düşünüyorum'],['dusundum','düşündüm'],
  ['gunes','güneş'],['ates','ateş'],
  ['ogretmen','öğretmen'],['ogretmeni','öğretmeni'],['ogretmenler','öğretmenler'],['ogretmenin','öğretmenin'],
  ['ogrenci','öğrenci'],['ogrenciler','öğrenciler'],['ogrencinin','öğrencinin'],['ogrencisi','öğrencisi'],
  ['ogren','öğren'],['ogrenir','öğrenir'],['ogrenmek','öğrenmek'],['ogrendi','öğrendi'],['ogrendim','öğrendim'],
  ['herkez','herkes'],['herkezin','herkesin'],['herkezi','herkesi'],['herkeze','herkese'],
  ['simdi','şimdi'],['simdiye','şimdiye'],['simdiden','şimdiden'],['simdilik','şimdilik'],['simdiki','şimdiki'],
  ['sey','şey'],['seyler','şeyler'],['seyleri','şeyleri'],
  ['cunki','çünkü'],['cunku','çünkü'],
  ['değilmi','değil mi'],['değilmiydi','değil miydi'],['değilmisin','değil misin'],['değilmisiniz','değil misiniz'],
  ['tamammı','tamam mı'],['olabilirmi','olabilir mi'],['mümkünmü','mümkün mü'],['dogrumu','doğru mu'],

  // === KONUŞMA DİLİ KISALTMALARI ===
  ['oluyo','oluyor'],['geliyo','geliyor'],['gidiyo','gidiyor'],['yapıyo','yapıyor'],['bekliyo','bekliyor'],
  ['veriyo','veriyor'],['biliyo','biliyor'],['istiyo','istiyor'],['diyo','diyor'],['demiyo','demiyor'],
  ['görmüyo','görmüyor'],['bilmiyo','bilmiyor'],['almıyo','almıyor'],['getiriyo','getiriyor'],
  ['götürüyo','götürüyor'],['düşünüyo','düşünüyor'],['söylüyo','söylüyor'],['yiyo','yiyor'],
  ['içiyo','içiyor'],['çıkıyo','çıkıyor'],['girmiyo','girmiyor'],['gönderiyo','gönderiyor'],
  ['anlatıyo','anlatıyor'],['okuyo','okuyor'],['yazıyo','yazıyor'],['oynuyo','oynuyor'],
  ['ağlıyo','ağlıyor'],['gülio','gülüyor'],['koşuyo','koşuyor'],['uçuyo','uçuyor'],['sürüyo','sürüyor'],
  ['napalım','ne yapalım'],['napıyorsun','ne yapıyorsun'],['napıyorum','ne yapıyorum'],
  ['napacaksın','ne yapacaksın'],['naparsın','ne yaparsın'],['naptın','ne yaptın'],
  ['napayım','ne yapayım'],['napcaz','ne yapacağız'],
  ['tammam','tamam'],['merhabaa','merhaba'],
  ['disari','dışarı'],['disarida','dışarıda'],['disaridan','dışarıdan'],['disariya','dışarıya'],
  ['disinda','dışında'],['disindaki','dışındaki'],['ayrica','ayrıca'],
  ['calismak','çalışmak'],['calisma','çalışma'],['calisiyor','çalışıyor'],['calisti','çalıştı'],['calisir','çalışır'],['calisan','çalışan'],
  ['gormek','görmek'],['goruyorum','görüyorum'],['gordu','gördü'],['gormustum','görmüştüm'],['gormus','görmüş'],['goruyor','görüyor'],
  ['baslamak','başlamak'],['basladi','başladı'],['baslayan','başlayan'],['basla','başla'],['basliyor','başlıyor'],['baslangic','başlangıç'],
  ['kacmak','kaçmak'],['kacti','kaçtı'],['kaciyor','kaçıyor'],
  ['gecmek','geçmek'],['gecti','geçti'],['gecmis','geçmiş'],['gecen','geçen'],['gecerli','geçerli'],['gecici','geçici'],
  ['dusmek','düşmek'],['dustu','düştü'],['dusuyor','düşüyor'],
  ['cocuk','çocuk'],['cocuklar','çocuklar'],['cocugun','çocuğun'],
  ['acik','açık'],['acikca','açıkça'],['aciklama','açıklama'],['aciklamak','açıklamak'],
  ['saglik','sağlık'],['saglıklı','sağlıklı'],['saglikli','sağlıklı'],
  ['dogru','doğru'],['dogruluk','doğruluk'],['dogrudan','doğrudan'],['dogrulama','doğrulama'],
  ['yagmur','yağmur'],['yagmurlu','yağmurlu'],
  ['agir','ağır'],['agirlik','ağırlık'],
  ['ogle','öğle'],['ogle yemegi','öğle yemeği'],
  ['dun','dün'],['dunden','dünden'],['dune','düne'],['dunku','dünkü'],
  ['muzik','müzik'],['muzige','müziğe'],['muzikle','müzikle'],
  ['uzgun','üzgün'],
  ['gunler','günler'],['gunde','günde'],['gunluk','günlük'],['gunelik','günlük'],
  ['sans','şans'],['sanslı','şanslı'],['sansiz','şanssız'],
  ['sarki','şarkı'],['sarkilar','şarkılar'],['sarkici','şarkıcı'],
  ['sehir','şehir'],['sehirde','şehirde'],['sehirler','şehirler'],
  ['sirket','şirket'],['sirketin','şirketin'],
  ['asagi','aşağı'],['asagida','aşağıda'],['asagidaki','aşağıdaki'],
  ['yukari','yukarı'],['yukarida','yukarıda'],['yukaridaki','yukarıdaki'],
  ['ulke','ülke'],['ulkede','ülkede'],['ulkeler','ülkeler'],
  ['cok','çok'],['cok daha','çok daha'],['coktan','çoktan'],['cokca','çokça'],
  ['cikmak','çıkmak'],['cikti','çıktı'],['cikiyor','çıkıyor'],['cikis','çıkış'],
  ['aliyor','alıyor'],['alıyo','alıyor'],['kaliyor','kalıyor'],['kaliyo','kalıyor'],
  ['yuksek','yüksek'],['yuksekte','yüksekte'],
  ['guzel','güzel'],['guzelde','güzelde'],
  ['guc','güç'],['guclu','güçlü'],['guctur','güçtür'],
  ['ogretim','öğretim'],
  ['sunu','şunu'],['sunlar','şunlar'],['sunları','şunları'],
  ['cevre','çevre'],['cevresi','çevresi'],
  ['cozum','çözüm'],['coz','çöz'],['cozer','çözer'],
  ['gorus','görüş'],['gorusum','görüşüm'],['gorustum','görüştüm'],
  ['olcu','ölçü'],['olcek','ölçek'],
  ['sikayet','şikâyet'],['sartlar','şartlar'],['sart','şart'],['cesitli','çeşitli'],
  ['malesef','maalesef'],
  ['hoşçakal','hoşça kal'],['hoşçakalın','hoşça kalın'],
  ['ayırdetmek','ayırt etmek'],['ayırdedilemez','ayırt edilemez'],['ayırdedilmez','ayırt edilmez'],
  ['yoketmek','yok etmek'],['yoketti','yok etti'],
  ['halisünasyon','halüsinasyon'],['halisülasyon','halüsinasyon'],
  ['binfiil','bilfiil'],['birfiil','bilfiil'],
  ['süpriz','sürpriz'],['antreman','antrenman'],
  ['döküman','doküman'],['dokumanı','dokümanı'],['dokumanda','dokümanda'],
  ['insiyatif','inisiyatif'],['mütevazi','mütevazı'],['klavuz','kılavuz'],
  ['traş','tıraş'],['egzos','egzoz'],['eksoz','egzoz'],['egzozt','egzoz'],
  ['haftasonu','hafta sonu'],
  ['sağol','sağ ol'],['hoşgeldin','hoş geldin'],['hoşgeldiniz','hoş geldiniz'],
  ['farketmek','fark etmek'],['farketmedi','fark etmedi'],['farketmedim','fark etmedim'],
  ['farkettik','fark ettik'],['farkettim','fark ettim'],['farketmiş','fark etmiş'],
  ['farketti','fark etti'],['farkedecek','fark edecek'],
  ['farkediyorum','fark ediyorum'],['farkedilmez','fark edilmez'],
  ['terketmek','terk etmek'],['terkediyorum','terk ediyorum'],
  ['arzetmek','arz etmek'],['arzetmedi','arz etmedi'],
  ['ilüzyon','illüzyon'],['iluzyon','illüzyon'],
  ['tabiki','tabii ki'],['tabi ki','tabii ki'],
  ['tabikide','tabii ki de'],['tabiikide','tabii ki de'],
  ['müsade','müsaade'],['müsaid','müsait'],
  ['pekçok','pek çok'],
  ['herhangibir','herhangi bir'],['herhangibiri','herhangi biri'],
  ['meyva','meyve'],['meyvalar','meyveler'],
  ['nitekim ki','nitekim'],
  ['kıravat','kravat'],
  ['zatüre','zatürre'],
  ['erözyon','erozyon'],
  ['gidicek','gidecek'],['yapıcak','yapacak'],['alıcak','alacak'],['gelicek','gelecek'],
  ['buluçak','bulacak'],['yapıcaksın','yapacaksın'],['gidiceksin','gideceksin'],
  ['vaz geçmek','vazgeçmek'],
  ['farketmez','fark etmez'],['farketmiyor','fark etmiyor'],
  ['askeri ücret','asgari ücret'],['askeri ücrete','asgari ücrete'],['askeri ücreti','asgari ücreti'],
  ['askeri ücretin','asgari ücretin'],['askeri ücretle','asgari ücretle'],
  ['tesekkur','teşekkür'],['tesekkür','teşekkür'],['tesekkurler','teşekkürler'],['tesekkürler','teşekkürler'],
  ['tesekkur ederim','teşekkür ederim'],['tesekkür ederim','teşekkür ederim'],
  ['hakkaten','hakikaten'],['hakkatten','hakikaten'],
];

// ============================================================
// DEDA — "de/da" her zaman ayrı yazılan bağlaçlar
// ============================================================
const DEDA=[
  ['hemde','hem de'],['birde','bir de'],['yinede','yine de'],
  ['artıkda','artık da'],['sadecede','sadece de'],['ancakda','ancak da'],
  ['fakatda','fakat da'],['ayrıcada','ayrıca da'],['dahada','daha da'],
  ['çokda','çok da'],['hiçde','hiç de'],['oysada','oysa da'],
  ['zatende','zaten de'],['nede','ne de'],['genede','gene de'],
  ['bilede','bile de'],['oysakide','oysa ki de'],
  ['öncede','önce de'],['sonrada','sonra da'],['şimdide','şimdi de'],
  ['hepside','hepsi de'],['tekde','tek de'],
  ['onuda','onu da'],['bunuda','bunu da'],['şunuda','şunu da'],
  ['onlarıda','onları da'],['bunlarıda','bunları da'],['şunlarıda','şunları da'],
  ['benide','beni de'],['senide','seni de'],['bizide','bizi de'],['sizide','sizi de'],
  ['kendinide','kendini de'],['kendisinide','kendisini de'],
  ['hepsinide','hepsini de'],['hiçbirinide','hiçbirini de'],
  ['kimseyide','kimseyi de'],['birçoğunuda','birçoğunu da'],['birkaçınıda','birkaçını da'],
  ['paramıda','paramı da'],['annemide','annemi de'],['babamıda','babamı da'],['çantamıda','çantamı da'],
  ['banada','bana da'],['sanada','sana da'],['onada','ona da'],
  ['bizede','bize de'],['sizede','size de'],['onlarada','onlara da'],
  ['bencede','bence de'],['sencede','sence de'],['bizcede','bizce de'],['sizcede','sizce de'],
  ['buradada','burada da'],['şuradada','şurada da'],['oradada','orada da'],
  ['evdede','evde de'],['iştede','işte de'],
];

// ============================================================
// KI — "ki" kuralları
// ============================================================
const KI=[
  ['sanki ki','sanki'],['çünkü ki','çünkü'],['halbuki ki','halbuki'],
  ['zira ki','zira'],['mademki ki','mademki'],
  ['madem ki','mademki'],['oysa ki','oysaki'],
  ['dün ki','dünkü'],['şimdi ki','şimdiki'],['bugün ki','bugünkü'],
  ['yarın ki','yarınki'],['akşam ki','akşamki'],['sabah ki','sabahki'],
  ['gece ki','geceki'],['geçen ki','geçenki'],['öte ki','öteki'],
  ['şu an ki','şu anki'],['bu gün ki','bugünkü'],
  ['ilerde ki','ileriki'],['geride ki','gerideki'],
];

// ============================================================
// TAHMİN YARDIMCILARI (WARNS)
// ============================================================
const DATIVE_PRONOUNS=new Set(['bana','sana','ona','bize','size','onlara']);

const P2S_ROOTS=new Set([
  'gel','git','yap','et','al','ver','bak','gör','dur','çık','in',
  'oku','yaz','dinle','söyle','anla','kurtul','ye','iç','sev','bil',
  'çalış','iste','bekle','bırak','başla','bitir','konuş','otur','kalk'
]);

const PRON_NOUN_EXC=new Set([
  'durum','kurum','sorum','yorum','kısım','adım','resim','mevsim','hüküm','takım',
  'öğretim','eğitim','bölüm','toplum','üretim','tüketim','film','bilim','çizim',
  'yudum','akım','hacim','verim','bakım','canım','hanım','tanım','kavram',
  'deniz','havuz','ceviz','karpuz','yıldız','kılavuz','öküz','sakız','boynuz','omuz','pürüz',
  'basın','besin','kesin','esin','yasin','mersin','telsiz','hissiz','sessiz'
]);

function personAgrees(pron,verb){
  if(!verb) return false;
  const v=tl(verb.trim().replace(/^['"\(\[\{]+|['"\)\]\}.,;:!?]+$/g,''));
  if(!v) return false;
  if(PRON_NOUN_EXC.has(v)) return false;

  const P1S=/(yorum|dım$|dim$|dum$|düm$|tım$|tim$|tum$|tüm$|mışım$|mişim$|muşum$|müşüm$|acağım$|eceğim$|sam$|sem$|malıyım$|meliyim$|[ae]y[ıiuü]m$|[aeıiuü]r[ıiuü]m$|m[ae]m$)/;
  const P2S=/(yorsun|dın$|din$|dun$|dün$|tın$|tin$|tun$|tün$|mışsın$|mişsin$|muşsun$|müşsün$|acaksın$|eceksin$|malısın$|melisin$|sana$|sene$|[aeıiuü]rs[ıiuü]n$|m[ae]zs[ıiuü]n$)/;
  const P3S=/(yor$|dı$|di$|du$|dü$|tı$|ti$|tu$|tü$|mış$|miş$|muş$|müş$|acak$|ecek$|malı$|meli$|[aeıiuü]r$|m[ae]z$)/;
  const P1P=/(yoruz|dık$|dik$|duk$|dük$|tık$|tik$|tuk$|tük$|mışız$|mişiz$|muşuz$|müşüz$|acağız$|eceğiz$|malıyız$|meliyiz$|[ae]l[ıiuü]m$|[aeıiuü]r[ıiuü]z$|m[ae]y[ıiuü]z$)/;
  const P2P=/(yorsunuz|dınız$|diniz$|dunuz$|dünüz$|tınız$|tiniz$|tunuz$|tünüz$|mışsınız$|mişsiniz$|muşsunuz$|müşsünüz$|acaksınız$|eceksiniz$|malısınız$|melisiniz$|[y]?[ıiuü]n$|[y]?[ıiuü]n[ıiuü]z$|[ae]s[ıiuü]n[ıiuü]z$|[aeıiuü]rs[ıiuü]n[ıiuü]z$|m[ae]zs[ıiuü]n[ıiuü]z$|s[ıiuü]n[ıiuü]z$)/;
  const P3P=/(yorlar$|dılar$|diler$|dular$|düler$|tılar$|tiler$|tular$|tüler$|mışlar$|mişler$|muşlar$|müşler$|acaklar$|ecekler$|s[ıiuü]nl[ae]r$|[aeıiuü]rl[ae]r$|m[ae]zl[ae]r$|l[ae]r$)/;

  switch(pron){
    case'ben':return P1S.test(v);
    case'sen':return P2S.test(v)||P2S_ROOTS.has(v);
    case'o':return P3S.test(v);
    case'biz':return P1P.test(v);
    case'siz':return P2P.test(v)||P2S.test(v);
    case'onlar':return P3P.test(v)||P3S.test(v);
    default:return false;
  }
}

function guessDeDa(m,text){
  const pron=tl(m[1]);
  if(DATIVE_PRONOUNS.has(pron)){
    return{opt:'A',reason:'"'+m[1]+'" yönelme hâlinde olduğundan üzerine hâl eki almaz; "'+m[2]+'" burada bağlaçtır.'};
  }
  const after=text.slice(m.index+m[0].length);
  const clause=(after.match(/^[^.!?;\n]*/)||[''])[0];
  if(/(^|[^\wığüşöçİĞÜŞÖÇ])(var|yok)([^\wığüşöçİĞÜŞÖÇ]|$)/i.test(clause)){
    return{opt:'B',reason:'Cümlede "var/yok" geçmesi bulunma/sahiplik anlamına (hâl eki) işaret eder.'};
  }
  const words=clause.trim().split(/\s+/).filter(Boolean);
  for(let i=0;i<Math.min(words.length,3);i++){
    const cw=words[i].replace(/[.,;:!?]+$/,'');
    if(personAgrees(pron,cw)){
      return{opt:'A',reason:'Cümledeki "'+cw+'" yüklemi "'+m[1]+'" ile aynı şahısta çekimlidir; bağlaç kullanımıdır.'};
    }
  }
  if(words.length>3){
    const lastW=words[words.length-1].replace(/[.,;:!?]+$/,'');
    if(personAgrees(pron,lastW)){
      return{opt:'A',reason:'Cümledeki "'+lastW+'" yüklemi "'+m[1]+'" ile aynı şahısta çekimlidir; bağlaç kullanımıdır.'};
    }
  }
  return null;
}

function guessKiHal(m,text){
  return{opt:'A',reason:'Virgülle ayrılmadığı için çoğunlukla sıfat eki (bitişik) kullanımıdır: "'+m[1]+'ki".'};
}

function guessIste(m,text){
  const before=text.slice(Math.max(0,m.index-20),m.index);
  const pw=before.match(/([\wığüşöçİĞÜŞÖÇ]+)\s*$/);
  const prevWord=pw?tl(pw[1]):'';
  const ISTE_TRIGGERS=new Set(['izin','yardım','af','özür','borç','para','ders','söz','hak']);
  if(ISTE_TRIGGERS.has(prevWord)){
    return{opt:'B',reason:'Önünde "'+pw[1]+'" gibi bir nesne olması istemek fiili emir kipine işaret eder.'};
  }
  return{opt:'A',reason:'"işte" (bakınız anlamında) günlük yazıda çok daha sık kullanılır.'};
}

function guessSadede(m,text){
  const after=text.slice(m.index+m[0].length);
  const clause=(after.match(/^[^.!?\n]*/)||[''])[0];
  if(new RegExp(WB+'(de|da)'+WE).test(tl(clause))){
    return{opt:'A',reason:'Aynı cümlede tekrar "de/da" geçmesi bağlaç sıralamasına işaret eder.'};
  }
  return{opt:'B',reason:'"sadede gelmek/girmek" deyiminde bitişik ve doğru kullanılır.'};
}

function guessUnlu(m,text){
  const after=text.slice(m.index+m[0].length,m.index+m[0].length+30);
  if(/^\s*mam/i.test(after)){
    return{opt:'B',reason:'Ardından "mamul" gelmesi unlu mamuller ifadesine işaret eder.'};
  }
  return{opt:'A',reason:'"ünlü" (meşhur anlamında) yazıda çok daha yaygındır.'};
}

function guessBirTakim(m,text){
  const ctx=text.slice(Math.max(0,m.index-40),m.index+m[0].length+40);
  if(new RegExp(WB+'(futbol|basketbol|voleybol|oyuncu|maç|lig|kurduk|kurdu|oluşturduk|oluşturdu|kaptan)'+WE).test(tl(ctx))){
    return{opt:'B',reason:'Çevredeki kelimeler gerçek bir spor/ekip takımına işaret ediyor.'};
  }
  return{opt:'A',reason:'"birtakım" (bazı/çeşitli anlamında) bitişik yazılır.'};
}

function guessBirebir(m,text){
  const ctx=text.slice(Math.max(0,m.index-35),m.index+m[0].length+35);
  if(new RegExp(WB+'(ilaç|şifa|çözüm|tedavi|etkili|fayda)'+WE).test(tl(ctx))){
    return{opt:'B',reason:'"Birebir" (etkili/uygun anlamında) bitişik yazılır (Ör: Bu ilaç baş ağrısına birebirdir).'};
  }
  return{opt:'A',reason:'"Bire bir" (yüz yüze/karşılıklı anlamında) ayrı yazılır (Ör: Bire bir görüşme yaptı).'};
}

// ============================================================
// WARNS — Bağlama göre değişenler
// ============================================================
const WARNS=[
  {
    rx:new RegExp(WB+'(ben|sen|o|biz|siz|onlar)(da|de)'+WE,'gi'),
    rule:'Zamir + "da/de"',
    detail:'HAL EKİ (üzerinde/yanında): "bende para var" ✓\nBAĞLAÇ (de/da = dahi): "ben de geldim" ✓',
    guess:guessDeDa,
    makeOpts:m=>({
      A:{label:'Bağlaç — ayrı yaz',sub:'"'+m[1]+' '+m[2]+'"',val:m[1]+' '+m[2]},
      B:{label:'Hâl eki — olduğu gibi bırak',sub:'"'+m[0]+'" bu haliyle doğru',val:null},
    })
  },
  {
    rx:new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]{3,}(?:nda|nde|ında|inde|da|de|ta|te)) (ki)'+WE,'gi'),
    preCheck:(txt,m)=>{
      const pre=txt.slice(Math.max(0,m.index-3),m.index).trim();
      return !pre.endsWith(',')&&!pre.endsWith(';');
    },
    rule:'Hâl eki + "ki"',
    detail:'SIFAT EKİ (bitişik): "masadaki kitap" ✓\nBAĞLAÇ (virgülle ayrı): "masada, ki bu önemli" ✓',
    guess:guessKiHal,
    makeOpts:m=>({
      A:{label:'Sıfat eki — bitişik yaz',sub:'"'+m[1]+'ki"',val:m[1]+'ki'},
      B:{label:'Bağlaç — ayrı bırak',sub:'Gerekirse önüne virgül koy',val:null},
    })
  },
  {
    rx:new RegExp(WB+'iste'+WE,'gi'),
    rule:'"iste" mi, "işte" mi?',
    detail:'İŞTE (bakınız/şuracıkta): "işte orada" ✓\nEMİR KİPİ (istemek fiili): "ondan izin iste" ✓',
    guess:guessIste,
    makeOpts:m=>({
      A:{label:'"işte" — değiştir',sub:'bakınız/şuracıkta anlamı',val:'işte'},
      B:{label:'"iste" — olduğu gibi bırak',sub:'istemek fiilinin emir kipi',val:null},
    })
  },
  {
    rx:new RegExp(WB+'sadede'+WE,'gi'),
    rule:'"sadede" mi, "sade de" mi?',
    detail:'DEYİM (bitişik): "sadede gelmek/girmek" ✓\nBAĞLAÇ (ayrı): "kahve sade de olur, şekerli de" ✓',
    guess:guessSadede,
    makeOpts:m=>({
      A:{label:'"sade de" — ayrı yaz',sub:'bağlaç kullanımı',val:'sade de'},
      B:{label:'"sadede" — olduğu gibi bırak',sub:'"sadede gelmek" deyimi',val:null},
    })
  },
  {
    rx:new RegExp(WB+'unlu'+WE,'gi'),
    rule:'"unlu" mu, "ünlü" mü?',
    detail:'GERÇEK KELİME (undan yapılan): "unlu mamuller" ✓\nYANLIŞ YAZIM (meşhur anlamında): "ünlü sanatçı" ✓',
    guess:guessUnlu,
    makeOpts:m=>({
      A:{label:'"ünlü" — değiştir',sub:'meşhur anlamı',val:'ünlü'},
      B:{label:'"unlu" — olduğu gibi bırak',sub:'undan yapılan anlamı',val:null},
    })
  },
  {
    rx:new RegExp(WB+'bir'+WE+'\\s+'+WB+'takım'+WE,'gi'),
    rule:'"bir takım" mı, "birtakım" mı?',
    detail:'GERÇEK GRUP (ayrı): "bir takım kurduk" ✓\nBAZI/ÇEŞİTLİ (bitişik): "birtakım sorunlar" ✓',
    guess:guessBirTakim,
    makeOpts:m=>({
      A:{label:'"birtakım" — bitişik yaz',sub:'bazı/çeşitli anlamı',val:'birtakım'},
      B:{label:'"bir takım" — olduğu gibi bırak',sub:'gerçek bir grup/ekip anlamı',val:null},
    })
  },
  {
    rx:new RegExp(WB+'birebir'+WE,'gi'),
    rule:'"birebir" mi, "bire bir" mi?',
    detail:'ETKİLİ/UYGUN (bitişik): "Bu ilaç ağrıya birebirdir" ✓\nYÜZ YÜZE/KARŞILIKLI (ayrı): "Bire bir görüşme yaptık" ✓',
    guess:guessBirebir,
    makeOpts:m=>({
      A:{label:'"bire bir" — ayrı yaz',sub:'yüz yüze, karşılıklı anlamı',val:'bire bir'},
      B:{label:'"birebir" — bitişik bırak',sub:'etkili, deva anlamı',val:null},
    })
  }
];

function getLastVowel(w){const v=w.match(/[aeıioöuü]/gi);return v?v[v.length-1].toLowerCase():null}

function tuAll(s){return s?s.replace(/i/g,'İ').replace(/ı/g,'I').toUpperCase():s}

const PROPER_BASES=new Map([
  ['türkiye','Türkiye'],['istanbul','İstanbul'],['ankara','Ankara'],['izmir','İzmir'],
  ['bursa','Bursa'],['antalya','Antalya'],['adana','Adana'],['konya','Konya'],
  ['gaziantep','Gaziantep'],['trabzon','Trabzon'],['samsun','Samsun'],['eskişehir','Eskişehir'],
  ['diyarbakır','Diyarbakır'],['kayseri','Kayseri'],['almanya','Almanya'],['fransa','Fransa'],
  ['ingiltere','İngiltere'],['italya','İtalya'],['amerika','Amerika'],['avrupa','Avrupa'],
  ['asya','Asya'],['rusya','Rusya'],['azerbaycan','Azerbaycan'],['kıbrıs','Kıbrıs'],
  ['atatürk','Atatürk'],['türk','Türk']
]);
const TITLE_LOWER_WORDS=new Set(['ve','ile','ya','veya','da','de','ki','mi','mı','mu','mü','için','gibi','kadar']);
function convertCase(text,mode){
  if(!text) return '';
  if(mode==='lower') return tl(text);
  if(mode==='upper') return tuAll(text);
  if(mode==='title'){
    let isStart=true;
    return text.replace(/([a-zA-ZığüşöçİĞÜŞÖÇ0-9]+(?:['\u2019][a-zA-ZığüşöçİĞÜŞÖÇ0-9]+)*)|([^\wığüşöçİĞÜŞÖÇ'\u2019]+)/gu,(m,word,sep)=>{
      if(sep){
        if(/[.!?\n]/.test(sep)) isStart=true;
        return sep;
      }
      const lw=tl(word);
      const res=(!isStart&&TITLE_LOWER_WORDS.has(lw))?lw:tu(lw);
      isStart=false;
      return res;
    });
  }
  if(mode==='sentence'){
    const low=tl(text);
    let ss=true;
    let out='';
    for(let i=0;i<low.length;i++){
      const c=low[i];
      if(ss&&/[a-zığüşöç]/.test(c)){
        out+=tu(c);
        ss=false;
      } else {
        out+=c;
        if(/[.!?\n]/.test(c)){
          let isEnd=true;
          if(c==='.'){
            const pw=low.slice(0,i).match(/[\wığüşöç]+$/);
            if(pw&&ABBRS.has(pw[0])) isEnd=false;
            if(pw&&/^\d{1,3}$/.test(pw[0])) isEnd=false;
            if(/\d/.test(low[i-1])&&/\d/.test(low[i+1])) isEnd=false;
          }
          if(isEnd) ss=true;
        } else if(!/\s/.test(c)&&!/["'“‘«\(\[\{\-–—]/.test(c)) ss=false;
      }
    }
    out=out.replace(new RegExp(WB+'([a-zığüşöç]+)(?:([\'\\u2019])([a-zığüşöç]+))?'+WE,'gi'),(m,base,apo,suf)=>{
      const lb=tl(base);
      if(PROPER_BASES.has(lb)) return PROPER_BASES.get(lb)+(apo||'')+(suf||'');
      if(lb==='türkçe') return 'Türkçe'+(apo||'')+(suf||'');
      return m;
    });
    return out;
  }
  return text;
}

// ============================================================
// METİN BİÇİMLENDİRİCİ & TEMİZLEYİCİ
// ============================================================
function cleanText(text){
  if(!text) return '';
  let t=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const paragraphs=t.split(/\n{2,}/);

  const cleanedParagraphs=paragraphs.map(p=>{
    const lines=p.split('\n').map(l=>l.trim()).filter(l=>l.length>0);
    if(!lines.length) return '';

    let merged='';
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      if(i===0){
        merged=line;
      }else{
        const prev=lines[i-1];
        const isBullet=/^(?:[-*•—–]|(?:\d+|[a-zA-Z])[.)])\s+/.test(line);
        const prevEndsPunct=/[:]$/.test(prev);

        if(isBullet||prevEndsPunct){
          merged+='\n'+line;
        }else if(/[-–]\s*$/.test(prev)){
          merged=merged.replace(/[-–]\s*$/,'')+line;
        }else{
          merged+=' '+line;
        }
      }
    }
    return merged.replace(/[^\S\n]{2,}/g,' ');
  });

  return cleanedParagraphs.filter(p=>p.length>0).join('\n\n').trim();
}

function findAndReplace(text,findStr,replaceStr,all=true,targetIdx=0){
  if(!text||!findStr) return{text:text||'',count:0,replaced:0};
  const lText=tl(text);
  const lFind=tl(findStr);
  const fLen=findStr.length;
  if(!fLen||lFind.length!==fLen){
    const escRx=findStr.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const rx=new RegExp(escRx,all?'gi':'i');
    const matches=text.match(new RegExp(escRx,'gi'))||[];
    if(!matches.length) return{text,count:0,replaced:0};
    return{text:text.replace(rx,replaceStr),count:matches.length,replaced:all?matches.length:1};
  }
  let pos=0,idx=-1,count=0,replaced=0,out='';
  const tgt=Math.max(0,targetIdx||0);
  while((idx=lText.indexOf(lFind,pos))!==-1){
    const isTarget=all||(count===tgt);
    if(isTarget&&(!replaced||all)){
      out+=text.slice(pos,idx)+replaceStr;
      replaced++;
    } else {
      out+=text.slice(pos,idx+fLen);
    }
    count++;
    pos=idx+fLen;
  }
  out+=text.slice(pos);
  return{text:out,count,replaced};
}

// ============================================================
// ATEŞMAN OKUNABİLİRLİK İNDEKSİ & İSTATİSTİK HESAPLAYICI
// ============================================================
const STOP_WORDS=new Set(['bir','bu','şu','o','ve','ile','için','de','da','ki','mi','mı','mu','mü','ama','fakat','lakin','ancak','çok','daha','en','gibi','kadar','olarak','olan','oldu','olur','var','yok','ben','sen','biz','siz','onlar','ne','her','hem','ya','veya','ise','diye','sonra','önce','üzere','göre','karşı','bile','sadece','zaten','artık','yine','gene','hiç']);

function computeReadability(text){
  const clean=text.trim();
  if(!clean) return null;
  const words=clean.match(/[\wığüşöçİĞÜŞÖÇ]+(?:['\u2019][\wığüşöçİĞÜŞÖÇ]+)*/g)||[];
  const totalWords=words.length;
  if(totalWords===0) return null;

  const sentences=clean.split(/[.!?]+/).filter(s=>s.trim().length>0);
  const totalSentences=Math.max(1,sentences.length);

  const vowels=clean.match(/[aeıioöuüAEIİOÖUÜ]/g)||[];
  const totalSyllables=Math.max(1,vowels.length);

  const avgWordLength=totalSyllables/totalWords;
  const avgSentenceLength=totalWords/totalSentences;

  let score=206.835-(62.8*avgWordLength)-(3.125*avgSentenceLength);
  score=Math.max(0,Math.min(100,Math.round(score)));

  const isShort=totalWords<8;
  let label='',cls='';
  if(isShort){
    label='Kısa Metin';
    cls='score-easy';
  } else if(score>=90){label='Çok Kolay (İlkokul)';cls='score-veryeasy';}
  else if(score>=70){label='Kolay (Ortaokul)';cls='score-easy';}
  else if(score>=50){label='Orta (Lise)';cls='score-medium';}
  else if(score>=30){label='Zor (Lisans)';cls='score-hard';}
  else{label='Çok Zor (Akademik)';cls='score-veryhard';}

  const mins=Math.ceil(totalWords/200);
  const readTimeStr=totalWords<50?'< 1 dk':(mins+' dk');

  const speechMins=Math.floor(totalWords/130);
  const speechSecs=Math.round(((totalWords%130)/130)*60);
  const speechTimeStr=totalWords<15?'< 10 sn':(speechMins>0?`${speechMins} dk ${speechSecs} sn`:`${speechSecs} sn`);

  const paragraphs=clean.split(/(?:\r?\n\s*){2,}|\r?\n\s*[-*•—–]\s+|\r?\n(?=\d+\.\s+)/).filter(p=>p.trim().length>0);
  const totalParagraphs=Math.max(1,paragraphs.length);

  const noSpaceChars=clean.replace(/\s/g,'').length;
  const estPages=Math.round((noSpaceChars/1800)*10)/10;
  const estPagesStr=estPages<0.1?(noSpaceChars>0?'< 0,1 sayfa':'0 sayfa'):('~'+estPages.toLocaleString('tr-TR')+' sayfa');

  const freq=new Map();
  const uniqueSet=new Set();
  for(const w of words){
    const lw=tl(w);
    uniqueSet.add(lw);
    if(lw.length>=3&&!STOP_WORDS.has(lw)&&!/^\d+$/.test(lw)){
      freq.set(lw,(freq.get(lw)||0)+1);
    }
  }
  const uniqueWords=uniqueSet.size;
  const diversityRatio=Math.round((uniqueWords/totalWords)*100);
  const topRepeated=Array.from(freq.entries())
    .filter(([,cnt])=>cnt>=3)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5)
    .map(([word,count])=>({word,count}));

  return{
    score,isShort,label,cls,
    readTimeStr,
    speechTimeStr,
    totalWords,
    totalSentences,
    totalParagraphs,
    totalSyllables,
    noSpaceChars,
    estPagesStr,
    avgSentenceLength:Math.round(avgSentenceLength*10)/10,
    avgWordLengthSyllables:Math.round(avgWordLength*10)/10,
    uniqueWords,
    diversityRatio,
    topRepeated
  };
}

// ============================================================
// ÖN-DERLENMİŞ REGEX TABLOLARI & SAYI SES BİLGİSİ
// ============================================================
const COMPILED_SPELL=SPELL.slice().sort((a,b)=>b[0].length-a[0].length).map(([w,r])=>{
  try{return{w,r,rx:new RegExp(wb(tl(w)),'g')};}catch(e){return null;}
}).filter(Boolean);

const COMPILED_GRAM=[...DEDA,...KI].slice().sort((a,b)=>b[0].length-a[0].length).map(([w,r])=>{
  try{return{w,r,rx:new RegExp(wb(tl(w)),'g')};}catch(e){return null;}
}).filter(Boolean);

const COMPILED_WARNS=WARNS.map(wp=>({
  ...wp,
  compiledRx:new RegExp(wp.rx.source,'gi')
}));

function getNumberPhonology(numStr){
  if(/^0+$/.test(numStr)) return{back:true,hard:false};
  if(/0{6,}$/.test(numStr)) return{back:true,hard:false};
  if(/000$/.test(numStr)) return{back:false,hard:false};
  if(/00$/.test(numStr)) return{back:false,hard:false};
  if(/0$/.test(numStr)){
    const tens=numStr.slice(-2);
    switch(tens){
      case'10':return{back:true,hard:false};
      case'20':return{back:false,hard:false};
      case'30':return{back:true,hard:false};
      case'40':return{back:true,hard:true};
      case'50':return{back:false,hard:false};
      case'60':return{back:true,hard:true};
      case'70':return{back:false,hard:true};
      case'80':return{back:false,hard:false};
      case'90':return{back:true,hard:false};
    }
  }
  const last=numStr.slice(-1);
  switch(last){
    case'1':return{back:false,hard:false};
    case'2':return{back:false,hard:false};
    case'3':return{back:false,hard:true};
    case'4':return{back:false,hard:true};
    case'5':return{back:false,hard:true};
    case'6':return{back:true,hard:false};
    case'7':return{back:false,hard:false};
    case'8':return{back:false,hard:false};
    case'9':return{back:true,hard:false};
    default:return{back:false,hard:false};
  }
}

function normalizeNumberSuffix(numStr,rawSuf){
  const ph=getNumberPhonology(numStr);
  const ls=tl(rawSuf);
  if(ls==='da'||ls==='de'||ls==='ta'||ls==='te'){
    return ph.hard?(ph.back?'ta':'te'):(ph.back?'da':'de');
  }
  if(ls==='dan'||ls==='den'||ls==='tan'||ls==='ten'){
    return ph.hard?(ph.back?'tan':'ten'):(ph.back?'dan':'den');
  }
  return rawSuf;
}

// ============================================================
// ANALİZ FONKSİYONU (Tüm Motor Mantığı)
// ============================================================
function analyze(text){
  const issues=[],ranges=[];
  const ltext=tl(text);
  function ok(s,e){return!ranges.some(r=>s<r[1]&&e>r[0])}
  function push(iss){
    if(ok(iss.start,iss.end)){
      const w=iss.word||'';
      const isAllCaps=w.length>1&&w===tuAll(w)&&w!==tl(w);
      const fc=w[0];
      const isFirstCap=fc&&fc===tu(fc)&&fc!==tl(fc);
      const applyCase=v=>isAllCaps?tuAll(v):isFirstCap?tu(v):v;
      if(iss.suggestions&&iss.suggestions.length){
        iss.suggestions=iss.suggestions.map(applyCase);
      }
      if(iss.optA&&iss.optA.val){
        iss.optA={...iss.optA,val:applyCase(iss.optA.val)};
      }
      issues.push(iss);
      ranges.push([iss.start,iss.end]);
    }
  }

  // 1. Yazım hataları (Ön-derlenmiş)
  for(const{w,r,rx} of COMPILED_SPELL){
    rx.lastIndex=0;
    let m;
    while((m=rx.exec(ltext))!==null)
      push({type:'spell',word:text.slice(m.index,m.index+m[0].length),start:m.index,end:m.index+m[0].length,
        suggestions:[r],msg:'"'+w+'" yerine "'+r+'" yazılmalıdır'});
  }

  // 1b. Kelime içine sehven karışmış rakamlar (Alphanumeric Typo: örn. b8ugün -> bugün, g3l -> gel)
  {
    const digitInWordRx = /(?<![a-zA-ZığüşöçİĞÜŞÖÇ\d])([a-zA-ZığüşöçİĞÜŞÖÇ]+)(\d+)([a-zA-ZığüşöçİĞÜŞÖÇ\d]*[a-zA-ZığüşöçİĞÜŞÖÇ]+)(?![a-zA-ZığüşöçİĞÜŞÖÇ\d])/gu;
    let dm;
    while((dm = digitInWordRx.exec(text)) !== null){
      const full = dm[0];
      if(/^[a-zA-ZığüşöçİĞÜŞÖÇ]{1,2}\d+[a-zA-ZığüşöçİĞÜŞÖÇ]{1,2}$/i.test(full)) continue;
      const cleaned = full.replace(/\d+/g, '');
      if(cleaned.length < 2) continue;
      const digits = full.match(/\d+/g).join('');
      push({
        type: 'spell',
        word: full,
        start: dm.index,
        end: dm.index + full.length,
        suggestions: [cleaned],
        msg: `"${full}" kelimesinde harflerin arasına yanlışlıkla rakam (${digits}) girmiş`,
        detail: `Klavyede harf yerine sehven basılan "${digits}" rakamı ayıklandığında: "${cleaned}"`
      });
    }
  }

  // 2. Dilbilgisi hataları (de/da ve ki - Ön-derlenmiş)
  for(const{w,r,rx} of COMPILED_GRAM){
    rx.lastIndex=0;
    let m;
    while((m=rx.exec(ltext))!==null)
      push({type:'gram',word:text.slice(m.index,m.index+m[0].length),start:m.index,end:m.index+m[0].length,
        suggestions:[r],msg:'TDK: "'+w+'" → "'+r+'"'});
  }

  // 2b. Mİ soru eki ve fiil eki + "ki" bağlacı
  {
    const LOC_MI_EXC=new Set(['adamı','odamı','madamı','idamı','bademi','kıdemi','erdemi','gündemi','yöntemi','sistemi','matemi','totemi']);
    const MI_EXC=new Set(['cami','gemi','resmi','azami','umumi','ilmi','harimi','mermi','hami','sami','nami','rumi','samimi','acemi','daimi']);
    const miVerbRx=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]+(?:ıyor|iyor|uyor|üyor|ıyolar|iyolar|uyolar|üyolar|ıyorlar|iyorlar|uyorlar|üyorlar|acak|ecek|ıcak|icek|acaklar|ecekler|mış|miş|muş|müş|mışlar|mişler|muşlar|müşler|malı|meli|alım|elim|maz|mez|abilir|ebilir|saydı|seydi|sak|sek|madı|medi|madık|medik|madınız|mediniz|madılar|mediler|dık|dik|duk|dük|tık|tik|tuk|tük|dınız|diniz|dunuz|dünüz|tınız|tiniz|tunuz|tünüz|dılar|diler|dular|düler|tılar|tiler|tular|tüler)|(?:gel|git|al|ver|ol|öl|gör|kal|çık|bit|yet|yap|et|bak|at|sat|kat|yat|tut|unut|uyu|oku|anla|başla|ara|bul|duy|koy|say|seç|geç|iç|aç|kaç|uç|düş|piş|koş|kork|bık|çek|dik|dök|böl|gül|sil|bil|bin|in|sön|dön|kır|vur|kur|dur|sor|var|kız|yaz|boz|çöz|üz|gez|sez|sev|iste|bekle|dinle|izle|söyle|kazan|öğren|düşün|konuş|çalış)(?:dı|di|du|dü|tı|ti|tu|tü))(mı|mi|mu|mü)(sın|sin|sun|sün|m|ız|iz|uz|üz|nız|niz|nuz|nüz|lar|ler)?'+WE,'gi');
    let mm;
    while((mm=miVerbRx.exec(text))!==null){
      const base=mm[1],part=mm[2],suf=mm[3]||'';
      const lv=getLastVowel(base);
      if(!lv) continue;
      const correct=('aıou'.includes(lv)&&(part==='mı'||part==='mu'))||('eiöü'.includes(lv)&&(part==='mi'||part==='mü'));
      if(!correct) continue;
      push({type:'gram',word:mm[0],start:mm.index,end:mm.index+mm[0].length,
        suggestions:[base+' '+part+suf],msg:'Soru eki "'+part+'" fiilden ayrı yazılır'});
    }

    const miCopulaRx=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]{2,})(mıyım|miyim|muyum|müyüm|mısın|misin|musun|müsün|mıyız|miyiz|muyuz|müyüz|mısınız|misiniz|musunuz|müsünüz|mıydı|miydi|muydu|müydü|mıydık|miydik|muyduk|müydük|mıymış|miymiş|muymuş|müymüş|mıdır|midir|mudur|müdür)'+WE,'gi');
    while((mm=miCopulaRx.exec(text))!==null){
      const base=mm[1],part=mm[2];
      if(MI_EXC.has(tl(base))) continue;
      const lv=getLastVowel(base);
      if(!lv) continue;
      const p2=tl(part).slice(0,2);
      const correct=('aıou'.includes(lv)&&(p2==='mı'||p2==='mu'))||('eiöü'.includes(lv)&&(p2==='mi'||p2==='mü'));
      if(!correct) continue;
      push({type:'gram',word:mm[0],start:mm.index,end:mm.index+mm[0].length,
        suggestions:[base+' '+part],msg:'Soru eki "'+part+'" kelimeden ayrı yazılır'});
    }

    const miPredRx=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]{2,}(?:da|de|ta|te)|var|yok|olur|gelir|gider|yapar|eder|alır|verir|bilir|görür|kalır|çıkar|biter|yeter|sever|ister|tutar|bakar|yazar|okur|uyur|geçer|düşer|koşar|güzel|iyi|kötü|doğru|yanlış|kolay|zor|hazır|mümkün|lazım|gerekli|önemli|uygun|yeterli|kesin|ciddi|gerçek|açık|kapalı|büyük|küçük|uzak|yakın|pahalı|ucuz|erken|geç|yasak|serbest|normal|belli|memnun|mutlu|üzgün|yorgun|haklı|farklı|aynı|öyle|böyle|şöyle|bu|şu|o|ben|sen|biz|siz|onlar|hepsi|tamam|devam|gerçekten|cidden|hiç|çok|az)(mı|mi|mu|mü)'+WE,'gi');
    while((mm=miPredRx.exec(text))!==null){
      const base=mm[1],part=mm[2];
      const full=tl(mm[0]);
      if(LOC_MI_EXC.has(full)||MI_EXC.has(full)||MI_EXC.has(tl(base))) continue;
      const lv=getLastVowel(base);
      if(!lv) continue;
      const correct=('aıou'.includes(lv)&&(part==='mı'||part==='mu'))||('eiöü'.includes(lv)&&(part==='mi'||part==='mü'));
      if(!correct) continue;
      push({type:'gram',word:mm[0],start:mm.index,end:mm.index+mm[0].length,
        suggestions:[base+' '+part],msg:'Soru eki "'+part+'" kelimeden ayrı yazılır'});
    }

    const miKesmeRx=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]{2,})[\'\u2019](mı|mi|mu|mü)(sın|sin|sun|sün|m|ız|iz|uz|üz|nız|niz|nuz|nüz|lar|ler)?'+WE,'gi');
    let mkm;
    while((mkm=miKesmeRx.exec(text))!==null){
      const base=mkm[1],part=mkm[2],suf=mkm[3]||'';
      push({type:'gram',word:mkm[0],start:mkm.index,end:mkm.index+mkm[0].length,
        suggestions:[base+' '+part+suf],msg:'TDK: Soru eki "'+part+'" kesme işaretiyle ayrılmaz; kelimeden ayrı yazılır'});
    }

    const KI_OK=new Set(['sanki','oysaki','mademki','belki','halbuki','meğerki','illaki','oysakide','belkide','çünkü']);
    const kiRx=new RegExp(WB+'([\\wığüşöçİĞÜŞÖÇ]{3,})(ki)'+WE,'gi');
    while((mm=kiRx.exec(text))!==null){
      const base=mm[1];
      if(KI_OK.has(tl(mm[0]))||KI_OK.has(tl(base))) continue;
      if(/dik$|yor$|acak$|ecek$|miş$|mış$|muş$|müş$|malı$|meli$|sa$|se$|sun$|sin$|lar$|ler$|dı$|di$|du$|dü$|tı$|ti$|tu$|tü$/.test(tl(base))){
        push({type:'gram',word:mm[0],start:mm.index,end:mm.index+mm[0].length,
          suggestions:[base+' '+mm[2]],msg:'Bağlaç olan "ki" fiilden ayrı yazılır'});
      }
    }
  }

  // 2c. Fiil / Ek-fiil ve Şart kipi sonrası bağlaç "de/da" (-te/-ta değil, ayrı de/da)
  {
    const DEDA_VERB_EXC=new Set([
      'geçmişte','geçmişten','yemişte','sadede','aside','kasede','kesede',
      'elmalıda','kıymalıda','hurmalıda','sarmalıda','asmalıda','kreigde',
      'masada','kasada','yasada','anayasada','tasada','pasada','borsada','arsada','kısada',
      'bursada','manisada','pırasada','yarasada','asada','lisede','kilisede','hissede',
      'cüssede','ensede','korsede','kimsede','elbisede','hadisede','vesvesede','medresede',
      'mukayesede','müessesede','insanda','lisanda','nisanda','ihsanda','korsanda','tavşanda',
      'eksende','desende','yasakta','kuşakta','kavşakta','başakta','uşakta','döşekte',
      'fişekte','eşekte','şimşekte','dirsekte','yüksekte','tümsekte','gerçekte','mercekte',
      'ölçekte','çiçekte','böcekte','kapsamda','susamda','masalarda','kasalarda','yasalarda',
      'borsalarda','arsalarda','liselerde','kiliselerde','kaselerde','hisselerde','elbiselerde','hadiselerde',
      'komedi','komedide','trajedide','melodide','parodide','kedi','kedide','çatı','çatıda','kutu','kutuda',
      'ordu','orduda','ütü','ütüde','cadı','cadıda','kadı','kadıda','vadi','vadide','cami','camide','yalı','yalıda','çalı','çalıda','halı','halıda'
    ]);

    function pushVerbDeda(full,base,rawSuf,index,ruleTitle,customMsg,customDetail){
      const suf=tl(rawSuf);
      const lv=getLastVowel(base);
      const isBack=lv&&'aıou'.includes(lv);
      const correctSuffix=isBack?'da':'de';
      const isHardened=(suf==='te'||suf==='ta');
      let msg=customMsg,detail=customDetail;
      if(isHardened){
        msg=`TDK: Bağlaç olan "de/da" sertleşip "-te/-ta" olmaz; ayrı "${correctSuffix}" yazılmalıdır`;
        detail=`Türkçede bağlaç olan "de/da" ünsüz benzeşmesine (sertleşmeye) uğramaz; "-${suf}" değil ayrı "${correctSuffix}" olmalıdır. (Örn: "${base} ${correctSuffix}")`;
      }
      push({
        type:'gram',
        word:full,
        start:index,
        end:index+full.length,
        suggestions:[base+' '+correctSuffix],
        msg:msg,
        detail:detail,
        rule:ruleTitle
      });
    }

    const dedaVerbRx=/(?<![a-zA-ZığüşöçİĞÜŞÖÇ\d])([a-zA-ZığüşöçİĞÜŞÖÇ]{2,}(?:miş|mış|muş|müş|miştir|mıştır|muştur|müştür|mişti|mıştı|müştü|muştu|seydi|saydı|seydik|saydık|seymiş|saymış|ıyor|iyor|uyor|üyor|ıyorum|iyorum|uyorum|üyorum|ıyorsun|iyorsun|uyorsun|üyorsun|ıyoruz|iyoruz|uyoruz|üyoruz|ıyorsunuz|iyorsunuz|uyorsunuz|üyorsunuz|ıyorlar|iyorlar|uyorlar|üyorlar|ıyordu|iyordu|uyordu|üyordu|ayım|eyim|alım|elim|malı|meli|malıyım|meliyim|malısın|melisin|malıyız|meliyiz|dılar|diler|dular|düler|tılar|tiler|tular|tüler|acaktı|ecekti|yacaktı|yecekti|acaktım|ecektim|acaktın|ecektin|acaktık|ecektik|acaktınız|ecektiniz|acaktılar|ecektiler|ardı|erdi|ırdı|irdi|urdu|ürdü|ardım|erdim|ırdım|irdim|urdum|ürdüm|ardın|erdin|ırdın|irdin|urdun|ürdün|ardık|erdik|ırdık|irdik|urduk|ürdük|ardılar|erdiler|ırdılar|irdiler|urdular|ürdüler|mazdı|mezdi|mazdım|mezdim|mazdın|mezdin|mazdık|mezdik|mazdılar|mezdiler|malıydı|meliydi|malıydım|meliydim|malıydık|meliydik|saydı|seydi|saydım|seydim|saydık|seydik|saydılar|seydiler))(te|ta|de|da)(?![a-zA-ZığüşöçİĞÜŞÖÇ\d])/gi;
    let vm;
    while((vm=dedaVerbRx.exec(text))!==null){
      const full=vm[0],base=vm[1],suf=vm[2];
      if(DEDA_VERB_EXC.has(tl(full))||DEDA_VERB_EXC.has(tl(base))) continue;
      const lv=getLastVowel(base);
      const correctSuffix=(lv&&'aıou'.includes(lv))?'da':'de';
      pushVerbDeda(
        full,base,suf,vm.index,
        'Bağlaç olan "de/da" kuralı (-te/-ta değil, ayrı de/da)',
        'TDK: Bağlaç olan "de/da" fiil ve ek-fiilden sonra ayrı yazılır',
        `Fiil veya ek-fiil üzerine gelen "de/da" bağlaçtır ve her zaman ayrı yazılır. (Örn: "${base} ${correctSuffix}")`
      );
    }

    // Olumsuz geçmiş zaman kipi (-madı/-medi + şahıs + de/da: gelmedide -> gelmedi de, yapmadıda -> yapmadı da)
    const negPastVerbRx=/(?<![a-zA-ZığüşöçİĞÜŞÖÇ\d])([a-zA-ZığüşöçİĞÜŞÖÇ]{2,}(?:madı|medi|madım|medim|madın|medin|madık|medik|madınız|mediniz|madılar|mediler))(te|ta|de|da)(?![a-zA-ZığüşöçİĞÜŞÖÇ\d])/gi;
    while((vm=negPastVerbRx.exec(text))!==null){
      const full=vm[0],base=vm[1],suf=vm[2];
      if(DEDA_VERB_EXC.has(tl(full))||DEDA_VERB_EXC.has(tl(base))) continue;
      const lv=getLastVowel(base);
      const correctSuffix=(lv&&'aıou'.includes(lv))?'da':'de';
      pushVerbDeda(
        full,base,suf,vm.index,
        'Geçmiş zaman fiili ve bağlaç olan "de/da"',
        'TDK: Fiilden sonra gelen "de/da" bağlaçtır ve ayrı yazılır',
        `Olumsuz geçmiş zaman fiilinden sonra gelen "de/da" bağlaçtır; ayrı yazılmalıdır. (Örn: "${base} ${correctSuffix}")`
      );
    }

    // Belirli geçmiş zaman fiilleri (gittide -> gitti de, geldide -> geldi de, yaptıda -> yaptı da, gittikte -> gittik de vb.)
    const pastVerbRx=/(?<![a-zA-ZığüşöçİĞÜŞÖÇ\d])((?:ol|gel|git|yap|et|bil|gör|al|ver|kal|bak|dur|sev|duy|çalış|iste|söyle|konuş|yaz|oku|anla|bul|çık|in|gir|de|ye|tut|at|sat|yat|kat|bat|bit|yet|geç|seç|iç|aç|kaç|koş|düş|öl|gül|böl|sil|bin|kır|vur|sor|otur|uyu|başla|bekle|izle|dinle|anlat|unut|kazan|kaybet|inan|kullan|katıl|yapıl|edil|bilin|görün|düşün|duyul|sağla|öğren|gönder|getir|götür|bırak)(?:dı|di|du|dü|tı|ti|tu|tü|dım|dim|dum|düm|tım|tim|tum|tüm|dın|din|dun|dün|tın|tin|tun|tün|dık|dik|duk|dük|tık|tik|tuk|tük|dınız|diniz|dunuz|dünüz|tınız|tiniz|tunuz|tünüz))(te|ta|de|da)(?![a-zA-ZığüşöçİĞÜŞÖÇ\d])/gi;
    while((vm=pastVerbRx.exec(text))!==null){
      const full=vm[0],base=vm[1],suf=vm[2];
      if(DEDA_VERB_EXC.has(tl(full))||DEDA_VERB_EXC.has(tl(base))) continue;
      const lv=getLastVowel(base);
      const correctSuffix=(lv&&'aıou'.includes(lv))?'da':'de';
      pushVerbDeda(
        full,base,suf,vm.index,
        'Geçmiş zaman fiili ve bağlaç olan "de/da"',
        'TDK: Fiilden sonra gelen "de/da" bağlaçtır ve ayrı yazılır',
        `Geçmiş zaman fiilinden sonra gelen "de/da" bağlaçtır; ayrı yazılmalıdır. (Örn: "${base} ${correctSuffix}")`
      );
    }

    // Olumsuz şart kipi (-masa/-mese + şahıs + de/da: olmasada -> olmasa da, gelmesede -> gelmese de)
    const negCondRx=/(?<![a-zA-ZığüşöçİĞÜŞÖÇ\d])([a-zA-ZığüşöçİĞÜŞÖÇ]{2,}(?:masa|mese|masam|mesem|masan|mesen|masak|mesek|masanız|meseniz|masalar|meseler))(de|da|te|ta)(?![a-zA-ZığüşöçİĞÜŞÖÇ\d])/gi;
    while((vm=negCondRx.exec(text))!==null){
      const full=vm[0],base=vm[1],suf=vm[2];
      if(DEDA_VERB_EXC.has(tl(full))||DEDA_VERB_EXC.has(tl(base))) continue;
      const lv=getLastVowel(base);
      const correctSuffix=(lv&&'aıou'.includes(lv))?'da':'de';
      pushVerbDeda(
        full,base,suf,vm.index,
        'Şart kipi (-masa/-mese) ve bağlaç olan "de/da"',
        'TDK: Şart ekinden sonra gelen "de/da" bağlaçtır ve ayrı yazılır',
        `Olumsuz şart kipi (-masa/-mese) üzerine gelen "de/da" bağlaçtır; bitişik yazılamaz, ayrı yazılmalıdır. (Örn: "${base} ${correctSuffix}")`
      );
    }

    // Birleşik şart kipleri (-dıysa/-diyse, -mışsa/-mişse, -arsa/-erse/-ırsa/-irse/-ursa/-ürse, -mazsa/-mezse, -abilse/-ebilse, -ysa/-yse)
    const compCondRx=/(?<![a-zA-ZığüşöçİĞÜŞÖÇ\d])([a-zA-ZığüşöçİĞÜŞÖÇ]{2,}(?:dıysa|diyse|duysa|düyse|tıysa|tiyse|tuysa|tüyse|mışsa|mişse|muşsa|müşse|acaksa|ecekse|ıyorsa|iyorsa|uyorsa|üyorsa|mazsa|mezse|abilse|ebilse|abilirse|ebilirse|arsa|erse|ırsa|irse|ursa|ürse|ysa|yse)(?:m|n|k|nız|niz|lar|ler)?)(de|da|te|ta)(?![a-zA-ZığüşöçİĞÜŞÖÇ\d])/gi;
    while((vm=compCondRx.exec(text))!==null){
      const full=vm[0],base=vm[1],suf=vm[2];
      if(DEDA_VERB_EXC.has(tl(full))||DEDA_VERB_EXC.has(tl(base))) continue;
      const lv=getLastVowel(base);
      const correctSuffix=(lv&&'aıou'.includes(lv))?'da':'de';
      pushVerbDeda(
        full,base,suf,vm.index,
        'Şart kipi ve bağlaç olan "de/da"',
        'TDK: Şart ekinden sonra gelen "de/da" bağlaçtır ve ayrı yazılır',
        `Şart kipi (-sa/-se) üzerine gelen "de/da" bağlaçtır; bitişik yazılamaz, ayrı yazılmalıdır. (Örn: "${base} ${correctSuffix}")`
      );
    }

    // Basit şart kipi (olsada -> olsa da, gelsede -> gelse de, olsakta -> olsak da vb.)
    const condVerbRx=/(?<![a-zA-ZığüşöçİĞÜŞÖÇ\d])([a-zA-ZığüşöçİĞÜŞÖÇ]*(?:ol|gel|git|yap|et|bil|gör|al|ver|kal|bak|dur|sev|duy|çalış|iste|söyle|konuş|yaz|oku|anla|bul|çık|in|gir|de|ye|tut|at|sat|yat|kat|bat|bit|yet|değ|geç|seç|iç|aç|kaç|koş|düş|öl|gül|böl|sil|bin|kır|vur|sor|otur|uyu|başla|bekle|izle|dinle|anlat|unut|kazan|kaybet|inan|kullan|katıl|yapıl|edil|bilin|görün|düşün|var|yok)(?:sa|se|sam|sem|san|sen|sak|sek|sanız|seniz|salar|seler))(de|da|te|ta)(?![a-zA-ZığüşöçİĞÜŞÖÇ\d])/gi;
    while((vm=condVerbRx.exec(text))!==null){
      const full=vm[0],base=vm[1],suf=vm[2];
      if(DEDA_VERB_EXC.has(tl(full))||DEDA_VERB_EXC.has(tl(base))) continue;
      const lv=getLastVowel(base);
      const correctSuffix=(lv&&'aıou'.includes(lv))?'da':'de';
      pushVerbDeda(
        full,base,suf,vm.index,
        'Şart kipi ve bağlaç olan "de/da"',
        'TDK: Şart ekinden sonra gelen "de/da" bağlaçtır ve ayrı yazılır',
        `Şart kipi (-sa/-se) üzerine gelen "de/da" bağlaçtır; bitişik yazılamaz, ayrı yazılmalıdır. (Örn: "${base} ${correctSuffix}")`
      );
    }
  }

  // 2d. Belirtme hâli ve iyelik ekleri sonrası bağlaç "de/da"
  {
    const ACC_DEDA_EXC=new Set(['çinide','sinide','dinide','sunuda','umuda']);
    const accDedaRx=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]+?(?:[ıi]n[ıi]z[ıi]|[uü]n[uü]z[uü]|m[ıi]z[ıi]|m[uü]z[uü]|larını|lerini|[ıi]n[ıi]|[uü]n[uü]|[bcçdfgğhjklmnprsştvyz](?:ımı|imi|umu|ümü)))(da|de)'+WE,'gi');
    let am;
    while((am=accDedaRx.exec(text))!==null){
      const full=am[0];
      const base=am[1];
      const lfull=tl(full);
      const lbase=tl(base);
      if(ACC_DEDA_EXC.has(lfull)||ACC_DEDA_EXC.has(lbase)) continue;

      const lv=getLastVowel(base);
      const isBack=lv&&'aıou'.includes(lv);
      const correctSuffix=isBack?'da':'de';

      push({
        type:'gram',
        word:full,
        start:am.index,
        end:am.index+full.length,
        suggestions:[base+' '+correctSuffix],
        msg:`TDK: Belirtme hâlinden sonra gelen "de/da" bağlaçtır ve ayrı yazılır`,
        detail:`İsmin belirtme hâli (-ı/-i/-u/-ü) üzerine ikinci bir hâl eki gelemez; buradaki "de/da" bağlaçtır ve ayrı yazılmalıdır. (Örn: "${base} ${correctSuffix}")`,
        rule:'Belirtme eki ve bağlaç olan "de/da"'
      });
    }
  }

  // 2e. Şahıs zamiri + bağlaç olan "de/da" (yüklem/fiil şahısla uyuşuyorsa kesin bağlaçtır)
  {
    const pronDedaRx = new RegExp(WB + '(ben|sen|biz|siz|onlar)(da|de)' + WE, 'gi');
    let pdm;
    while((pdm = pronDedaRx.exec(text)) !== null) {
      if(!ok(pdm.index, pdm.index + pdm[0].length)) continue;
      const pron = tl(pdm[1]);
      const suf = pdm[2];
      const after = text.slice(pdm.index + pdm[0].length);
      const clause = (after.match(/^[^.!?;\n]*/)||[''])[0];

      // Eğer cümlede var/yok varsa veya hâl eki bağlamıysa kesin bağlaç sayma (WARNS devralacak)
      if(/(^|[^\wığüşöçİĞÜŞÖÇ])(var|yok)([^\wığüşöçİĞÜŞÖÇ]|$)/i.test(clause)) continue;

      const words = clause.trim().split(/\s+/).filter(Boolean);
      if(!words.length) continue;

      let matchedVerb = null;
      for(let i = 0; i < Math.min(words.length, 3); i++) {
        const cw = words[i].replace(/[.,;:!?]+$/, '');
        if(personAgrees(pron, cw)) {
          matchedVerb = cw;
          break;
        }
      }
      if(!matchedVerb && words.length > 3) {
        const lastW = words[words.length - 1].replace(/[.,;:!?]+$/, '');
        if(personAgrees(pron, lastW)) {
          matchedVerb = lastW;
        }
      }

      if(matchedVerb) {
        push({
          type: 'gram',
          word: pdm[0],
          start: pdm.index,
          end: pdm.index + pdm[0].length,
          suggestions: [pdm[1] + ' ' + suf],
          msg: `TDK: Bağlaç olan "de/da" zamirden ayrı yazılır ("${pdm[1]} ${suf}")`,
          detail: `Cümledeki "${matchedVerb}" yüklemi "${pdm[1]}" şahsı ile çekimli olduğundan buradaki "${suf}" bulunma hâli değil bağlaçtır; ayrı yazılmalıdır.`,
          rule: 'Zamir ve bağlaç olan "de/da"'
        });
      }
    }
  }

  // 3. Tekrarlanan Mükerrer Kelimeler
  {
    const repRx=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]{2,})\\s+\\1'+WE,'gi');
    let rm;
    const REP_EXC=new Set(['ağır','kara','yavaş','tatlı','güzel','iyi','kötü','derin','uzun','kısa','sarı','yeşil','mavi','ılık','tık','şak','çıt','bire','için','adım','göz','bir','yıl','gün','deste','avuç','tek','az','çok','hızlı','serin','sıcak','soğuk','erken','geç','tane','kat','ara','dizi','yudum','parça','damla','koşa','seve','gide','bile','yana','başa']);
    while((rm=repRx.exec(text))!==null){
      const word=tl(rm[1]);
      if(!REP_EXC.has(word)){
        push({type:'suggest',word:rm[0],start:rm.index,end:rm.index+rm[0].length,
          suggestions:[rm[1]],msg:'Mükerrer (arka arkaya tekrarlanan) kelime: "'+rm[1]+'"'});
      }
    }
  }

  // 4. Uyarı gerektiren durumlar (WARNS - Ön-derlenmiş, Türkçe ltext eşleşmesi)
  const warnTarget=ltext.length===text.length?ltext:text;
  for(const wp of COMPILED_WARNS){
    const rx=wp.compiledRx;
    rx.lastIndex=0;
    let m;
    while((m=rx.exec(warnTarget))!==null){
      if(!ok(m.index,m.index+m[0].length)) continue;
      const origWord=text.slice(m.index,m.index+m[0].length);
      const origM=[
        origWord,
        m[1]!==undefined?origWord.slice(0,m[1].length):undefined,
        m[2]!==undefined?origWord.slice(origWord.length-m[2].length):undefined
      ];
      origM.index=m.index;
      if(wp.preCheck&&!wp.preCheck(text,origM)) continue;
      const opts=wp.makeOpts(origM);
      const guess=wp.guess?wp.guess(origM,text):null;
      push({type:'warn',word:origWord,start:m.index,end:m.index+origWord.length,
        suggestions:opts.A.val?[opts.A.val]:[],
        optA:opts.A,optB:opts.B,rule:wp.rule,detail:wp.detail,guess:guess,
        msg:'Bağlama göre değişir — kontrol edin'});
    }
  }

  // 5. Noktalama Hataları
  // Yan yana iki nokta (..) veya fazla nokta (....+)
  {
    const multiDotRx = /(?<!\.)\.{2,}(?!\.)/g;
    let mdm;
    while((mdm = multiDotRx.exec(text)) !== null) {
      const dots = mdm[0];
      const start = mdm.index;
      const end = start + dots.length;
      if(!ok(start, end)) continue;

      const afterChar = text[end];
      const isTwo = dots.length === 2;
      const isMoreThanThree = dots.length >= 4;

      if(isTwo) {
        const needsSpace = afterChar && /[A-ZİĞÜŞÖÇa-zığüşöç]/.test(afterChar);
        const sug = needsSpace ? '. ' : '.';
        push({
          type: 'punct',
          word: dots,
          start: start,
          end: end,
          suggestions: [sug],
          msg: 'Türkçede yan yana iki nokta ("..") kullanılmaz; tek nokta (".") olmalıdır',
          detail: 'TDK noktalama kurallarında ".." şeklinde bir işaret yoktur. Cümle bitimi için tek nokta (".") kullanılmalıdır.'
        });
      } else if(isMoreThanThree) {
        const needsSpace = afterChar && /[A-ZİĞÜŞÖÇa-zığüşöç]/.test(afterChar);
        const sug = needsSpace ? '... ' : '...';
        push({
          type: 'punct',
          word: dots,
          start: start,
          end: end,
          suggestions: [sug],
          msg: `Üç nokta yerine ${dots.length} nokta konulmuş; "..." olmalıdır`,
          detail: 'TDK kuralına göre eksiltili cümlelerde 3 nokta kullanılır; 4 veya daha fazla nokta kullanılmaz.'
        });
      }
    }

    const multiCommaRx = /(?<!,),{2,}(?!,)/g;
    let mcm;
    while((mcm = multiCommaRx.exec(text)) !== null) {
      const commas = mcm[0];
      const start = mcm.index;
      const end = start + commas.length;
      if(!ok(start, end)) continue;
      const afterChar = text[end];
      const needsSpace = afterChar && /[A-ZİĞÜŞÖÇa-zığüşöç]/.test(afterChar);
      push({
        type: 'punct',
        word: commas,
        start: start,
        end: end,
        suggestions: [needsSpace ? ', ' : ','],
        msg: 'Gereksiz birden fazla virgül kullanımı',
        detail: 'Yan yana birden fazla virgül kullanılmaz; tek virgül (",") olmalıdır.'
      });
    }
  }

  let m;
  const r1=/,(?=[^ \n\r"'»)\].,;!?\u2019\d])/g;
  while((m=r1.exec(text))!==null)
    push({type:'punct',word:',',start:m.index,end:m.index+1,
      suggestions:[', '],msg:'Virgülden sonra boşluk bırakılmalıdır'});

  const r2=/\.(?=[A-ZİĞÜŞÖÇa-zığüşöç])/g;
  while((m=r2.exec(text))!==null){
    const prevChar=text[m.index-1];
    const nextChar=text[m.index+1];
    if(/\d/.test(prevChar)&&/\d/.test(nextChar)) continue;
    const prevWord=text.slice(0,m.index).match(/[\wığüşöçİĞÜŞÖÇ]+$/);
    const nextWord=text.slice(m.index+1).match(/^[\wığüşöçİĞÜŞÖÇ]+/);
    if(prevWord&&nextWord){
      const nw=tl(nextWord[0]);
      if(/^(com|org|net|edu|gov|tr|io|dev|html|js|css|txt|md|pdf|png|jpg|svg)$/.test(nw)) continue;
    }
    push({type:'punct',word:'.',start:m.index,end:m.index+1,
      suggestions:['. '],msg:'Noktadan sonra boşluk bırakılmalıdır'});
  }

  const r3=/[?!](?=[A-ZİĞÜŞÖÇa-zığüşöç])/g;
  while((m=r3.exec(text))!==null)
    push({type:'punct',word:text[m.index],start:m.index,end:m.index+1,
      suggestions:[text[m.index]+' '],msg:'Noktalama işaretinden sonra boşluk bırakılmalıdır'});

  const r4=/[ \t]+([,;:.!?])/g;
  while((m=r4.exec(text))!==null){
    if((m[1]===':'||m[1]===';')&&/^[-~]?[)(DPpOo\/\\]/.test(text.slice(m.index+m[0].length))) continue;
    push({type:'punct',word:m[0],start:m.index,end:m.index+m[0].length,
      suggestions:[m[1]],msg:'Noktalama işaretinden önce boşluk olmamalıdır'});
  }

  const r5=/[^\S\n]{2,}/g;
  while((m=r5.exec(text))!==null)
    push({type:'punct',word:m[0],start:m.index,end:m.index+m[0].length,
      suggestions:[' '],msg:'Gereksiz fazla boşluk'});

  // Yığın (stack) tabanlı parantez ve köşeli parantez eşleştirme denetimi
  {
    const parenStack=[];
    const closeToOpen={')':'(',']':'['};
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(ch==='('||ch==='['){
        if(ch==='('&&(
          (i>0&&(text[i-1]===':'||text[i-1]===';'||text[i-1]==='='))||
          (i>1&&text[i-1]==='-'&&(text[i-2]===':'||text[i-2]===';'||text[i-2]==='='))
        )){
          continue;
        }
        parenStack.push({ch,index:i});
      } else if(ch===')'||ch===']'){
        if(ch===')'&&(
          (i>0&&(text[i-1]===':'||text[i-1]===';'||text[i-1]==='='))||
          (i>1&&text[i-1]==='-'&&(text[i-2]===':'||text[i-2]===';'||text[i-2]==='='))
        )){
          continue;
        }
        const expectedOpen=closeToOpen[ch];
        let matchedIdx=-1;
        for(let j=parenStack.length-1;j>=0;j--){
          if(parenStack[j].ch===expectedOpen){matchedIdx=j;break;}
        }
        if(matchedIdx!==-1){
          parenStack.splice(matchedIdx,1);
        } else if(ok(i,i+1)){
          push({type:'punct',word:ch,start:i,end:i+1,suggestions:[''],
            msg:`Açılmamış kapanış parantezi "${ch}" tespit edildi`});
        }
      }
    }
    for(const item of parenStack){
      if(ok(item.index,item.index+1)){
        push({type:'punct',word:item.ch,start:item.index,end:item.index+1,suggestions:[''],
          msg:`Kapatılmamış açılış parantezi "${item.ch}" tespit edildi`});
      }
    }
  }

  // İkilemeler arasına noktalama işareti konmaz (virgül veya kısa çizgi) (TDK İmla)
  const ikilemePunct=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]{3,})\\s*([,-])\\s*\\1'+WE,'gi');
  let ipm;
  while((ipm=ikilemePunct.exec(text))!==null){
    const isHyphen=ipm[2]==='-';
    push({type:'punct',word:ipm[0],start:ipm.index,end:ipm.index+ipm[0].length,
      suggestions:[ipm[1]+' '+ipm[1]],msg:`TDK: İkilemeler arasına ${isHyphen?'kısa çizgi':'virgül'} konmaz ("${ipm[1]} ${ipm[1]}")`});
  }

  // Eş görevli kalıp ve sıralı cümle virgül denetimleri (TDK Noktalama)
  {
    // 1) "bilmem ne X şöyle Y böyle Z" veya "şöyle X böyle Y" eş görevli kelime grupları
    const soyleBoyle3Rx=new RegExp(WB+'(bilmem\\s+ne\\s+[a-zA-ZığüşöçİĞÜŞÖÇ]+)\\s+(şöyle\\s+[a-zA-ZığüşöçİĞÜŞÖÇ]+)\\s+(böyle\\s+[a-zA-ZığüşöçİĞÜŞÖÇ]+)'+WE,'gi');
    let sbm;
    while((sbm=soyleBoyle3Rx.exec(text))!==null){
      push({
        type:'punct',
        word:sbm[0],
        start:sbm.index,
        end:sbm.index+sbm[0].length,
        suggestions:[`${sbm[1]}, ${sbm[2]}, ${sbm[3]}`],
        msg:'TDK: Eş görevli kelime grupları arasına virgül konmalıdır',
        detail:`Eş görevli sıfat/zarf öbekleri ("${sbm[1]}, ${sbm[2]}, ${sbm[3]}") virgülle ayrılır.`
      });
    }

    const soyleBoyle2Rx=new RegExp(WB+'(şöyle\\s+[a-zA-ZığüşöçİĞÜŞÖÇ]+)\\s+(böyle\\s+[a-zA-ZığüşöçİĞÜŞÖÇ]+)'+WE,'gi');
    while((sbm=soyleBoyle2Rx.exec(text))!==null){
      push({
        type:'punct',
        word:sbm[0],
        start:sbm.index,
        end:sbm.index+sbm[0].length,
        suggestions:[`${sbm[1]}, ${sbm[2]}`],
        msg:'TDK: Eş görevli kelime grupları arasına virgül konmalıdır',
        detail:`Eş görevli kelime grupları ("${sbm[1]}, ${sbm[2]}") virgülle ayrılır.`
      });
    }

    // 2) Sıralı cümlede "değil" yükleminden sonra virgül ("öyle çok iyi değil yoklukta..." -> "öyle çok iyi değil, yoklukta...")
    const DEGIL_NEXT_EXC=new Set(['ama','fakat','lakin','ancak','yalnız','oysa','oysaki','halbuki','çünkü','zira','ki','de','da','mi','mı','mu','mü','midir','mıdır','mudur','müdür','miydi','mıydı','muydu','müydü','ve','veya','ya','yahut','bile','dahi','gibi','kadar','için','üzere','olarak','diye','ise','tabii','elbette','zaten','hani','işte','artık']);
    const degilClauseRx=new RegExp(WB+'((?:çok|pek|hiç|fazla|gayet|öyle|o\\s+kadar)\\s+[a-zA-ZığüşöçİĞÜŞÖÇ]+\\s+değil)\\s+([a-zA-ZığüşöçİĞÜŞÖÇ]{3,})'+WE,'gi');
    let dcm;
    while((dcm=degilClauseRx.exec(text))!==null){
      const nextW=tl(dcm[2]);
      if(DEGIL_NEXT_EXC.has(nextW)) continue;
      const beforeText=tl(text.slice(Math.max(0,dcm.index-25),dcm.index));
      if(new RegExp(WB+'(sadece|yalnız|yalnızca|tek)'+WE).test(beforeText)) continue;
      push({
        type:'punct',
        word:dcm[0],
        start:dcm.index,
        end:dcm.index+dcm[0].length,
        suggestions:[`${dcm[1]}, ${dcm[2]}`],
        msg:'TDK: Sıralı cümleleri birbirinden ayırmak için yüklemden ("değil") sonra virgül konur',
        detail:`"${dcm[1]}" yargısından sonra yeni bir cümleye geçildiği için araya virgül konulmalıdır.`
      });
    }

    // 3) Ardışık eş görevli "-lıkta/-likte/-lukta/-lükte" veya "-lıktan/-likten/-luktan/-lükten" kelimeleri arasına virgül ("yoklukta üşengeçlikte" -> "yoklukta, üşengeçlikte")
    const coordLocRx=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]{2,}l(?:ı|i|u|ü)k(?:ta|te|tan|ten))\\s+([a-zA-ZığüşöçİĞÜŞÖÇ]{2,}l(?:ı|i|u|ü)k(?:ta|te|tan|ten))'+WE,'gi');
    let clm;
    while((clm=coordLocRx.exec(text))!==null){
      if(tl(clm[1])===tl(clm[2])) continue;
      push({
        type:'punct',
        word:clm[0],
        start:clm.index,
        end:clm.index+clm[0].length,
        suggestions:[`${clm[1]}, ${clm[2]}`],
        msg:'TDK: Eş görevli kelimeler arasına virgül konmalıdır',
        detail:`Aynı görevde ardışık kullanılan "${clm[1]}" ve "${clm[2]}" kelimeleri virgülle ayrılmalıdır.`
      });
    }

    // 4) TDK Noktalama: Bağlaçlardan, şart ekinden (-sa/-se) ve tek zarf-fiilden sonra virgül konmaz
    const baglacVirgulRx=new RegExp(WB+'(ve|veya|yahut|ya\\s+da|çünkü|fakat|lakin|oysaki|halbuki|meğerki|zira)\\s*,(\\s*)','gi');
    let bvm;
    while((bvm=baglacVirgulRx.exec(text))!==null){
      const conj=bvm[1];
      const atEnd=(bvm.index+bvm[0].length>=text.length);
      const sugWord=atEnd?conj:(conj+' ');
      push({
        type:'punct',
        word:bvm[0],
        start:bvm.index,
        end:bvm.index+bvm[0].length,
        suggestions:[sugWord],
        msg:`TDK: "${conj}" bağlacından sonra virgül konmaz`,
        detail:'Metin içinde bağlaçlardan önce ve sonra virgül konulmaz.'
      });
    }

    const SART_EXCLUSIONS=new Set(['kısa','lise','kilise','elbise','ense','şase','terse']);
    const ZARF_EXCLUSIONS=new Set([
      'maden','beden','çorap','kasap','kitap','sebep','talep','takip','kulüp','üslup','tarip',
      'sahip','rakip','nasip','garip','cazip','mektup','klip','kutup','grup','tabip','katip','tertip','tahrip',
      'börek','çörek','kürek','direk','engerek','tarak'
    ]);
    const sartZarfVirgulRx=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]{3,}(?:sa|se|ıp|ip|up|üp|arak|erek|madan|meden|dıkça|dikçe|dukça|dükçe|tıkça|tikçe|tukça|tükçe))\\s*,\\s*([a-zA-ZığüşöçİĞÜŞÖÇ]{2,})'+WE,'gi');
    let szm;
    while((szm=sartZarfVirgulRx.exec(text))!==null){
      const w1=szm[1],w2=szm[2];
      const lw1=tl(w1);
      const isSart=/(?:sa|se)$/.test(lw1)&&!/(?:masa|kasa|arsa|bursa|manisa|tasa|yasa)$/.test(lw1)&&!SART_EXCLUSIONS.has(lw1);
      const isZarf=/(?:ıp|ip|up|üp|arak|erek|madan|meden|dıkça|dikçe|dukça|dükçe|tıkça|tikçe|tukça|tükçe)$/.test(lw1)&&!ZARF_EXCLUSIONS.has(lw1);
      if(isSart||isZarf){
        const ekTipi=isSart?'şart ekinden (-sa/-se)':'zarf-fiil ekinden';
        push({
          type:'punct',
          word:szm[0],
          start:szm.index,
          end:szm.index+szm[0].length,
          suggestions:[`${w1} ${w2}`],
          msg:`TDK: Metinde ardışık sıralanmayan ${ekTipi} sonra virgül konmaz`,
          detail:`"${w1}" sonrasındaki gereksiz virgül kaldırılmalıdır.`
        });
      }
    }
  }

  // Sayı sonrası ünsüz sertleşmesi ve ünlü uyumu (3'de -> 3'te, 1985'de -> 1985'te, 60'de -> 60'ta, 40'dan -> 40'tan)
  const sertSayiRx=new RegExp(WB+'(\\d+)[\'\\u2019](de|da|te|ta|den|dan|ten|tan)'+WE,'gi');
  let ssm;
  while((ssm=sertSayiRx.exec(text))!==null){
    const numStr=ssm[1];
    const curEk=tl(ssm[2]);
    const dogruEk=normalizeNumberSuffix(numStr,curEk);
    if(dogruEk!==curEk){
      push({type:'gram',word:ssm[0],start:ssm.index,end:ssm.index+ssm[0].length,
        suggestions:[numStr+"'"+dogruEk],msg:'TDK İmla: Sayı okunuşu ve ünsüz benzeşmesi kuralı gereği "'+dogruEk+'" olmalıdır'});
    }
  }

  // Belirli tarih bildiren ay adları büyük harfle başlar (29 ekim -> 29 Ekim, 29 ekim'de -> 29 Ekim'de)
  const tarihAyRx=new RegExp(WB+'(\\d{1,2})\\s+(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)(?![\\wığüşöçİĞÜŞÖÇ])','gi');
  let tam;
  while((tam=tarihAyRx.exec(text))!==null){
    const buyukAy=tu(tam[2]);
    if(buyukAy!==tam[2]){
      push({type:'suggest',word:tam[0],start:tam.index,end:tam.index+tam[0].length,
        suggestions:[tam[1]+' '+buyukAy],msg:'TDK İmla: Belirli bir tarih bildiren ay adları büyük harfle başlar'});
    }
  }

  // Özel isimlere gelen çekim ekleri kesme işaretiyle ayrılır (TDK İmla)
  const properRx=new RegExp(WB+'([a-zA-ZığüşöçİĞÜŞÖÇ]{3,})(nın|nin|nun|nün|nda|nde|ndan|nden|ya|ye|yı|yi|yu|yü|yla|yle|da|de|ta|te|dan|den|tan|ten|ın|in|un|ün)'+WE,'gi');
  let pm;
  while((pm=properRx.exec(text))!==null){
    const full=pm[0];
    const base=pm[1];
    const suf=tl(pm[2]);
    const lbase=tl(base);
    if(PROPER_BASES.has(lbase)&&ok(pm.index,pm.index+full.length)){
      const properName=PROPER_BASES.get(lbase);
      push({
        type:'suggest',
        word:full,
        start:pm.index,
        end:pm.index+full.length,
        suggestions:[properName+"'"+suf],
        msg:`TDK İmla: Özel ada ("${properName}") gelen ek kesme işaretiyle ayrılmalıdır`
      });
    }
  }

  // Yapım eki almış özel adlara gelen çekim ekleri kesme işaretiyle ayrılmaz (Türkçede, Türkçenin, Türklüğün vb.)
  const yapimKesmeRx=new RegExp(WB+'(Türkçe|Türklük|Türklüğ|Avrupalı|Amerikalı|İstanbullu|Ankaralı|İzmirli)[\'\\u2019](nın|nin|nun|nün|nda|nde|ndan|nden|ya|ye|yı|yi|yu|yü|yla|yle|da|de|ta|te|dan|den|tan|ten|ın|in|un|ün|mız|miz|muz|müz|mızda|mizde|mızdan|mizden|mıza|mize|mızı|mizi)'+WE,'gi');
  let ykm;
  while((ykm=yapimKesmeRx.exec(text))!==null){
    const full=ykm[0];
    const base=tu(tl(ykm[1]));
    const suf=tl(ykm[2]);
    if(ok(ykm.index,ykm.index+full.length)){
      push({
        type:'punct',
        word:full,
        start:ykm.index,
        end:ykm.index+full.length,
        suggestions:[base+suf],
        msg:`TDK İmla: Yapım eki almış özel adlara ("${base}") gelen ekler kesme işaretiyle ayrılmaz`
      });
    }
  }

  // 6. Öneriler

  const OPEN_TRANSPARENT=/["'“‘«\(\[\{\-–—]/;
  let ss=true;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(ss&&/[a-zığüşöç]/.test(c)){
      const u=tu(c);
      if(u!==c&&ok(i,i+1)){
        let isStart=true;
        let lb=i-1;
        while(lb>=0&&(/\s/.test(text[lb])||OPEN_TRANSPARENT.test(text[lb]))) lb--;
        if(lb>=0&&text[lb]==='.'){
          const pw=text.slice(0,lb).match(/[\wığüşöçİĞÜŞÖÇ]+$/);
          if(pw&&ABBRS.has(tl(pw[0]))) isStart=false;
          if(pw&&/^\d{1,3}$/.test(pw[0])) isStart=false;
          if(/\d/.test(text[lb-1])&&/\d/.test(c)) isStart=false;
        }
        if(lb>=0&&text[lb]===':') isStart=false;
        if(isStart) push({type:'suggest',word:c,start:i,end:i+1,
          suggestions:[u],msg:'Cümle başı büyük harfle yazılmalıdır'});
      }
      ss=false;
    } else if(/[.!?]/.test(c)){
      let isEnd=true;
      if(c==='.'){
        const pw=text.slice(0,i).match(/[\wığüşöçİĞÜŞÖÇ]+$/);
        if(pw&&ABBRS.has(tl(pw[0]))) isEnd=false;
        if(pw&&/^\d{1,3}$/.test(pw[0])) isEnd=false;
        if(/\d/.test(text[i-1])&&/\d/.test(text[i+1])) isEnd=false;
      }
      if(isEnd) ss=true;
    } else if(!/\s/.test(c)){
      if(!(ss&&OPEN_TRANSPARENT.test(c))) ss=false;
    }
  }

  const r7=new RegExp(WB+'([A-ZİĞÜŞÖÇ]{2,}|\\d+)(nın|nin|nun|nün|nda|nde|ndan|nden|ya|ye|yı|yi|yu|yü|yla|yle|da|de|ta|te|dan|den|tan|ten|ın|in|un|ün)'+WE,'g');
  while((m=r7.exec(text))!==null){
    const prev=m.index>0?text[m.index-1]:null;
    if(prev==="'"||prev==='\u2019') continue;
    if(!ok(m.index,m.index+m[0].length)) continue;
    const isNum=/^\d+$/.test(m[1]);
    const finalSuf=isNum?normalizeNumberSuffix(m[1],m[2]):m[2];
    push({type:'suggest',word:m[0],start:m.index,end:m.index+m[0].length,
      suggestions:[m[1]+"'"+finalSuf],
      msg:(isNum?'Sayı':'Kısaltma')+' ekinden önce kesme işareti gereklidir'});
  }

  // Büyük harfli kısaltmalara gelen eklerin son harfin okunuşuna göre denetimi (TDK: TDK'den, TÜBİTAK'ta, THY'de vb.)
  const ABBR_SUFFIX_MAP=new Map([
    ['TDK', {da:'de',de:'de',ta:'te',te:'te',dan:'den',den:'den',tan:'ten',ten:'ten',nın:'nin',nin:'nin',ya:'ye',ye:'ye',yı:'yi',yi:'yi'}],
    ['THY', {da:'de',de:'de',ta:'te',te:'te',dan:'den',den:'den',tan:'ten',ten:'ten',nın:'nin',nin:'nin',ya:'ye',ye:'ye',yı:'yi',yi:'yi'}],
    ['TRT', {da:'de',de:'de',ta:'te',te:'te',dan:'den',den:'den',tan:'ten',ten:'ten',nın:'nin',nin:'nin',ya:'ye',ye:'ye',yı:'yi',yi:'yi'}],
    ['TBMM', {da:'de',de:'de',ta:'te',te:'te',dan:'den',den:'den',tan:'ten',ten:'ten',nın:'nin',nin:'nin',ya:'ye',ye:'ye',yı:'yi',yi:'yi'}],
    ['TÜBİTAK', {da:'ta',de:'ta',te:'ta',ta:'ta',dan:'tan',den:'tan',tan:'tan',ten:'tan',nın:'ın',nin:'ın'}],
    ['ABD', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['AB', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['BM', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['NATO', {de:'da',te:'da',den:'dan',ten:'dan',nin:'nun',ye:'ya'}],
    ['SGK', {da:'de',de:'de',ta:'te',te:'te',dan:'den',den:'den',tan:'ten',ten:'ten',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['ÖSYM', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['KPSS', {da:'de',de:'de',ta:'te',te:'te',dan:'den',den:'den',tan:'ten',ten:'ten',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['YKS', {da:'de',de:'de',ta:'te',te:'te',dan:'den',den:'den',tan:'ten',ten:'ten',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['KDV', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['ÖTV', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['TCMB', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['MEB', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'in',nin:'in',ya:'e',ye:'e',a:'e',e:'e'}],
    ['YSK', {da:'de',de:'de',ta:'te',te:'te',dan:'den',den:'den',tan:'ten',ten:'ten',nın:'nin',nin:'nin',ya:'ye',ye:'ye'}],
    ['AFAD', {de:'da',te:'da',ta:'da',den:'dan',ten:'dan',tan:'dan',nin:'ın',nın:'ın',e:'a',ye:'a'}],
    ['İTÜ', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'nün',nin:'nün',ya:'ye',ye:'ye'}],
    ['ODTÜ', {da:'de',de:'de',ta:'de',te:'de',dan:'den',den:'den',tan:'den',ten:'den',nın:'nün',nin:'nün',ya:'ye',ye:'ye'}],
    ['RTÜK', {da:'te',de:'te',ta:'te',te:'te',dan:'ten',den:'ten',tan:'ten',ten:'ten',nın:'ün',nin:'ün'}]
  ]);
  const abbrSufRx=new RegExp(WB+'([A-ZİĞÜŞÖÇ]{2,})[\'\\u2019]([a-zığüşöç]+)'+WE,'g');
  let asm;
  while((asm=abbrSufRx.exec(text))!==null){
    const abbr=asm[1];
    const suf=tl(asm[2]);
    const table=ABBR_SUFFIX_MAP.get(abbr);
    if(table&&table[suf]&&table[suf]!==suf&&ok(asm.index,asm.index+asm[0].length)){
      const expectedSuf=table[suf];
      push({
        type:'gram',
        word:asm[0],
        start:asm.index,
        end:asm.index+asm[0].length,
        suggestions:[`${abbr}'${expectedSuf}`],
        msg:`TDK İmla: "${abbr}" kısaltmasının okunuşuna göre ek "'${expectedSuf}" olmalıdır`,
        detail:`TDK kuralına göre büyük harfle yapılan kısaltmalara getirilen eklerde kısaltmanın son harfinin okunuşu esas alınır.`
      });
    }
  }

  {
    const trimmed=text.replace(/\s+$/,'');
    let endPos=trimmed.length;
    while(endPos>0&&/[)\]"'»"'\u2019]/.test(trimmed[endPos-1])) endPos--;
    const lastCh=trimmed[endPos-1];
    if(lastCh&&/[\wığüşöçİĞÜŞÖÇ]/.test(lastCh)&&ok(endPos-1,endPos)){
      const lastSent=(trimmed.split(/[.!?\n]/).pop()||'');
      const isQ=new RegExp(WB+'(mı|mi|mu|mü|mısın|misin|musun|müsün|mıyız|miyiz|muyuz|müyüz|mısınız|misiniz|musunuz|müsünüz)'+WE,'i').test(lastSent);
      const sugs=isQ?[lastCh+'?',lastCh+'.',lastCh+'!']:[lastCh+'.',lastCh+'!',lastCh+'?'];
      push({type:'punct',word:lastCh,start:endPos-1,end:endPos,
        suggestions:sugs,
        msg:'Metin bir noktalama işaretiyle bitmelidir (., !, ?)'});
    }
  }

  // 10. Akıcılık Uyarısı: Aşırı Uzun Cümle Tespiti (35+ kelime)
  {
    const sents = [];
    let sStart = 0;
    let inSent = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (!inSent && !/\s/.test(c)) {
        sStart = i;
        inSent = true;
      }
      if (inSent) {
        let isEnd = false;
        if (c === '\n' && text[i + 1] === '\n') {
          isEnd = true;
        } else if (c === '!' || c === '?') {
          isEnd = true;
        } else if (c === '.') {
          isEnd = true;
          const pw = text.slice(0, i).match(/[\wığüşöçİĞÜŞÖÇ]+$/);
          if (pw && ABBRS.has(tl(pw[0]))) isEnd = false;
          if (pw && /^\d{1,3}$/.test(pw[0])) isEnd = false;
          if (/\d/.test(text[i - 1]) && /\d/.test(text[i + 1])) isEnd = false;
        }
        if (isEnd || i === text.length - 1) {
          const sEnd = isEnd ? i + 1 : text.length;
          const sentStr = text.slice(sStart, sEnd);
          sents.push({ start: sStart, end: sEnd, text: sentStr });
          inSent = false;
          if (c === '\n' && text[i + 1] === '\n') {
            i++;
          }
        }
      }
    }

    for (const sent of sents) {
      const wMatches = sent.text.match(/[\wığüşöçİĞÜŞÖÇ]+(?:['\u2019][\wığüşöçİĞÜŞÖÇ]+)*/g) || [];
      if (wMatches.length >= 35) {
        const m = sent.text.match(/^\s*([\wığüşöçİĞÜŞÖÇ]+(?:['\u2019][\wığüşöçİĞÜŞÖÇ]+)*(?:\s+[\wığüşöçİĞÜŞÖÇ]+(?:['\u2019][\wığüşöçİĞÜŞÖÇ]+)*){0,2})/u);
        let tStart = sent.start;
        let tEnd = sent.start + (m ? m[0].length : 10);
        let disp = (m ? m[1] : wMatches.slice(0, 3).join(' ')) + '...';

        if (!ok(tStart, tEnd)) {
          const lastPos = sent.end - 1;
          if (ok(lastPos, sent.end)) {
            tStart = lastPos;
            tEnd = sent.end;
          }
        }

        if (ok(tStart, tEnd)) {
          push({
            type: 'warn',
            word: disp,
            start: tStart,
            end: tEnd,
            suggestions: [],
            msg: `Akıcılık Uyarısı: Bu cümle ${wMatches.length} kelime içeriyor (aşırı uzun)`,
            detail: 'Türkçe dil yapısında cümlenin 35 kelimeden uzun olması yükleme ulaşmayı ve anlamsal takibi zorlaştırır. Okunabilirliği artırmak için cümleyi ikiye bölmeyi düşünebilirsiniz.'
          });
        }
      }
    }
  }

  issues.sort((a,b)=>a.start-b.start);
  return issues;
}

function computeWordDiff(orig,curr){
  if(orig===curr) return [];
  const a=orig.match(/([a-zA-ZığüşöçİĞÜŞÖÇ0-9]+(?:['\u2019][a-zA-ZığüşöçİĞÜŞÖÇ0-9]+)*|[^\s\wığüşöçİĞÜŞÖÇ]+|\s+)/gu)||[];
  const b=curr.match(/([a-zA-ZığüşöçİĞÜŞÖÇ0-9]+(?:['\u2019][a-zA-ZığüşöçİĞÜŞÖÇ0-9]+)*|[^\s\wığüşöçİĞÜŞÖÇ]+|\s+)/gu)||[];
  let start=0;
  while(start<a.length&&start<b.length&&a[start]===b[start]) start++;
  let endA=a.length-1,endB=b.length-1;
  while(endA>=start&&endB>=start&&a[endA]===b[endB]){ endA--; endB--; }
  const prefix=a.slice(0,start).map(t=>({type:'eq',val:t}));
  const suffix=a.slice(endA+1).map(t=>({type:'eq',val:t}));
  const midA=a.slice(start,endA+1);
  const midB=b.slice(start,endB+1);
  const midDiff=[];
  if(!midA.length){
    for(const t of midB) midDiff.push({type:'ins',val:t});
  } else if(!midB.length){
    for(const t of midA) midDiff.push({type:'del',val:t});
  } else {
    const n=midA.length,m=midB.length;
    if((n+1)*(m+1)>2000000){
      for(const t of midA) midDiff.push({type:'del',val:t});
      for(const t of midB) midDiff.push({type:'ins',val:t});
    } else {
      const dp=new Uint16Array((n+1)*(m+1));
      const stride=m+1;
      for(let i=1;i<=n;i++){
        const row=i*stride,prevRow=(i-1)*stride;
        const tA=midA[i-1];
        for(let j=1;j<=m;j++){
          dp[row+j]=(tA===midB[j-1])?dp[prevRow+j-1]+1:Math.max(dp[prevRow+j],dp[row+j-1]);
        }
      }
      let i=n,j=m;
      const rev=[];
      while(i>0||j>0){
        if(i>0&&j>0&&midA[i-1]===midB[j-1]){
          rev.push({type:'eq',val:midA[i-1]});
          i--;j--;
        } else if(j>0&&(i===0||dp[i*stride+(j-1)]>=dp[(i-1)*stride+j])){
          rev.push({type:'ins',val:midB[j-1]});
          j--;
        } else {
          rev.push({type:'del',val:midA[i-1]});
          i--;
        }
      }
      rev.reverse();
      midDiff.push(...rev);
    }
  }
  const all=prefix.concat(midDiff,suffix);
  const merged=[];
  for(const item of all){
    if(merged.length&&merged[merged.length-1].type===item.type){
      merged[merged.length-1].val+=item.val;
    } else {
      merged.push({type:item.type,val:item.val});
    }
  }
  return merged;
}

const TYEngine={tl,tu,tuAll,esc,WB,WE,wb,ABBRS,SPELL,DEDA,KI,WARNS,PROPER_BASES,STOP_WORDS,personAgrees,getLastVowel,convertCase,cleanText,findAndReplace,computeReadability,getNumberPhonology,normalizeNumberSuffix,analyze,computeWordDiff};
if(typeof window!=='undefined') window.TYEngine=TYEngine;
if(typeof globalThis!=='undefined') globalThis.TYEngine=TYEngine;
if(typeof module!=='undefined'&&module.exports) module.exports=TYEngine;
})();
