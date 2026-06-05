/**
 * validate.js — Kiểm tra index.html hợp lệ trước khi deploy
 * Thay thế "vite build" cho project static HTML không cần bundler.
 * Dùng: node scripts/validate.js
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const REQUIRED_FILES = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'netlify.toml',
];

const MIN_HTML_SIZE = 100_000; // 100 KB — app đầy đủ phải lớn hơn thế này

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

console.log('\n🔍  Bắt đầu kiểm tra trước khi deploy...\n');

// ── 1. Kiểm tra file bắt buộc tồn tại ─────────────────────────
console.log('📁  File bắt buộc:');
for (const file of REQUIRED_FILES) {
  check(file, existsSync(join(ROOT, file)));
}

// ── 2. Kiểm tra index.html ─────────────────────────────────────
console.log('\n📄  Nội dung index.html:');
const htmlPath = join(ROOT, 'index.html');
if (existsSync(htmlPath)) {
  const html = readFileSync(htmlPath, 'utf8');

  check('Kích thước >= 100 KB', html.length >= MIN_HTML_SIZE,
    `thực tế: ${Math.round(html.length / 1024)} KB`);

  check('Có thẻ <!DOCTYPE html>', html.trimStart().toLowerCase().startsWith('<!doctype html'));

  check('Có thẻ đóng </html>', html.trimEnd().toLowerCase().endsWith('</html>'));

  check('Có thẻ <script> React CDN', html.includes('react.development.js') || html.includes('react.production.min.js') || html.includes('unpkg.com/react') || html.includes('cdn.jsdelivr.net'));

  check('Có </script> cuối cùng', html.includes('</script>'));

  check('Không có localStorage.clear()',
    !html.includes('localStorage.clear()'),
    'Phát hiện lệnh nguy hiểm xóa toàn bộ dữ liệu!');

  check('Có STORAGE_KEY mrcurtain_survey_projects',
    html.includes("mrcurtain_survey_projects"));

  check('Có DATA_VERSION — bảo vệ migration',
    html.includes('DATA_VERSION'));

  check('Có runDataMigration()',
    html.includes('runDataMigration()'));
}

// ── 3. Kiểm tra manifest.json ──────────────────────────────────
console.log('\n📋  manifest.json:');
const manifestPath = join(ROOT, 'manifest.json');
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    check('JSON hợp lệ', true);
    check('Có trường "name"', !!manifest.name);
    check('Có trường "icons"', Array.isArray(manifest.icons) && manifest.icons.length > 0);
  } catch (e) {
    check('JSON hợp lệ', false, e.message);
  }
}

// ── 4. Kết quả ─────────────────────────────────────────────────
console.log(`\n${'─'.repeat(48)}`);
if (failed === 0) {
  console.log(`✅  Tất cả ${passed} kiểm tra đều qua. Sẵn sàng deploy!\n`);
  process.exit(0);
} else {
  console.error(`❌  ${failed} lỗi / ${passed + failed} kiểm tra. Vui lòng sửa trước khi deploy.\n`);
  process.exit(1);
}
