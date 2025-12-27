const { execFile} = require('child_process');
const path = require('path');
const os = require('os');
const Table = require('cli-table3');
const pc = require('picocolors');

// locate the binary
const binaryName = os.platform() === 'win32' ? 'cdd-core.exe' : 'cdd-core';
const binaryPath = path.join(__dirname, 'bin', binaryName)

function attack(targetUrl, options = {}) {
    return new Promise((resolve, reject) => {
        console.log(pc.gray(`\n[${new Date().toLocaleTimeString()}] `) + pc.cyan('Initializing CDD Engine...'));

        execFile(binaryPath, [targetUrl], (error, stdout, stderr) => {
            if(error) {
                console.log(`[Rust kernel] An error occurred - ${error.message}`);
                return reject(error);
            }

            // retrieve the json result from stdout
            try {
                const data = JSON.parse(stdout);

                if (data.error) {
                    printError(data.error);
                } else {
                    printReport(data);
                }
                resolve(data);
            } catch (parseError) {
                console.error(pc.red('[Rust kernel] Failed to parse output'), stdout);
                reject(parseError);
            }
        })
    });
}

function printReport(report) {
    console.log(`\n${pc.bgCyan(pc.black(' CDD SECURITY REPORT '))} ${pc.bold(report.target)}`);

    const table = new Table({
        head: [pc.gray('ID'), pc.gray('Security Test'), pc.gray('Status'), pc.gray('Details')],
        colWidths: [5, 35, 12, 45],
        wordWrap: true,
        style: {
            head: [],
            border: ['gray'] 
        }
    });

    report.tests.forEach((test, index) => {
        let statusIcon;
        let statusText;

        switch (test.status) {
            case 'Secure':
                statusIcon = pc.green('✔');
                statusText = pc.green('SECURE');
                break;
            case 'Vulnerable':
                statusIcon = pc.red('✘');
                statusText = pc.red('VULN');
                break;
            case 'Warning':
                statusIcon = pc.yellow('⚠');
                statusText = pc.yellow('WARN');
                break;
        }

        table.push([
            pc.gray(index + 1),
            pc.white(pc.bold(test.name)),
            statusText,
            pc.gray(test.description)
        ]);
    });

    console.log(table.toString());
    console.log(`${pc.cyan('»')} Execution finished. Found ${pc.red(report.tests.filter(t => t.status === 'Vulnerable').length)} vulnerabilities.\n`);
}

function printError(err) {
    console.log(`\n${pc.bgRed(pc.white(' ENGINE ERROR '))} ${pc.red(err.code)}`);
    console.log(`${pc.red('│')} ${pc.white(err.message)}`);
    console.log(`${pc.red('└─')} ${pc.gray('Please verify your input and connectivity.')}\n`);
}

// lauch the test
if(require.main === module) {
    attack('http://fabiomeyer.com').then(result => {
        console.log(`\n---- response from Rust kernel ----\n`);
        console.log(result);
    }).catch(err => {
        console.error('Attack failed:', err);
    });
}

module.exports = {
    attack
};