/**
 * deploy-update.js
 * validate -> git add -> commit -> push
 */

import { execSync }       from 'child_process';
import { existsSync, readFileSync, appendFileSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname }  from 'path';
import { fileURLToPath }  from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const LOG_FILE  = join(ROOT, 'logs', 'diagnose-log.txt');
const MSG_FILE  = join(ROOT, 'scripts', '.pending-commit-message');

function now() {
  return new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}
function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: opts.silent ? 'pipe' : 'inherit', ...opts });
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
    `[${now()}] LỖI DEPLOY`,
    `Ly do : ${reason}`,
    ...Object.entries(context).map(([k, v]) => `${k.padEnd(14)}: ${v}`),
    '='.repeat(60),
  ].join('\n');
  log(section);
  console.error('\n' + section);
  console.error('\n Chi tiet tai: logs/diagnose-log.txt\n');
  process.exit(1);
}

// Lock files to clear
const LOCKS = [
  'HEAD.lock', 'index.lock',
  join('objects', 'maintenance.lock'),
  join('refs', 'heads', 'main.lock'),
];
function clearLocks() {
  LOCKS.forEach(l => { try { unlinkSync(join(ROOT, '.git', l)); } catch {} });
}
function repairIndex() {
  const r = runSilent('git read-tree HEAD');
  if (!r.ok) abort('Cannot repair git index', { error: r.err });
  console.log('Index repaired.');
}
function isIndexCorrupt(result) {
  return !result.ok && (
    result.err.includes('index file corrupt') ||
    result.err.includes('bad signature')
  );
}

// Commit message
let commitMsg = process.argv.slice(2).join(' ').trim();
if (!commitMsg && existsSync(MSG_FILE)) {
  commitMsg = readFileSync(MSG_FILE, 'utf8').trim();
  console.log(`Commit message: "${commitMsg}"`);
}
if (!commitMsg) {
  commitMsg = `chore: cap nhat app ${new Date().toLocaleDateString('vi-VN')}`;
}

// Step 1: Validate
console.log('\nBuoc 1/4 - Validate...');
const val = runSilent('node scripts/validate.js');
if (!val.ok) abort('Validate that bai', { log: val.out || val.err });
console.log('Validate OK.');

// Step 2: Clear locks + repair index if corrupt + git status
console.log('\nBuoc 2/4 - Git status...');
clearLocks();
const pre = runSilent('git status --porcelain');
if (isIndexCorrupt(pre)) { console.log('Index corrupt - repairing...'); repairIndex(); }

const statusResult = runSilent('git status --porcelain');
if (!statusResult.ok) abort('git status that bai', { error: statusResult.err });

if (!statusResult.out) {
  const ahead = runSilent('git status -sb');
  if (ahead.out && ahead.out.includes('ahead')) {
    console.log('Co commit chua push - dang push...');
    const p = runSilent('git push');
    if (!p.ok) abort('git push that bai', { error: p.err });
    console.log('Push thanh cong.');
    console.log('\nNetlify tu deploy trong ~30 giay.\n');
    process.exit(0);
  }
  console.log('Khong co thay doi de commit.\n');
  process.exit(0);
}
console.log('File thay doi:');
statusResult.out.split('\n').forEach(l => console.log('  ' + l));

// Step 3: git add + commit
console.log('\nBuoc 3/4 - git add + commit...');
clearLocks();

let addResult = runSilent('git add .');
if (isIndexCorrupt(addResult)) {
  console.log('Index corrupt khi add - repairing...');
  repairIndex();
  addResult = runSilent('git add .');
}
if (!addResult.ok) abort('git add that bai', { error: addResult.err });

clearLocks();

const commitResult = runSilent(`git commit -m "${commitMsg.replace(/"/g, "'")}"`);
if (!commitResult.ok) {
  if (commitResult.err.includes('nothing to commit') || commitResult.out.includes('nothing to commit')) {
    console.log('Khong co thay doi moi de commit.');
    process.exit(0);
  }
  abort('git commit that bai', { error: commitResult.err, message: commitMsg });
}
console.log(`Commit OK: "${commitMsg}"`);

// Step 4: git push
console.log('\nBuoc 4/4 - git push...');
const pushResult = runSilent('git push');
if (!pushResult.ok) {
  const errMsg = pushResult.err || pushResult.out;
  let hint = '';
  if (errMsg.includes('403') || errMsg.includes('Authentication')) hint = 'Auth error - check GitHub token.';
  else if (errMsg.includes('rejected') || errMsg.includes('non-fast-forward')) hint = 'Conflict - run: git pull --rebase then push.';
  else if (errMsg.includes('proxy') || errMsg.includes('unable to access')) hint = 'Network error - check connection.';
  abort('git push that bai - code da commit local, chua len GitHub', {
    loi    : errMsg.slice(0, 300),
    hint   : hint,
    commit : commitMsg,
    branch : runSilent('git branch --show-current').out,
    remote : runSilent('git remote -v').out.split('\n')[0],
  });
}

// Done
const successLog = [
  `\n${'─'.repeat(60)}`,
  `[${now()}] DEPLOY THANH CONG`,
  `Commit  : ${commitMsg}`,
  `Branch  : ${runSilent('git branch --show-current').out}`,
  `Hash    : ${runSilent('git log --oneline -1').out}`,
  `Remote  : ${runSilent('git remote get-url origin').out}`,
  `Netlify : tu deploy tu branch main (~30 giay)`,
  '─'.repeat(60),
].join('\n');
log(successLog);
console.log(successLog);
console.log('\nNetlify tu deploy trong ~30 giay.\n');
