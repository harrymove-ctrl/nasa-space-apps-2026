import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const project1Dir = path.resolve(__dirname, '..');
const project2Dir = path.resolve(project1Dir, '..', 'project_2');
const project2Pkg = path.join(project2Dir, 'package.json');
const targetDir = path.join(project1Dir, 'public', 'cradleflow');

if (!fs.existsSync(project2Pkg)) {
  console.log('sync-cradleflow: ../../project_2 not present in build context, skipping local sync.');
  process.exit(0);
}

execFileSync('bun', ['run', 'build'], {
  cwd: project2Dir,
  env: {
    ...process.env,
    VITE_BASE_PATH: '/cradleflow/',
  },
  stdio: 'inherit',
});

const distDir = path.join(project2Dir, 'dist');
fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(targetDir), { recursive: true });
fs.cpSync(distDir, targetDir, { recursive: true });
console.log(`sync-cradleflow: synced ${distDir} -> ${targetDir}`);
