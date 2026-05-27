/**
 * deploy-update.js — Tự động validate → git add → commit → push
 *
 * Cách dùng:
 *   npm run deploy:update                         (đọc message từ .pending-commit-message)
 *   npm run deploy:update -- "feat: mo ta thay doi"  (truyền message trực tiếp)
 *
 * Quy định an toàn tuyệt đối:
 *   - KHÔNG dùng git push --force
 *   - KHÔNG dùng git reset --hard
 *   - KHÔNG dùng git clean -fd
 *   - KHÔNG xóa file project
 *   - KHÔNG đụng localStorage
 */

import { execSync }          from 'child_process';
import { existsSync,
         readFileSync,
         writeFileSync,
         appendFileSync,
         mkdirSync }         from 'fs';
import { join, dirname }     from 'path';
import { fileURLToPath }     from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const LOG_FILE  = join(ROOT, 'logs', 'diagnose-log.txt');
const MSG_FILE  = join(ROOT, 'scripts', '.pending-commit-message');

// ── Tiện ích ────────────────────────────────────────────────────

function now() {
  return new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: opts.silent ? 'pipe' : 'inherit',
    ...opts,
  });
}

function runSilent(cmd) {
  try { return { ok: true,  out: run(cmd, { silent: true }).trim() }; }
  catch (e) { return { ok: false, out: e.stdout?.trim() || '', err: e.stderr?.trim() || e.message }; }
}

function log(lines) {
  mkdirSync(join(ROOT, 'logs'), { recursive: true });
  appendFileSync(LOG_FILE, lines + '\n', 'utf8');
}

function abort(reason, context = {}) {
  const section = [
    `\n${'='.repeat(60)}`,
    `[${now()}] ❌  LỖI DEPLOY`,
    `Lý do : ${reason}`,
    ...Object.entries(context).map(([k, v]) => `${k.padEnd(14)}: ${v}`),
    '='.repeat(60),
  ].join('\n');

  log(section);
  console.error('\n' + section);
  console.error('\n👉  Xem chi tiết tại: logs/diagnose-log.txt\n');
  process.exit(1);
}

// ── Đọc commit message ──────────────────────────────────────────

let commitMsg = process.argv.slice(2).join(' ').trim();

if (!commitMsg && existsSync(MSG_FILE)) {
  commitMsg = readFileSync(MSG_FILE, 'utf8').trim();
  console.log(`📝  Dùng commit message từ .pending-commit-message:\n    "${commitMsg}"`);
}

if (!commitMsg) {
  commitMsg = `chore: cap nhat app ${new Date().toLocaleDateString('vi-VN')}`;
  console.log(`📝  Không có commit message — dùng mặc định:\n    "${commitMsg}"`);
}

// ── Bước 1: Validate ────────────────────────────────────────────

console.log('\n🔍  Bước 1/4 — Kiểm tra file trước khi deploy...');
const validateResult = runSilent('node scripts/validate.js');

if (!validateResult.ok) {
  abort('Validate thất bại — không deploy', {
    'validate log': validateResult.out || validateResult.err,
    'commit msg'  : commitMsg,
  });
}
console.log('✅  Validate qua toàn bộ kiểm tra.');

// ── Bước 2: git status ──────────────────────────────────────────

console.log('\n📋  Bước 2/4 — Kiểm tra git status...');
const statusResult = runSilent('git status --porcelain');

if (!statusResult.ok) {
  abort('Không thể chạy git status', { error: statusResult.err });
}

if (!statusResult.out) {
  // Kiểm tra xem có commit chưa push không
  const aheadResult = runSilent('git status -sb');
  const isAhead = aheadResult.out && aheadResult.out.includes('ahead');
  if (isAhead) {
    console.log('ℹ️   Không có thay đổi mới — nhưng có commit chưa push. Tiến hành push...');
    const pushNow = runSilent('git push');
    if (!pushNow.ok) {
      abort('git push thất bại (unpushed commits)', { error: pushNow.err });
    }
    console.log('✅  Đã push commit còn tồn đọng lên GitHub.');
    console.log('\n🌐  Netlify sẽ tự deploy trong ~30 giây.\n');
    process.exit(0);
  }
  console.log('ℹ️   Không có thay đổi nào để commit. Bỏ qua.\n');
  if (existsSync(MSG_FILE)) { try { import('fs').then(f => f.unlinkSync(MSG_FILE)); } catch {} }
  process.exit(0);
}

console.log('📁  File đã thay đổi:');
statusResult.out.split('\n').forEach(l => console.log('    ' + l));

// ── Bước 3: git add + commit ────────────────────────────────────

console.log('\n➕  Bước 3/4 — git add + commit...');

const addResult = runSilent('git add .');
if (!addResult.ok) {
  abort('git add thất bại', { error: addResult.err, files: statusResult.out });
}

const commitResult = runSilent(`git commit -m "${commitMsg.replace(/"/g, "'")}"`);
if (!commitResult.ok) {
  // Nếu "nothing to commit" thì không phải lỗi thật
  if (commitResult.err.includes('nothing to commit') || commitResult.out.includes('nothing to commit')) {
    console.log('ℹ️   Không có thay đổi mới để commit.');
    process.exit(0);
  }
  abort('git commit thất bại', { error: commitResult.err, message: commitMsg });
}
console.log(`✅  Commit thành công: "${commitMsg}"`);

// ── Bước 4: git push ────────────────────────────────────────────

console.log('\n🚀  Bước 4/4 — git push lên GitHub...');
const pushResult = runSilent('git push');

if (!pushResult.ok) {
  const errMsg = pushResult.err || pushResult.out;

  // Phân loại lỗi để báo rõ ràng
  let hint = '';
  if (errMsg.includes('403') || errMsg.includes('Authentication') || errMsg.includes('credentials')) {
    hint = 'Lỗi xác thực GitHub. Cần chạy lại lệnh push thủ công với token hợp lệ.';
  } else if (errMsg.includes('rejected') || errMsg.includes('non-fast-forward')) {
    hint = 'Branch bị xung đột. Chạy: git pull origin main --rebase  rồi push lại.';
  } else if (errMsg.includes('proxy') || errMsg.includes('unable to access')) {
    hint = 'Lỗi mạng/proxy. Kiểm tra kết nối internet rồi thử lại.';
  }

  abort('git push thất bại — code đã commit local, chưa lên GitHub', {
    'lỗi'          : errMsg.slice(0, 300),
    'gợi ý'        : hint,
    'commit msg'   : commitMsg,
    'branch'       : runSilent('git branch --show-current').out,
    'remote'       : runSilent('git remote -v').out.split('\n')[0],
  });
}

// ── Hoàn thành ──────────────────────────────────────────────────

// Xóa pending message sau khi push thành công
if (existsSync(MSG_FILE)) {
  try { execSync(`node -e "import('fs').then(f=>f.default.unlinkSync('${MSG_FILE.replace(/\\/g, '\\\\')}'))"`, { cwd: ROOT }); }
  catch { /* bỏ qua nếu xóa không được */ }
}

const successLog = [
  `\n${'─'.repeat(60)}`,
  `[${now()}] ✅  DEPLOY THÀNH CÔNG`,
  `Commit  : ${commitMsg}`,
  `Branch  : ${runSilent('git branch --show-current').out}`,
  `Hash    : ${runSilent('git log --oneline -1').out}`,
  `Remote  : ${runSilent('git remote get-url origin').out}`,
  `Netlify : tự deploy từ branch main (~30 giây)`,
  '─'.repeat(60),
].join('\n');

log(successLog);
console.log(successLog);
console.log('\n🌐  Netlify sẽ tự deploy trong ~30 giây.\n');
