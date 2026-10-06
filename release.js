const fs = require('fs');
const { execSync } = require('child_process');

console.log('[Release] Birim testler çalıştırılıyor...');
try {
  execSync('npm test', { stdio: 'inherit' });
} catch (err) {
  console.error('[Hata] Testler başarısız oldu! Dağıtım durduruldu.');
  process.exit(1);
}

const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const parts = pkg.version.split('.').map(Number);
let [maj, min, patch] = parts;

// Rollover sürüm kuralı: Her basamak 0-9 arasındadır
if (patch < 9) {
  patch++;
} else {
  patch = 0;
  if (min < 9) {
    min++;
  } else {
    min = 0;
    maj++;
  }
}

const nextVersion = [maj, min, patch].join('.');
console.log(`[Release] Sürüm güncelleniyor: ${pkg.version} -> ${nextVersion}`);
pkg.version = nextVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

console.log(`[Release] Başarıyla tamamlandı: v${nextVersion}`);
