#!/usr/bin/env node
/**
 * ClawDroid — Build & Setup Script
 * Automates the Capacitor Android project setup after npm install.
 *
 * Usage: node scripts/setup-android.js
 */

import { execSync } from 'child_process';
import { existsSync, cpSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function run(cmd, opts = {}) {
  console.log(`\n🦞 Running: ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
}

function main() {
  console.log('═══════════════════════════════════════');
  console.log('  🦞 ClawDroid — Android Setup');
  console.log('═══════════════════════════════════════\n');

  // Step 1: Build the web app
  console.log('📦 Step 1: Building web app...');
  run('npm run build');

  // Step 2: Initialize Capacitor if not already done
  if (!existsSync(join(ROOT, 'node_modules', '@capacitor', 'cli'))) {
    console.log('📥 Installing dependencies...');
    run('npm install');
  }

  // Step 3: Add Android platform
  if (!existsSync(join(ROOT, 'android'))) {
    console.log('📱 Step 2: Adding Android platform...');
    run('npx cap add android');
  }

  // Step 4: Sync web assets to Android
  console.log('🔄 Step 3: Syncing to Android...');
  run('npx cap sync android');

  // Step 5: Copy template files
  console.log('📋 Step 4: Applying Android templates...');
  const templateDir = join(ROOT, 'android-template');
  const androidMain = join(ROOT, 'android', 'app', 'src', 'main');

  if (existsSync(templateDir)) {
    // Copy AndroidManifest.xml
    const manifestSrc = join(templateDir, 'AndroidManifest.xml');
    const manifestDst = join(androidMain, 'AndroidManifest.xml');
    if (existsSync(manifestSrc)) {
      cpSync(manifestSrc, manifestDst, { force: true });
      console.log('  ✓ AndroidManifest.xml applied');
    }

    // Copy network_security_config.xml
    const xmlDir = join(androidMain, 'res', 'xml');
    mkdirSync(xmlDir, { recursive: true });
    const netSrc = join(templateDir, 'network_security_config.xml');
    if (existsSync(netSrc)) {
      cpSync(netSrc, join(xmlDir, 'network_security_config.xml'), { force: true });
      console.log('  ✓ network_security_config.xml applied');
    }

    // Copy file_paths.xml
    const fpSrc = join(templateDir, 'file_paths.xml');
    if (existsSync(fpSrc)) {
      cpSync(fpSrc, join(xmlDir, 'file_paths.xml'), { force: true });
      console.log('  ✓ file_paths.xml applied');
    }

    // Copy styles.xml
    const valuesDir = join(androidMain, 'res', 'values');
    const stylesSrc = join(templateDir, 'styles.xml');
    if (existsSync(stylesSrc)) {
      cpSync(stylesSrc, join(valuesDir, 'styles.xml'), { force: true });
      console.log('  ✓ styles.xml applied');
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  ✅ Android project ready!');
  console.log('═══════════════════════════════════════');
  console.log('\nNext steps:');
  console.log('  1. Open in Android Studio:  npx cap open android');
  console.log('  2. Build APK:               Android Studio → Build → Build APK');
  console.log('  3. Or run on device:         npx cap run android');
  console.log('');
}

main();
