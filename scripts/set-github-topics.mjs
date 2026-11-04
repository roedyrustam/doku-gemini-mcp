#!/usr/bin/env node
import { execSync } from 'node:child_process';
import https from 'node:https';

const TOPICS = [
  'mcp',
  'model-context-protocol',
  'mcp-server',
  'doku',
  'payment-gateway',
  'snap-bi',
  'jokul-api',
  'qris',
  'virtual-account',
  'e-wallet',
  'agentic-commerce',
  'ai-agent',
  'gemini',
  'antigravity',
  'claude-desktop',
  'cursor',
  'fintech',
  'indonesia',
  'checkout',
  'typescript'
];

function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    const creds = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf8'
    });
    const match = creds.match(/password=(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (err) {
    // ignore
  }
  return null;
}

async function setTopics() {
  const token = getGitHubToken();
  if (!token) {
    console.error('❌ Could not obtain GitHub credentials from environment or git credential helper.');
    process.exit(1);
  }

  const payload = JSON.stringify({ names: TOPICS });
  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/roedyrustam/doku-gemini-mcp/topics',
    method: 'PUT',
    headers: {
      'User-Agent': 'doku-gemini-mcp-topic-updater',
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  console.log(`🚀 Sending ${TOPICS.length} topics to GitHub repository roedyrustam/doku-gemini-mcp...`);

  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const data = JSON.parse(responseData);
        console.log('✅ Topics successfully updated on GitHub!');
        console.log('Current topics:', data.names);
      } else {
        console.error(`❌ GitHub API Error [HTTP ${res.statusCode}]:`, responseData);
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Network request error:', e.message);
    process.exit(1);
  });

  req.write(payload);
  req.end();
}

setTopics();

