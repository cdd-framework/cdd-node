#!/usr/bin/env node

const { attack } = require('../index');
const pc = require('picocolors');

const target = process.argv[2];

if (!target) {
    console.log(`${pc.red('✘')} Error: Please provide a target URL.`);
    console.log(`${pc.gray('Usage:')} cdd <url>`);
    process.exit(1);
}

attack(target).catch((err) => {
    process.exit(1);
});