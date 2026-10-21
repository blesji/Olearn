import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const androidDir = path.join(projectRoot, 'android');

// Resolve JAVA_HOME if not already in environment
if (!process.env.JAVA_HOME) {
  const candidateJdks = [
    'C:\\Program Files\\Android\\Android Studio\\jbr',
    'C:\\Program Files\\Android\\Android Studio\\jre',
    path.join(process.env.LOCALAPPDATA || '', 'Android', 'Android Studio', 'jbr')
  ];

  for (const candidate of candidateJdks) {
    if (fs.existsSync(candidate)) {
      process.env.JAVA_HOME = candidate;
      process.env.PATH = `${path.join(candidate, 'bin')};${process.env.PATH}`;
      break;
    }
  }
}

const isWindows = process.platform === 'win32';
const gradlewCmd = isWindows ? path.join(androidDir, 'gradlew.bat') : './gradlew';

console.log('\n[OLearn] Building Android debug APK...');
const result = spawnSync(gradlewCmd, ['assembleDebug'], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: isWindows,
  env: process.env
});

if (result.status !== 0) {
  console.error('\n[OLearn] Build failed with exit code:', result.status);
  process.exit(result.status || 1);
}

const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (fs.existsSync(apkPath)) {
  const stats = fs.statSync(apkPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n========================================`);
  console.log(`✓ APK successfully built!`);
  console.log(`  File: ${apkPath}`);
  console.log(`  Size: ${sizeMb} MB`);
  console.log(`========================================\n`);
} else {
  console.log('\n[OLearn] Build succeeded, but APK file was not found at standard path.');
}
