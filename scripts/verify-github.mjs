import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to parse key=value from .env files
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed
        .slice(idx + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
  return env;
}

// Check apps/web/.env.local, then root .env, then process.env
const webEnv = loadEnvFile(path.resolve(rootDir, 'apps/web/.env.local'));
const rootEnv = loadEnvFile(path.resolve(rootDir, '.env'));

const token = process.env.GITHUB_TOKEN || webEnv.GITHUB_TOKEN || rootEnv.GITHUB_TOKEN;

console.log('--- Verifying GitHub API Connection ---');

if (!token) {
  console.log('⚠️  No GITHUB_TOKEN found in apps/web/.env.local or environment.');
  console.log('ℹ️  Running unauthenticated (limited to 60 requests/hour).\n');
} else {
  console.log(`🔑 GITHUB_TOKEN detected: ${token.slice(0, 8)}...${token.slice(-4)}\n`);
}

async function verify() {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'RepoMetric-Verifier',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch('https://api.github.com/rate_limit', { headers });

    if (res.status === 401) {
      console.error(
        '❌ GITHUB_TOKEN is invalid or expired. GitHub returned HTTP 401 Unauthorized.',
      );
      console.error('   Please generate a new token and update apps/web/.env.local.');
      process.exit(1);
    }

    if (!res.ok) {
      console.error(`❌ GitHub API returned HTTP ${res.status}: ${res.statusText}`);
      process.exit(1);
    }

    const data = await res.json();
    const core = data.resources?.core;
    const resetDate = new Date(core.reset * 1000).toLocaleTimeString();

    console.log('✅ GitHub API connection successful!');
    console.log(`   Rate Limit Cap: ${core.limit} requests/hour`);
    console.log(`   Remaining:      ${core.remaining} / ${core.limit}`);
    console.log(`   Resets At:      ${resetDate}`);

    if (token && core.limit >= 5000) {
      console.log('\n🎉 Authenticated correctly: Token provides full 5,000 requests/hour limit.');
    } else if (!token) {
      console.log(
        '\n💡 Tip: Add GITHUB_TOKEN to apps/web/.env.local to raise limit from 60 to 5,000/hr.',
      );
    }
  } catch (err) {
    console.error('❌ Network error connecting to GitHub API:', err.message);
    process.exit(1);
  }
}

verify();
