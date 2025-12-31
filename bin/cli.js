#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const RATEL_PATH = path.resolve(__dirname, '../../ratel-cli/target/debug/ratel-cli.exe');

try {
    console.log("[cdd-node] Starting pre-audit tasks...");
    
    // Call to Rust binary with the 'run' command
    const scenarioPath = "tests/ratel/security.ratel";
    console.log(`[cdd-node] Calling ratel-cli at: ${RATEL_PATH}`);

    const outputVersion = execSync(`"${RATEL_PATH}" -V`).toString();
    console.log(`[cdd-node] Ratel version: ${outputVersion.trim()}`);
    
    // We execute and retrieve the JSON
    const output = execSync(`"${RATEL_PATH}" run ${scenarioPath}`).toString();
    
    // Cleaning the output (to ignore Rust logs and keep only the JSON)
    const jsonStart = output.indexOf('{');
    const jsonOutput = output.substring(jsonStart);
    const report = JSON.parse(jsonOutput);

    // Displaying results
    console.log(`\nAudit Success: ${report.name}`);
    report.steps.forEach(step => {
        console.log(`\nStep: ${step.title}`);
        step.results.forEach(res => {
            console.log(`   [${res.status}] ${res.kind}: ${res.message}`);
        });
    });

} catch (error) {
    console.error("\n❌ Audit Failed");
    console.error(error.stdout ? error.stdout.toString() : error.message);
    process.exit(1);
}