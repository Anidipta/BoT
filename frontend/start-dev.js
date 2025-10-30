#!/usr/bin/env node

/**
 * Start both backend scraper API and frontend dev server
 * Usage: npm run dev:full
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start backend API server
console.log('🚀 Starting backend scraper API on port 8787...');
const backend = spawn('node', [path.join(__dirname, 'api', 'server.js')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/book_of_truth',
    PORT: 8787
  }
});

// Wait a bit for backend to start
setTimeout(() => {
  console.log('🎨 Starting frontend dev server on port 5173...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: true  // Enable shell on Windows to resolve npm properly
  });

  backend.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`);
  });

  frontend.on('exit', (code) => {
    console.log(`Frontend exited with code ${code}`);
    process.exit(code);
  });

  process.on('SIGINT', () => {
    console.log('\n📴 Shutting down...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 2000);

backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
});
