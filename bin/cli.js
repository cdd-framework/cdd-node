#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const pc = require('picocolors');
const { printReport, printError } = require('./reporter');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'init') {
    console.log(pc.cyan("🐾 [cdd-node] Initializing Node.js security project..."));
    
    const testDir = path.join(process.cwd(), 'tests', 'ratel');
    const filePath = path.join(testDir, 'security.ratel');

    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }

    const defaultScenario = `SCENARIO "Default Node Audit"
TARGET "http://localhost:8080"
WITH_SCOPE KERNEL

STEP "Base Verification"
    ATTACK secure_headers
    CHECK response.status BE 200`;

    fs.writeFileSync(filePath, defaultScenario);
    console.log(pc.green(`Created: ${filePath}`));
    
    // We call here the ratel-cli to generate the ratel.yaml for integrity
    try {
        execSync('ratel init', { stdio: 'inherit' });
    } catch (e) {
        console.log(pc.yellow("⚠️  Note: 'ratel' binary not found. Please install it via install.sh for full integrity features."));
    }
    process.exit(0);
}

// --- DYNAMIC PROXY LOGIC (npx cdd-framework <any>) ---
if (!command) {
    console.log(pc.red("No command provided. Usage: npx cdd-framework <command>"));
    process.exit(1);
}

try {
    console.log(pc.gray(`📡 [cdd-node] Routing command '${command}' to Ratel-CLI...`));
    
    // We pass all received arguments directly to the 'ratel' binary
    const rawOutput = execSync(`ratel ${args.join(' ')}`, { stdio: ['inherit', 'pipe', 'inherit'] }).toString();

    // If the command was 'run', we try to display the nice table
    if (command === 'run') {
        const jsonStart = rawOutput.indexOf('{');
        if (jsonStart !== -1) {
            const report = JSON.parse(rawOutput.substring(jsonStart));
            printReport(report); // Use the table rendering function
        }
    } else {
        // For other commands (version, check), just display the raw output
        console.log(rawOutput);
    }

} catch (error) {
    printError({ code: "EXEC_ERROR", message: "Ratel execution failed. Is the binary installed?" });
    process.exit(1);
}