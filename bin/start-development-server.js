#!/usr/bin/env node

const resolve = require('resolve')

const broccoliPath = resolve.sync('broccoli', {
  basedir: process.cwd()
});

const broccoli = require(broccoliPath);
broccoli.cli();

process.on('SIGINT', function() {
  console.log("Stopping server...");
  process.exit();
});
