import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const targetPath = resolve(process.cwd(), 'apps/web/src/types/database.types.ts');

try {
  // Try local or linked supabase types generation
  const output = execSync('supabase gen types typescript --linked', {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  if (output && output.includes('Database')) {
    writeFileSync(targetPath, output, 'utf-8');
    console.log('Successfully regenerated Supabase types to apps/web/src/types/database.types.ts');
    process.exit(0);
  }
} catch {
  // If not linked or supabase CLI error, check if file exists
  if (existsSync(targetPath)) {
    console.log(
      'Notice: Supabase project not linked. Keeping verified database.types.ts schema from 0001_init.sql.\nRun "supabase link --project-ref <id>" to link your live project.',
    );
    process.exit(0);
  } else {
    console.error('Error: database.types.ts not found and Supabase is not linked.');
    process.exit(1);
  }
}
