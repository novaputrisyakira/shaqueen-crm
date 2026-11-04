#!/usr/bin/env node
import { execSync } from 'child_process';
import readline from 'readline';

const GIT_CMD_PATH = 'C:\\Users\\Thinkpad\\.gemini\\antigravity\\scratch\\git\\cmd';
const GIT_UCRT_PATH = 'C:\\Users\\Thinkpad\\.gemini\\antigravity\\scratch\\git\\ucrt64\\bin';
process.env.PATH = `${GIT_CMD_PATH};${GIT_UCRT_PATH};${process.env.PATH || ''}`;

function runGit(cmd) {
  return execSync(`git ${cmd}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

async function githubApi(endpoint, token, options = {}) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Shaqueen-CRM-Pusher',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function autoPush(token, repoName = 'shaqueen-crm', isPrivate = false) {
  console.log('\n======================================================');
  console.log('   SHAQUEEN FOOD CRM - SINKRONISASI OTOMATIS GITHUB');
  console.log('======================================================\n');
  console.log('1. Memverifikasi token autentikasi GitHub...');
  
  const userRes = await githubApi('/user', token);
  if (!userRes.ok || !userRes.data?.login) {
    console.error('❌ Gagal mengautentikasi dengan token GitHub.');
    console.error('Status:', userRes.status, userRes.data?.message || 'Token tidak valid atau telah kedaluwarsa.');
    return false;
  }

  const username = userRes.data.login;
  console.log(`✅ Terhubung sebagai akun GitHub: @${username} (${userRes.data.name || username})`);

  console.log(`\n2. Memeriksa keberadaan repository: ${username}/${repoName}...`);
  const repoCheck = await githubApi(`/repos/${username}/${repoName}`, token);
  
  if (repoCheck.status === 404) {
    console.log(`Repository belum ada di GitHub. Membuat repository baru '${repoName}' secara otomatis...`);
    const createRes = await githubApi('/user/repos', token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: repoName,
        description: 'Sistem CRM dan Manajemen Operasional Shaqueen Food',
        private: isPrivate,
        auto_init: false
      })
    });
    if (!createRes.ok) {
      console.error('❌ Gagal membuat repository otomatis:', createRes.data?.message);
      return false;
    }
    console.log(`✅ Berhasil membuat repository baru: https://github.com/${username}/${repoName}`);
  } else if (repoCheck.ok) {
    console.log(`✅ Repository '${repoName}' sudah tersedia di GitHub.`);
  } else {
    console.error('❌ Gagal memeriksa repository:', repoCheck.data?.message);
    return false;
  }

  console.log('\n3. Menyiapkan remote Git lokal & sinkronisasi berkas...');
  try {
    try {
      const status = runGit('status --porcelain');
      if (status) {
        console.log('Menyimpan perubahan berkas lokal ke Git...');
        runGit('add -A');
        runGit('commit -m "fix(data): ensure permanent 0 transactions and prevent rehydration on load and reload"');
      }
    } catch (_) {}

    try { runGit('remote remove origin'); } catch (_) {}
    
    // Add remote with token for authenticated push
    const authRemoteUrl = `https://x-access-token:${encodeURIComponent(token)}@github.com/${username}/${repoName}.git`;
    runGit(`remote add origin ${authRemoteUrl}`);
    runGit('branch -M main');
    
    console.log('4. Mengirim seluruh kode ke GitHub (git push -u origin main)...');
    runGit('push -u origin main --force');
    
    // Clean up remote URL so token is not stored in plaintext .git/config
    const cleanRemoteUrl = `https://github.com/${username}/${repoName}.git`;
    runGit(`remote set-url origin ${cleanRemoteUrl}`);
    
    console.log('\n======================================================');
    console.log('🎉 SUKSES! Seluruh kode Shaqueen Food berhasil di-push!');
    console.log(`🔗 URL Repository: https://github.com/${username}/${repoName}`);
    console.log('======================================================\n');
    return true;
  } catch (err) {
    console.error('❌ Error saat push ke Git:', err.message || err);
    // Ensure clean remote on error
    try {
      runGit(`remote set-url origin https://github.com/${username}/${repoName}.git`);
    } catch (_) {}
    return false;
  }
}

function cleanToken(rawToken) {
  if (!rawToken) return '';
  return rawToken.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
}

async function main() {
  const args = process.argv.slice(2);
  let token = cleanToken(process.env.GITHUB_TOKEN || '');
  let repoName = 'shaqueen-crm';
  let isPrivate = false;

  for (const arg of args) {
    if (arg.startsWith('--token=')) token = cleanToken(arg.slice(8));
    if (arg.startsWith('--repo=')) repoName = arg.slice(7).trim();
    if (arg === '--private') isPrivate = true;
  }

  if (token) {
    const success = await autoPush(token, repoName, isPrivate);
    process.exit(success ? 0 : 1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const authUrl = 'https://github.com/settings/tokens/new?scopes=repo&description=Shaqueen+Food+CRM';

  console.log('======================================================');
  console.log('      SHAQUEEN FOOD CRM - PUSH OTOMATIS GITHUB        ');
  console.log('======================================================');
  console.log('Silakan buat Personal Access Token (PAT) GitHub dengan scope "repo" di:');
  console.log(`👉 ${authUrl}\n`);

  try {
    if (process.platform === 'win32') {
      execSync(`start "" "${authUrl}"`, { stdio: 'ignore' });
      console.log('🌐 Membuka peramban (browser) otomatis ke halaman otorisasi GitHub...\n');
    } else if (process.platform === 'darwin') {
      execSync(`open "${authUrl}"`, { stdio: 'ignore' });
      console.log('🌐 Membuka peramban (browser) otomatis ke halaman otorisasi GitHub...\n');
    } else if (process.platform === 'linux') {
      execSync(`xdg-open "${authUrl}"`, { stdio: 'ignore' });
      console.log('🌐 Membuka peramban (browser) otomatis ke halaman otorisasi GitHub...\n');
    }
  } catch (_) {}

  rl.question('Masukkan Personal Access Token (PAT) GitHub Anda: ', async (inputToken) => {
    rl.close();
    inputToken = cleanToken(inputToken);
    if (!inputToken) {
      console.error('❌ Token tidak boleh kosong.');
      process.exit(1);
    }
    const success = await autoPush(inputToken, repoName, isPrivate);
    process.exit(success ? 0 : 1);
  });
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
