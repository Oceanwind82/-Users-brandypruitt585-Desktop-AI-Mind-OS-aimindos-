#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Start Next.js development server
const next = spawn('node', [
  path.join(__dirname, 'node_modules/next/dist/bin/next'),
  'dev'
], {
  stdio: 'inherit',
  cwd: __dirname
});

next.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
});
