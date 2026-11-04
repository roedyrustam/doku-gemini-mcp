#!/usr/bin/env node

/**
 * Project Tech Stack Detector for DOKU Integrations
 * Scans workspace root and saves .doku-config.json
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Scanning workspace for project tech stack...\n');

const cwd = process.cwd();

let language = 'unknown';
let framework = 'unknown';
let packageManager = 'unknown';

// 1. Detect Package Manager
if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
  packageManager = 'pnpm';
} else if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) {
  packageManager = 'bun';
} else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
  packageManager = 'yarn';
} else if (fs.existsSync(path.join(cwd, 'package-lock.json'))) {
  packageManager = 'npm';
}

// 2. Detect Language & Framework
if (fs.existsSync(path.join(cwd, 'package.json'))) {
  language = fs.existsSync(path.join(cwd, 'tsconfig.json'))
    ? 'typescript'
    : 'javascript';

  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    if (allDeps['next']) framework = 'nextjs';
    else if (allDeps['@nestjs/core']) framework = 'nestjs';
    else if (allDeps['hono']) framework = 'hono';
    else if (allDeps['fastify']) framework = 'fastify';
    else if (allDeps['express']) framework = 'express';
    else framework = 'node-native';
  } catch {
    framework = 'node';
  }
} else if (
  fs.existsSync(path.join(cwd, 'requirements.txt')) ||
  fs.existsSync(path.join(cwd, 'pyproject.toml'))
) {
  language = 'python';
  packageManager = fs.existsSync(path.join(cwd, 'uv.lock'))
    ? 'uv'
    : fs.existsSync(path.join(cwd, 'poetry.lock'))
    ? 'poetry'
    : 'pip';

  if (fs.existsSync(path.join(cwd, 'pyproject.toml'))) {
    const pyContent = fs.readFileSync(path.join(cwd, 'pyproject.toml'), 'utf8');
    if (pyContent.includes('fastapi')) framework = 'fastapi';
    else if (pyContent.includes('django')) framework = 'django';
    else if (pyContent.includes('flask')) framework = 'flask';
  }
} else if (fs.existsSync(path.join(cwd, 'go.mod'))) {
  language = 'go';
  packageManager = 'go';
  const goMod = fs.readFileSync(path.join(cwd, 'go.mod'), 'utf8');
  if (goMod.includes('github.com/gin-gonic/gin')) framework = 'gin';
  else if (goMod.includes('github.com/labstack/echo')) framework = 'echo';
  else if (goMod.includes('github.com/gofiber/fiber')) framework = 'fiber';
  else framework = 'net/http';
} else if (fs.existsSync(path.join(cwd, 'composer.json'))) {
  language = 'php';
  packageManager = 'composer';
  const composer = fs.readFileSync(path.join(cwd, 'composer.json'), 'utf8');
  if (composer.includes('laravel/framework')) framework = 'laravel';
  else framework = 'php-vanilla';
}

const hasEnv = fs.existsSync(path.join(cwd, '.env'));

const config = {
  stack: {
    language,
    framework,
    packageManager,
    hasEnv,
  },
  doku: {
    isProduction: false,
    apiVersion: 'v2',
    snapVersion: 'v1.0',
    simulatorUrl: 'https://sandbox.doku.com/gtw-config-v2/simulator',
  },
  timestamp: new Date().toISOString(),
};

const configPath = path.join(cwd, '.doku-config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log('✅ Tech Stack Detected:');
console.log(`   - Language:        ${language}`);
console.log(`   - Framework:       ${framework}`);
console.log(`   - Package Manager: ${packageManager}`);
console.log(`   - Has .env:        ${hasEnv}`);
console.log(`\n📄 Configuration saved to: ${configPath}`);

