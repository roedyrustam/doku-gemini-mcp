#!/usr/bin/env node

/**
 * Static Security & Anti-Tamper Auditor for DOKU Integrations
 * Verifies AGENTS.md and doku-security-rules.md compliance
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Running DOKU Security & Rule Audit...\n');

let violations = 0;

function checkRule(name, condition, errorMsg) {
  if (!condition) {
    console.error(`❌ [FAIL] ${name}: ${errorMsg}`);
    violations++;
  } else {
    console.log(`✅ [PASS] ${name}`);
  }
}

// 1. Audit signer.ts for timingSafeEqual
const signerPath = path.resolve('src/core/signer.ts');
if (fs.existsSync(signerPath)) {
  const signerContent = fs.readFileSync(signerPath, 'utf8');
  checkRule(
    'Rule: timingSafeEqual in Webhook Verification',
    signerContent.includes('crypto.timingSafeEqual'),
    'src/core/signer.ts must use crypto.timingSafeEqual to prevent side-channel timing attacks.'
  );

  checkRule(
    'Rule: ISO8601 Timestamp without milliseconds',
    signerContent.includes(".replace(/\\.\\d{3}Z$/, 'Z')"),
    'Timestamp generator must strip milliseconds to match DOKU UTC ISO8601 specification.'
  );

  checkRule(
    'Rule: Signature Component String format',
    signerContent.includes('Client-Id:') && signerContent.includes('Request-Target:') && !signerContent.includes('\\n"\\n'),
    'Component string must strictly follow DOKU specification without trailing newline.'
  );
} else {
  checkRule('Signer Engine Check', false, 'src/core/signer.ts not found.');
}

// 2. Audit client.ts for Sandbox Defaulting
const clientPath = path.resolve('src/core/client.ts');
if (fs.existsSync(clientPath)) {
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  checkRule(
    'Rule: Sandbox Defaulting Invariant',
    clientContent.includes('DOKU_SANDBOX_BASE_URL') &&
      clientContent.includes("process.env.DOKU_IS_PRODUCTION === 'true'"),
    'Client must strictly default to Sandbox unless DOKU_IS_PRODUCTION is explicitly set to true.'
  );
} else {
  checkRule('Client Engine Check', false, 'src/core/client.ts not found.');
}

// 3. Scan for hardcoded credentials in source files
const sourceFiles = [
  'src/index.ts',
  'src/core/client.ts',
  'src/core/signer.ts',
  'src/core/constants.ts',
];

let foundHardcodedKeys = false;
for (const file of sourceFiles) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (
      /(?:CLIENT_ID\s*=\s*['"][a-zA-Z0-9_-]{10,}['"])|(?:SECRET_KEY\s*=\s*['"][a-zA-Z0-9_-]{10,}['"])/i.test(
        content
      )
    ) {
      foundHardcodedKeys = true;
      console.error(`❌ Hardcoded API key detected in ${file}!`);
    }
  }
}

checkRule(
  'Rule: Zero Hardcoded API Keys',
  !foundHardcodedKeys,
  'Do not commit hardcoded DOKU credentials in source code.'
);

// 4. Manifest version alignment
const pluginJson = JSON.parse(fs.readFileSync('plugin.json', 'utf8'));
const geminiJson = JSON.parse(fs.readFileSync('gemini-extension.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

checkRule(
  'Rule: Manifest Version Alignment',
  pluginJson.version === geminiJson.version && pluginJson.version === packageJson.version,
  `Versions do not match: plugin.json (${pluginJson.version}), gemini-extension.json (${geminiJson.version}), package.json (${packageJson.version})`
);

console.log('\n----------------------------------------');
if (violations > 0) {
  console.error(`🚨 Security Audit Failed with ${violations} violation(s).`);
  process.exit(1);
} else {
  console.log('🎉 All Security & Implementation Rules Verified Successfully!');
  process.exit(0);
}

